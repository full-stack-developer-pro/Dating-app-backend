// models/Admin.js
const mongoose = require('mongoose');
const uuid = require('uuid');

const adminSchema = new mongoose.Schema({
   
    Heading: {
        type: String,

    },
    Description: {
        type: String,

    },
    BottomHeading: {
        type: String,

    },
    BottomDescription: {
        type: String,

    }
});

module.exports = mongoose.model('about', adminSchema);

