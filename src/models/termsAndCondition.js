// models/Admin.js
const mongoose = require('mongoose');
const uuid = require('uuid');

const adminSchema = new mongoose.Schema({
    heading: {
        type: String,

    },
    description: {
        type: String,

    }
});

module.exports = mongoose.model('termsAndConditon', adminSchema);

