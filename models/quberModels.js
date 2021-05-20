/* jshint node: true */
'use strict';

var mongoose = require('mongoose');

var livreurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    Voiture: { type: String, required: true },
    Quartier: { type: String, required: true }
});

var usagerSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    adresse: { type: String, required: true },
    pseudo: { type: String, required: true },
    motDePasse: { type: String, required: true }
});

var platsSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    nbrPortons:{ type: Number, required: true, default: 1 }
});

var commandeSchema = new mongoose.Schema({
    dateArrivee: {type: Date, required:false},
    livreur: {type: livreurSchema, required:false},
    usager: {type: usagerSchema, required:true},
    plats: [{type: platsSchema, required:false}]
});

module.exports.commandeModel = mongoose.model('Commandes', commandeSchema);
module.exports.livreurModel = mongoose.model('livreur', livreurSchema);
module.exports.usagerModel = mongoose.model('usager', usagerSchema);
module.exports.platsModel = mongoose.model('plat', platsSchema);
