/* jshint node: true */
'use strict';

var express = require('express');
var platsModel = require('../models/quberModels').platsModel;
var cors = require('cors');

var routerPlats = express.Router();
var verification = require('../verification');
var hateoasLinker = require('express-hateoas-links');

const whitelist = ['https://www.delirescalade.com','https://www.chess.com','https://cegepgarneau.omnivox.ca'];
const corsOption = {
    origin: function (origin, callback){
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }else {
            callback(new Error ('Not allowed bo CORS'));
        }
    },
};

routerPlats.use(hateoasLinker);

routerPlats.use(function (req, res, next){
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

routerPlats.route('/')
    .get(cors(corsOption), function (req,res){
        platsModel.find({}, function(err, plats){
            if (err)  res.status(400).send("erreur recherche plats");
            var resBody = [];
            plats.forEach(plat => {
                var links =[
                    {rel: "self",method: "GET",href: req.protocol + '://' + req.get('host')+'/'+plat._id.toString()},
                    {rel: "delete",method: "DELETE",href: req.protocol + '://' + req.get('host')+'/'+plat._id.toString()}
                ];
                var platToJson = plat.toJSON();
                var platsLink = {
                    plat : platToJson,
                    links
                };
                resBody.push(platsLink);
            });
            plats.sort();
            res.json(resBody);
        });
    })
    .post(function (req,res){
        console.log('Création d\'un plat');
        var nouveauPlat = new platsModel(req.body);
        nouveauPlat.save(function (err) {
            if (err) res.status(400).send("erreur creation plats");
            res.setHeader('Location', req.protocol + '://' + req.get('host') + '/plats/' + nouveauPlat._id);
            res.status(201).json(nouveauPlat,[
            {rel: "self",method: "GET",href: req.protocol + '://' + req.get('host') + '/plats/'+nouveauPlat._id.toString()},
            {rel: "delete",method: "DELETE",href: req.protocol + '://' + req.get('host') + '/plats/'+nouveauPlat._id.toString()}
        ]);
        });
    })
    .all( function(req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

routerPlats.route('/:plats_id')
    .get( function (req,res){
        var id = req.params.plats_id;
        console.log('consultation du plat : ' + id);
        platsModel.findById(id, function(err, plat){
        if(err) res.status(400).send("erreur recherche plats par id");
        if(plat) res.status(200).json(plat, [
            {rel: "delete",method: "DELETE",href: req.protocol + '://' + req.get('host')+ id}
        ]);
        else res.status(404).end();
        });
    })
    .delete( function (req,res){
        var id = req.params.plats_id;
        console.log('Suppression du plat : ' + id);
        platsModel.findByIdAndDelete(id, function (err) {
            if (err) res.status(400).send("erreur suppression plats");
            res.status(204).end();
        });
    })
    .all(function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

module.exports = routerPlats;