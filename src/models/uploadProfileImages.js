const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
 
  is_verified: { type: Boolean, default: false },
  images: Array,
});

module.exports = mongoose.model('Profile', profileSchema);
