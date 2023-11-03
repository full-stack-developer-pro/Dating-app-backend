// models/Admin.js
const mongoose = require('mongoose');
const uuid = require('uuid');

const adminSchema = new mongoose.Schema({
    credits: {
        type: Number,
       
    },
    currency: {
        type: String,
       
    },
    price: {
        type: Number,
       
    },
    bonus: {
        type: String,
      
    }
});

module.exports = mongoose.model('credit', adminSchema);

