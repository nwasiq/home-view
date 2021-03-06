'use strict';

const User = require('./models/user');
const Global = require('./models/global');

const fs = require('fs');
const path = require('path');
const filesUpload = require('../utils/uploadFiles');
const config = require('../config/database');
const baseURL = "http://13.57.59.4:3000";
const jwt = require('jsonwebtoken');
const serverFilesPath = './public/uploads/';



exports.register = function (req, res) {
    var newUser = new User(req.body);
    var username = req.body.username;

    newUser.counter = 0;

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

exports.uploadFiles = function (req, res) {
    filesUpload.uploadFiles(req, res, (err) => {

        if (err) {
            res.json({
                success: false,
                msg: "upload failed",
                err: err
            });
        }
        // else{
        //     console.log(req.files.marker[0]);
        // }
        else {
            if (req.files.marker == undefined || req.files.fbx == undefined) {
                res.json({
                    success: false,
                    msg: "please select both files"
                });
            } else {
                User.findOne(req.user._id, function (err, user) {
                    user.counter += 1;
                    var fbxLink = baseURL + `/uploads/${req.files.fbx[0].filename}`;
                    var markerLink = baseURL + `/uploads/${req.files.marker[0].filename}`;
                    user.fbx.push(fbxLink);
                    user.markers.push(markerLink);
                    user.save(function (err, user) {
                        if (err) throw err;

                        var globalFiles = new Global({
                            marker: markerLink,
                            fbx: fbxLink
                        })

                        globalFiles.save(function (err, file){

                            if(err) throw err;

                            res.json({
                                success: true,
                                msg: "files uploaded successfully"
                            })


                        });
                    });
                });
            }
        }

    });
}

exports.getAllMarkers = function(req, res){

    if (req.get('authentication-key') == null || req.get('authentication-key') != config.adminAuthenticationKey) {
        res.json({
            success: false,
            msg: "unauthorized access"
        });
        return;
    }

    Global.find({}, function(err, files){
        if(err) throw err;
        var userMarkers = [];
        if(files.length == 0){
            res.json({
                success: false,
                msg: "No markers found"
            });
            return;
        }

        for(var i = 0; i < files.length; i++){
            userMarkers[i] = files[i].marker;
        }

        res.json({
            success: true,
            markers: userMarkers
        });
    })
}

exports.getFbxForMarker = function(req, res){

    if (req.get('authentication-key') == null || req.get('authentication-key') != config.adminAuthenticationKey) {
        res.json({
            success: false,
            msg: "unauthorized access"
        });
        return;
    }

    // const marker = "marker_5b4a09a5a849ff0a8c867428-1.jpg";
    const marker = req.body.marker;
    var fbxFinder = marker.split("_");
    fbxFinder = fbxFinder[1].split(".");
    fbxFinder = fbxFinder[0];

    Global.findOne({ fbx: { $regex: fbxFinder } }, function (err, fbx) {

        if(err) throw err;
        if(!fbx){
            res.json({
                success:false,
                msg: "No fbx found for the marker"
            });
            return;
        }

        res.json({
            success: true,
            fbxLink: fbx.fbx
        });

    });

}

exports.deleteUserFiles = function (req, res) {
    User.findOne(req.user._id, function (err, user) {
        if (err) throw err;

        fs.readdir(serverFilesPath, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(serverFilesPath, file), err => {
                    if (err) throw err;
                });
            }

            user.fbx = [];
            user.markers = [];
            user.counter = 0;
            user.save(function (err) {
                if (err) throw err;
                res.json({
                    success: true,
                    msg: "files cleared"
                });
            })
        });
    });
}

exports.deleteAllFiles = function (req, res){

    if (req.get('authentication-key') == null || req.get('authentication-key') != config.adminAuthenticationKey) {
        res.json({
            success: false,
            msg: "unauthorized access"
        });
        return;
    }
    Global.remove({}, function (err, files) {
        if (err) throw err;
        res.json({
            success: true,
            msg: "All files removed"
        })
    })
}
