'use strict';
const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = function (app) {

    var controller = require('./controller');

    app.route('/register')
        .post(controller.register);

    app.route('/login')
        .post(controller.login);

    app.route('/add-image')
        .post(passport.authenticate('jwt', {
            failureRedirect: '/authfailurejson',
            session: false
        }), controller.uploadImage);

    // app.route('/add-fbx')
    //     .post(passport.authenticate('jwt', {
    //         failureRedirect: '/authfailurejson',
    //         session: false
    //     }), controller.uploadFbx);

    // app.route('/get-images')
    //     .get(passport.authenticate('jwt', {
    //         failureRedirect: '/authfailurejson',
    //         session: false
    //     }), controller.getImages);

    // app.route('/get-fbx')
    //     .get(passport.authenticate('jwt', {
    //         failureRedirect: '/authfailurejson',
    //         session: false
    //     }), controller.getFbxFiles);

    app.get('/authfailurejson', function (req, res) {
        res.json({
            success: false,
            message: 'authorization failed'
        });
    });

}