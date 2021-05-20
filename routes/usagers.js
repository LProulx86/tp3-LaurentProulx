/* jshint node: true */
'use strict';

var express = require('express');

var routerUsager = express.Router();

var mongoose = require('mongoose');

var verification = require('../verification');

mongoose.connect('mongodb://localhost:27017/quber', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

var usagerModel = require('../models/quberModels').usagerModel;


routerUsager.use(function (req, res, next){
    console.log(req.method, req.url);
    var bAuth = false;
    verification.auth.verifierAuthentification(req, function( isAuth, token) {
        if (isAuth) {
            bAuth = true;
            req.bAuth = bAuth;
            req.jeton = token;
            console.log("Jeton : " + JSON.stringify(token));
            next();
        }
        else{
            req.bAuth = bAuth;
            next();
        }
    
    });
});

routerUsager.route('/')
    .post(async function (req, res){
        var username = req.body.pseudo;
        var query = {pseudo: username};
        var pseudoExist;
        await usagerModel.findOne(query, function (err, utilisateur) {
            if (err) throw err;
            pseudoExist = utilisateur;
        });
        if (!pseudoExist){
            var nouveauUser = new usagerModel(req.body);
            nouveauUser.save(function(err){
            if (err) throw err;
            res.setHeader('Location', req.protocol + '://' + req.get('host') + '/usagers/' + nouveauUser._id); 
            res.status(201).json(nouveauUser);
            });
        }
        else{
            res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
            res.status(409).send('Le pseudo existe déjà');
        }
    }).all(function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

routerUsager.route('/:usager_id')
    .get(function (req,res){
        if (!req.bAuth){
            res.status(401).end();
        }
        else{
            var id = req.params.usager_id;
            if (req.jeton.user === id){
                console.log('consultation de l\'usager : ' + id);
                usagerModel.findById(id, function(err, user){
                if(err) throw err;
                if(user) res.json(user);
                else {
                    res.status(404).end();
                }
                });
            }
            else{
                res.status(401).end();
            }
        }
    })
    .delete(function (req,res){
        var id = req.params.usager_id;
        console.log('Suppression usager : ' + id);
        usagerModel.findByIdAndDelete(id, function (err) {
            if (err) throw err;
            res.status(204).end();
        });
    })
    .all(function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

module.exports = routerUsager;