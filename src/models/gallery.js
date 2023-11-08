const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    is_verified: {
        type: Boolean,
        default: false
    },
    images: [{
        path: String,
        url: String,
    }]
});

module.exports = mongoose.model('Gallery', gallerySchema);


