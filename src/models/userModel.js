const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    is_fake : {
        type : Boolean,
    },
    name: {
        type : String,
    },
    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true, 
    },
    password: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['male', 'female','all'], 
    },
    age: {
        type : Number,
    },
    birthdate: {
        type : Date,
    },
    description : {
        type : String,
    },
    country: {
        type : String,
    },
    city: {
        type : String,
    },
    postcode: {
        type : String,
    },
    timezone: {
        type : Object,
    },
    height: {
        type : Number,
    },
    weight: {
        type : Number,
    },
    eye_color: {
        type : String,
    },
    hair_color: {
        type : String,
    },
    hair_length: {
        type : String,
    },
    marital_status: {
        type : String,
    },
    interests: {
        type : [String],
    },
    credits : {
        type : Number,
    },
    free_message: {
        type : String,
    },
    is_verified: {
        type : Boolean,
    },
    is_flagged: {
        type : Boolean,
    },
    ip_address: {
        type: String,
    },
    lastLoginIP: {
        type: String, 
    },
    role:{
        type:String
    },
    friends:{
      type:Object,
    },
    active: {
        type: Boolean,
        default: true, 
    },
    inactive: {
        type: Boolean,
        default: false, 
    },
}, 
{
    timestamps: true,
});

module.exports= new mongoose.model('User',userSchema)


