// models/Admin.js
const mongoose = require('mongoose');
const uuid = require('uuid');

const adminSchema = new mongoose.Schema({
    heading: {
        type: String,

    },
    description: {
        type: String,

    },
    images:{
        type: Array,

    }
});

module.exports = mongoose.model('blog', adminSchema);

