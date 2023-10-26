// models/Admin.js
const mongoose = require('mongoose');
const uuid = require('uuid');

const adminSchema = new mongoose.Schema({
    facebook: {
        type: String,

    },
    linkedin: {
        type: String,

    },
    twitter: {
        type: String,

    },
    instagram: {
        type: String,

    },
    snapchat: {
        type: String,

    }
});

module.exports = mongoose.model('socialLink', adminSchema);

