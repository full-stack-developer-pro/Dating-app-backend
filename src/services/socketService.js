const connectedUsers = {};
const socketIo = require('socket.io');
const chatModel = require("../models/chatModel");
const redis = require('ioredis');

let io; 

function initializeSocketServer(server) {
  io = socketIo(server, { cors: { origin: '*' } }); 

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user_added', (userId) => {
      connectedUsers[userId] = socket.id;
    });

    socket.on('chat_message', async (data) => {
      try {
        const newChat = new chatModel({
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
        });

        const savedChat = await newChat.save();

        const receiverSocketId = await redis.get(data.receiverSocketId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('chat_message', savedChat);
        } else {
          
        }
      } catch (error) {
        console.error(error);
        socket.emit('chat_error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = {
  initializeSocketServer,
  getSocketIO: () => io, 
};



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



