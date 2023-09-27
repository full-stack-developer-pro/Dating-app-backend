const socketIo = require('socket.io');
const chatModel = require("../models/chatModel");

function initializeSocketServer(server) {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', async (data) => { 
      try {
        const newChat = new chatModel({
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message ,
          createdBy: data.senderId 
        });

        const savedChat = await newChat.save();

        // Emit the chat message to the receiver's socket
        io.to(data.receiverSocketId).emit('chat message', savedChat);
      } catch (error) {
        console.error(error);
        socket.emit('chat error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = initializeSocketServer;

// API endpoint to list users a person has chatted with

module.exports.getChattedUsers =  async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'userId is a required query parameter' });
  }

  try {
    const uniqueUsers = await chatModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }]
      })
      .distinct('senderId receiverId')
      .exec();

    res.json(uniqueUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// get Chats

module.exports.getChats = async (req, res) => {
  const senderId = req.query.senderId;
  const receiverId = req.query.receiverId;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'senderId and receiverId are required query parameters' });
  }

  try {
    const chats = await chatModel
      .find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      })
      .sort({ createdAt: 'desc' })
      .exec();

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



