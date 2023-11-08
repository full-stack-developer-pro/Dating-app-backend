const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
 
  is_verified: { type: Boolean, default: false },
  images: {
    type: Array,
},
});

module.exports = mongoose.model('gellery', profileSchema);
