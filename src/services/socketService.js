const connectedUsers = {};
const chatModel = require("../models/chatModel");
const redis = require('ioredis');
const mongoose = require('mongoose');
const userModel = require("../models/userModel");
let io; 

function initializeSocketServer(io) {
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user_added', (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`User added with ID: ${userId}`);
    });

    socket.on('chat_message', async (data) => {
      try {
        const senderId = data.senderId;
        const receiverId = data.receiverId;

        const senderUser = await userModel.findById(senderId);

        if (senderUser && senderUser.credits >= 100) {
          senderUser.credits -= 100;
          await senderUser.save();

          const newChat = new chatModel({
            senderId: senderId,
            receiverId: receiverId,
            message: data.message,
            userId: data.userId,
          });

          await newChat.save();

          if (connectedUsers[receiverId]) {
            io.to(connectedUsers[receiverId]).emit('new_message', {
              user_id: senderId,
              chat_id: 1, 
              message: data.message,
            });
          }
        } else {
          socket.emit('chat_error', { message: 'Insufficient credits' });
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

module.exports = initializeSocketServer;




module.exports.getChattedUsers = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'userId is a required query parameter' });
  }

  try {
    const uniqueUsers = await chatModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: null,
          users: { $addToSet: '$senderId' },
          receivers: { $addToSet: '$receiverId' }
        }
      },
      {
        $project: {
          _id: 0, 
          uniqueUsers: { $setUnion: ['$users', '$receivers'] }
        }
      }
    ]).exec();

    let uniqueUsersArray = uniqueUsers.length > 0 ? uniqueUsers[0].uniqueUsers : [];

   
    uniqueUsersArray = uniqueUsersArray.filter(id => id.toString() !== userId);

    const usersWithNames = await userModel.find(
      { _id: { $in: uniqueUsersArray } },
      'name _id'
    ).exec();

    res.json(usersWithNames);
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



