/* jshint node: true */
'use strict';

var express = require('express');
var livreurModel = require('../models/quberModels').livreurModel;
var verification = require('../verification');

var routerLivreurs = express.Router();

routerLivreurs.use(function (req, res, next){
    console.log(req.method, req.url);
    verification.auth.verifierAuthentification(req, function( isAuth, token) {
        if (!isAuth) {
            res.status(401).end();
        }
        else {
            req.jeton = token;
            console.log("Jeton : " + JSON.stringify(token));
            next();
        }
    });
});

routerLivreurs.route('/')
    .post(function (req,res){
        var nouveauLivreur = new livreurModel(req.body);
        nouveauLivreur.save(function(err){
            if (err) res.status(400).send("erreur creation livreur");
            res.setHeader('Location', req.protocol + '://' + req.get('host') + '/livreurs/' + nouveauLivreur._id); 
            res.status(201).json(nouveauLivreur);
        });
    })
    .all( function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

routerLivreurs.route('/:livreur_id')
    .get(function (req,res){
        var id = req.params.livreur_id;
        console.log('consultation du livreur: ' + id);
        livreurModel.findById(id, function(err, livreur){
        if(err) res.status(404).end();
        if(livreur) res.json(livreur);
        else res.status(404).end();
        });
    })
    .delete(function (req,res){
        var id = req.params.livreur_id;
        console.log('Suppression du livreur : ' + id);
        livreurModel.findByIdAndDelete(id, function (err) {
            if (err)  res.status(400).send("erreur creation livreur");
            res.status(204).end();
        });
    })
    .all( function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

module.exports = routerLivreurs;