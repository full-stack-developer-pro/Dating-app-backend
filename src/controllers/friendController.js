const friendModel = require('../models/friendModel');
const response = require('../db/dbRes');
const userModel = require("../models/userModel");

module.exports.addFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const { friendId } = req.body; 

    // Check if the friendship already exists
    const existingFriendship = await friendModel.findOne({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId },
      ],
    });

    if (existingFriendship) {
      response.success = false;
      response.message = 'Friendship already exists';
      response.data = null;
      return res.status(409).json(response);
    }

    // Create a new friendship
    const friend = new friendModel({
      user1: userId,
      user2: friendId,
    });

    await friend.save();

    // Fetch the friend's profile
    const friendProfile = await userModel.findById(friendId);

    if (!friendProfile) {
      response.success = false;
      response.message = "Friend's profile not found";
      response.data = null;
      return res.status(404).json(response);
    } else {
      response.success = true;
      response.message = "Friend added successfully";
      response.data = {
        friend: friendProfile,
        friendship: friend,
      };
      return res.status(201).json(response);
    }
  } catch (error) {
    response.success = false;
    response.message = 'Internal Server Error';
    response.data = null;
    return res.status(500).json(response);
  }
};




module.exports.removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const { friendId } = req.body;

    // Check if the friendship exists
    const existingFriendship = await friendModel.findOne({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId },
      ],
    });

    if (!existingFriendship) {
      response.success = false;
      response.message = 'Friendship does not exist';
      response.data = null;
      return res.status(404).json(response);
    }

    // Remove the friendship
    await existingFriendship.deleteOne();

    response.success = true;
    response.message = 'Friend removed successfully';
    response.data = null;
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    response.success = false;
    response.message = 'Internal Server Error';
    response.data = null;
    return res.status(500).json(response);
  }
};
