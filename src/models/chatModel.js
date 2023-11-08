const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messageType: {
    type: String,
    enum: ['text', 'flirt'],
    required: true,
  },
  message: {
    type: String, 
  },
  flirtMessage: {
    type: String, 
  },
},
{
  timestamps: true,
});

module.exports = mongoose.model('chat', chatSchema);
