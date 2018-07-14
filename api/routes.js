'use strict';
const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = function (app) {

    var controller = require('./controller');

    app.route('/register')
        .post(controller.register);

    app.route('/login')
        .post(controller.login);

    app.route('/delete-all-files')
        .get(controller.deleteAllFiles);

    app.route('/add-files')
        .post(passport.authenticate('jwt', {
            failureRedirect: '/authfailurejson',
            session: false
        }), controller.uploadFiles);

    app.route('/delete-user-files')
        .get(passport.authenticate('jwt', {
            failureRedirect: '/authfailurejson',
            session: false
        }), controller.deleteUserFiles);

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