/* jshint node: true */
'use strict';

var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var routerBase = express.Router();

var db = require('../models/quberModels').usagerModel;

routerBase.route('/connexions')
.post(async function (req, res){

    var username = req.body.pseudo;
    var query = {pseudo: username};
    var user;
    await db.findOne(query, function (err, utilisateur) {
        if (err) res.status(400).end();
        user = utilisateur;
    });
    console.log(user);
    if(user === null) res.status(400).end();
    if (req.body.motDePasse === user.motDePasse) {
        var payload = { user: user._id };
        var jwtToken = jwt.sign(payload, req.app.get('secret'), {
            expiresIn: 86400
        });
        res.json({
            "token": jwtToken
        });
    } else {
        res.status(400).end();
    }
})
.all( function (req,res){
    res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
    res.status(405).send('Cette méthode n\'est pas disponible');
});

module.exports = routerBase;