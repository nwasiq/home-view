'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var GlobalSchema = new schema({

    marker: String,
    fbx: String


});

const Global = module.exports = mongoose.model('global', GlobalSchema);