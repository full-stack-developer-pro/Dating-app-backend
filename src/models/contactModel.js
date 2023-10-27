// models/Admin.js
const mongoose = require('mongoose');
const uuid = require('uuid');

const adminSchema = new mongoose.Schema({
    lat: {
        type: String,
       
    },
    long: {
        type: String,
       
    },
    address: {
        type: String,
       
    },
    phoneNumber: {
        type: String,
      
    },
    email: {
        type: String,
       
    }
    
});

module.exports = mongoose.model('contact', adminSchema);

