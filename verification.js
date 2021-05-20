var utils = {};
var jwt = require('jsonwebtoken');

utils.verifierAuthentification = function(req, callback) {
    // Récupération du jeton JWT dans l'en-tête HTTP "Authorization".
    var auth = req.headers.authorization;
    if (!auth) {
        console.log('no auth');
        callback(false, null);
    } else {
        console.log("Authorization : " + auth);
        var authArray = auth.split(' ');
        if (authArray.length !== 2) {
            callback(false, null);
        } else {
            var jetonEndode = authArray[1];
            // Vérification du jeton.
            jwt.verify(jetonEndode, req.app.get('secret'), function (err, jetonDecode) {
                if (err) {
                    // Jeton invalide.
                    console.log('err auth');
                    callback(false, null);
                } else {
                    // Jeton valide.
                    console.log('true auth');
                    callback(true, jetonDecode);
                }
            });
        }
    }
};

exports.auth = utils;