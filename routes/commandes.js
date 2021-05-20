/* jshint node: true */
'use strict';

var express = require('express');
var commandeModel = require('../models/quberModels').commandeModel;
var platsModel = require('../models/quberModels').platsModel;
var usagerModel = require('../models/quberModels').usagerModel;
var livreurModel = require('../models/quberModels').livreurModel;


var routerCommandes = express.Router({mergeParams: true});
var verification = require('../verification');
var hateoasLinker = require('express-hateoas-links');

routerCommandes.use(hateoasLinker);

routerCommandes.use(function (req, res, next){
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

routerCommandes.route('/')
    .post( function (req,res){
        var userid = req.params.usager_id;
        if (userid !== req.jeton.user){
            res.status(403).send("Mauvais usager");
        }
        else{
            var nouvelleCommande = new commandeModel({usager: req.body});
            nouvelleCommande.save(function(err){
                if (err) throw err;
                res.setHeader('Location', req.protocol + '://' + req.get('host') + '/usagers/' + userid + '/commandes/' + nouvelleCommande._id); 
                res.status(201).json(nouvelleCommande);
            });
        }
    })
    .all( function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

routerCommandes.route('/:commande_id')
    .get( function(req,res){
        var userid = req.params.usager_id;
        console.log(userid);
        if (userid !== req.jeton.user){
            res.status(403).send("Mauvais usager");
        }
        else{
            var id = req.params.commande_id;
            console.log('consultation de la commande : ' + id);
            commandeModel.findById(id, function(err, commande){
            if(err) res.status(404).end();

            if(commande){
                var resBody = [];
            commande.plats.forEach(plat => {
                var links =[
                    {rel: "self",method: "GET",href: req.protocol + '://' + req.get('host')+plat._id.toString()},
                    {rel: "delete",method: "DELETE",href: req.protocol + '://' + req.get('host')+plat._id.toString()}
                ];
                var platToJson = plat.toJSON();
                var platsLink = {
                    person : platToJson,
                    links
                };
                resBody.push(platsLink);
            });

            commande.plats = resBody;
                res.json(commande); 
            }
            
            else res.status(404).end();
            });
        }
    })
    .put( function(req,res) {
        var userid = req.params.usager_id;
        if (userid !== req.jeton.user){
            res.status(403).send("Mauvais usager");
        }
        else{
            if(req.body.livreur === undefined && req.body.plats === undefined){
                var id = req.params.commande_id;
                commandeModel.findById(id, function (err, commande) {
                    if (err) throw err;
                    if (commande === null) {
                        console.log('(put)Création de la commande, id : ' + id);
                        commande = new commandeModel(req.body);
                        commande.save(function (err) {
                            if (err) throw err;
                            res.setHeader('Location', req.protocol + '://' + req.get('host') + '/usagers/' + userid + '/commandes/' + commande._id);
                            res.status(201).json(commande);
                        });
                    } 
                    else {
                        console.log('(put)modification de la commande, id : ' + id);
                        commandeModel.findByIdAndUpdate(id, req.body, {
                            new: true,
                            runValidators: true
                        }, function (err, commande) {
                            if (err) throw err;
                            res.json(commande);
                        });
                    }
                });
            }
            else {
                res.status(403).send("Vous ne pouvez modifier que la date");
            }
        }
    })
    .delete( function (req,res){
        var userid = req.params.usager_id;
        if (userid !== req.jeton.user){
            res.status(403).send("Mauvais usager");
        }
        else{
            var id = req.params.commande_id;
            console.log('Suppression de la commande : ' + id);
            commandeModel.findByIdAndDelete(id, function (err) {
                if (err) throw err;
                res.status(204).end();
            });
        }
    })
    .all( function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

routerCommandes.route('/:commande_id/livreur')
    .put( function (req,res){
        var userid = req.params.usager_id;
        if (userid !== req.jeton.user){
            res.status(403).send("Mauvais usager");
        }
        else{
            if(req.body.plats === undefined){
                var id = req.params.commande_id;

                commandeModel.findById(id, async function (err, commande) {
                    if (err) throw err;
                    if (commande === null) {
                        res.status(404).send('Une commande doit être créer avant de lui attribué un livreur');
                    }
                    else if (req.body._id === undefined) {
                        console.log('Création d\'un livreur puis attribution du livreur dans la commande');
                        var nouveauLivreur = new livreurModel(req.body);
                        nouveauLivreur.save(function(err,livreur){
                        if (err) throw err;
                        });
                        commande.livreur = nouveauLivreur;
                        commandeModel.findByIdAndUpdate(id, commande, {
                            new: true,
                            runValidators: true
                        }, function (err, commande) {
                            if (err) throw err;
                            res.setHeader('Location', req.protocol + '://' + req.get('host') + '/livreurs/' + nouveauLivreur._id); 
                            res.status(201).json(commande);
                        });
                    }
                    else {
                        console.log('(put)modification de la commande, id : ' + id);
                        var leLivreur = await livreurModel.findById(req.body._id);
                        commande.livreur = leLivreur;
                        commandeModel.findByIdAndUpdate(id, commande, {
                            new: true,
                            runValidators: true
                        }, function (err, commande) {
                            if (err) throw err;
                            res.json(commande);
                        });
                    }
                });
            }
            else {
                res.status(403).send("Vous ne pouvez modifier que la date");
            }
        }
    })
    .all( function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

// TODO: implantation Hateaos
routerCommandes.route('/:commande_id/plats')
    .get( function(req,res){
        var userid = req.params.usager_id;
        if (userid !== req.jeton.user){
            res.status(403).send("Mauvais usager");
        }
        else{
            var id = req.params.commande_id;
            console.log('consultation de la commande : ' + id);
            commandeModel.findById(id, function(err, commande){
            if(err) throw err;
            if(commande) res.json(commande.plats);
            else res.status(404).end();
            });
        }
    })
    .all( function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

routerCommandes.route('/:commande_id/plats/:plats_id')
    .put(async function(req,res){
        var userid = req.params.usager_id;
        var lePlat = await platsModel.findById(req.params.plats_id);
        if (userid !== req.jeton.user){
            res.status(403).send("Mauvais usager");
        }
        else{
            var id = req.params.commande_id;
            console.log(id);
            commandeModel.findById(id, function (err, commande) {
                if (err) throw err;
                if (commande === null) {
                    res.status(404).send('Une commande doit être créer avant de lui attribué un plat');
                }
                else if (lePlat === null) {
                    console.log('Création d\'un plat puis attribution du plat dans la commande');
                    var nouveauPlat = new platsModel(req.body);
                    if (!nouveauPlat){
                        res.status(404).send("Vous devez fournir un body pour pouvoir créer un plat");
                    }
                    nouveauPlat.save(function(err,plat){
                        if (err) throw err;
                    });
                    commande.plats.push(nouveauPlat);
                    commandeModel.findByIdAndUpdate(id, commande, {
                        new: true,
                        runValidators: true
                    }, function (err, commande) {
                        if (err) throw err;
                        res.status(201);
                        res.json(commande);
                    });
                }
                else {
                    console.log('(put)modification de la commande, id : ' + id);
                    commande.plats.push(lePlat);
                    commandeModel.findByIdAndUpdate(id, commande, {
                        new: true,
                        runValidators: true
                    }, function (err, commande) {
                        if (err) throw err;
                        res.json(commande);
                    });
                }
            });
        }
    })
    .delete(async function(req,res){
        var userid = req.params.usager_id;
        if (userid !== req.jeton.user){
            res.status(403).send("Mauvais usager");
        }
        else{
            var id = req.params.commande_id;
            var idplats = req.params.plats_id;
            console.log('Suppression d\'un plat : ' + idplats);
            await commandeModel.findByIdAndUpdate({ _id: id }, { $pull: { plats: {_id:idplats } }});
            res.status(204).end();
        }
    })
    .all( function (req,res){
        res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
        res.status(405).send('Cette méthode n\'est pas disponible');
    });

module.exports = routerCommandes;