const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    path: String,
    url: String,
});

module.exports = mongoose.model('Image', imageSchema);
