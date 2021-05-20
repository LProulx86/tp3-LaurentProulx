/* jshint node: true */
'use strict';

const PORT = process.env.PORT || 8090;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var config = require('./config');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var swaggerUI = require('swagger-ui-express'), swaggerDocument = require('./swagger.json');

app.set('secret', config.secret);

mongoose.connect('mongodb+srv://LaurentP86:X.rrhDNS2ci8Wr-@cluster0.ovxud.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/quber', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

var db = require('./models/quberModels').usagerModel;

var routerBase = require('./routes/base.js');
var routerUsager = require('./routes/usagers.js');
var routerCommandes = require('./routes/commandes.js');
var routerLivreurs = require('./routes/livreurs.js');
var routerPlats = require('./routes/plats.js');

app.use('/', routerBase);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/usagers', routerUsager);
app.use('/usagers/:usager_id/commandes', routerCommandes);
app.use('/livreurs', routerLivreurs);
app.use('/plats', routerPlats);

app.all('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.redirect('/api-docs');
});

app.all('*', function (req, res){
    res.setHeader('Conent-Type', 'text/plain; charset=utf-8');
    res.status(404).send('Erreur 404 : Ressource inexistante !');
});

app.listen(PORT, function () {
    console.log('Serveur sur port ' + this.address().port);
});