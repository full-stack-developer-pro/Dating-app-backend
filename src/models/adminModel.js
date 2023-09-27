// models/Admin.js
const mongoose = require('mongoose');
const uuid = require('uuid');

const adminSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuid.v1,
        unique: true,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple documents with null email values
    },
    password: {
        type: String,
    },
    heading: {
        type: String,
        
    },
    description: {
        type: String,
      
    },
    bottomHeading: {
        type: String,
        
    },
    bottomDescription: {
        type: String,
       
    },
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
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        snapchat: String,
        whatsapp:String
    },
    filename: {
        type: String,
    }
});

module.exports = mongoose.model('Admin', adminSchema);

