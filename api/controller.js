'use strict';

const User = require('./models/user');


const fs = require('fs');
const path = require('path');
const imageUpload = require('../utils/imageUpload');
const fbxUpload = require('../utils/fbxUpload');
const config = require('../config/database');
const baseURL = "http://localhost:3000";
const jwt = require('jsonwebtoken');


exports.register = function (req, res) {
    var newUser = new User(req.body);
    var username = req.body.username;

    User.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (user) {
            res.json({
                success: false,
                msg: "a user with this username already exists"
            })
            return;
        }

        newUser.save(function (err, user) {


            if (err) {
                res.json({
                    success: false,
                    msg: "failed",
                    error: err
                });
            }
            else {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800 // 1 week
                });
                res.json({
                    success: true,
                    token: 'Bearer ' + token,
                    user: user
                });
            }
        });
    });

}

exports.login = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            res.json({ success: false, msg: 'User not found' });
            return;

        }

        var isMatch;

        if (password == user.password)
            isMatch = true;
        else
            isMatch = false;

        if (isMatch) {
            const token = jwt.sign(user.toJSON(), config.secret, {
                expiresIn: 604800 // 1 week
            });

            res.json({
                success: true,
                token: 'Bearer ' + token,
                user: user
            });

        }
        else {
            res.json({ success: false, msg: 'Wrong password' });
        }
    })
}

exports.uploadImage = function (req, res) {
    imageUpload.uploadImage(req, res, (err) => {

        if (err) {
            res.json({
                success: false,
                msg: "upload failed",
                err: err
            });
        }
        else {
            if (req.file == undefined) {
                res.json({
                    success: false,
                    msg: "no image selected"
                });
            } else {
                User.findOne(req.user._id, function (err, user) {
                    var imageLink = baseURL + `/images/${req.file.filename}`;
                    user.pictures.push(imageLink);
                    user.save(function (err, user) {
                        if (err) throw err;

                        res.json({
                            success: true,
                            msg: "Image uploaded successfully"
                        })


                    });
                });
            }
        }

    });
}
