const userModel = require("../models/userModel");
//const friendModel = require("../models/friendModel");
const chatModel = require("../models/chatModel");
const response = require("../db/dbRes");
const bcryptService = require("../services/bcryptService");
const jwtServices = require("../services/jwtService");
const campareService = require("../services/camprePassword");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const online = require('online');

module.exports.addUser = async (req, res) => {
  try {
    const {
      is_fake,
      name,
      username,
      email,
      password,
      gender,
      age,
      birthdate,
      description,
      country,
      city,
      postcode,
      timezone,
      height,
      weight,
      eye_color,
      hair_color,
      hair_length,
      marital_status,
      interests,
      credits,
      free_message,
      is_verified,
      is_flagged,
      role,
      friends
    } = req.body;
    const { active, inactive } = req.body;
    const userId = uuidv4();

    const userIP = req.ip;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      response.success = false;
      response.message = "User Already Exists";
      response.data = null;
      return res.status(409).send(response);
    } else {
      const hashedPassword = await bcryptService.hashPassword(password);
      const addUser = await userModel.create({
        id: userId,
        is_fake,
        username,
        name,
        email,
        password: hashedPassword,
        gender,
        age,
        birthdate,
        description,
        country,
        city,
        postcode,
        timezone,
        height,
        weight,
        eye_color,
        hair_color,
        hair_length,
        marital_status,
        interests,
        credits,
        ip_address: userIP,
        free_message,
        is_verified,
        is_flagged,
        role,
        friends,
        active: active || true, 

        inactive: inactive || false,
      });
      addUser.last_login = new Date();
      addUser.online = true;
      await addUser.save();

      response.success = true;
      response.message = "User Signup Successfully";
      response.data = addUser;
      return res.status(201).send(response);
    }
  } catch (error) {
    console.error(error);
    response.success = false;
    response.message = "Internal Server Error";
    response.data = null;
    return res.status(500).send(response);
  }
};

//login.........................

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (user) {
      const passwordMatch = await campareService.comparePasswords(
        password,
        user.password
      );
      console.log(passwordMatch);
      if (passwordMatch) {
        const lastLoginIP = req.ip;
        const lastLoginTimestamp = new Date();

        await userModel.findByIdAndUpdate(user._id, {
          lastLoginIP: lastLoginIP,
          lastLogin: lastLoginTimestamp,
        });
        const userToken = await jwtServices.createJwt(user);
        (response.success = true),
          (response.message = "User Login Successfully"),
          (response.data = { user, aceesToken: userToken }),
          res.status(201).send(response);
      } else {
        (response.success = false), (response.message = "Invalid password");
        response.data = null;
        res.status(401).send(response);
      }
    } else {
      (response.success = false), (response.message = "User Not Found");
      response.data = null;
      res.status(404).send(response);
    }
  } catch (error) {
    console.error(error);
    (response.success = false), (response.message = "Internal Server Error");
    response.data = null;
    res.status(500).send(response);
  }
};

module.exports.updateUser = async (req, res) => {

  try {
    const userId = req.params.id;

    const {
      name,
      username,
      email,
      gender,
      birthdate,
      description,
      country,
      city,
      postcode,
      timezone,
      height,
      weight,
      eye_color,
      hair_color,
      hair_length,
      marital_status,
      interests,
      credits,
      free_message,
    } = req.body;

    const updateData = {
      name,
      username,
      email,
      gender,
      birthdate,
      description,
      country,
      city,
      postcode,
      timezone,
      height,
      weight,
      eye_color,
      hair_color,
      hair_length,
      marital_status,
      interests,
      credits,
      free_message,
    };

    const update = await userModel.findByIdAndUpdate(userId, updateData);

    if (update) {
      response.success = true;
      response.message = "User Updated Successfully";
      response.data = update;
      res.status(200).json(response);
    } else {
      response.success = false;
      response.message = "User Not Found";
      response.data = null;
      res.status(404).json(response);
    }
  } catch (error) {
    console.error(error); 
    response.success = false;
    response.message = "Internal Server Error";
    response.data = null;
    res.status(500).json(response);
  }
};


module.exports.userDelete = async (req, res) => {

  try {
    const { _id } = req.params;
    
    const user = await userModel.findByIdAndDelete(_id);

    if (user) {
      response.success = true;
      response.message = "User Deleted Successfully";
      response.data = null;
      res.status(200).json(response);
    } else {
      response.success = false;
      response.message = "User Not Found";
      response.data = null;
      res.status(404).json(response);
    }
  } catch (error) {
    console.error(error); 
    response.success = false;
    response.message = "Internal Server Error";
    response.data = null;
    res.status(500).json(response);
  }
};


module.exports.getDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Use the aggregation framework to fetch the user's friends
    const user = await userModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "friends",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$user1", "$$userId"] },
                    { $eq: ["$user2", "$$userId"] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users", 
                let: {
                  friendId: {
                    $cond: [
                      { $eq: ["$user1", "$$userId"] },
                      "$user2",
                      "$user1",
                    ],
                  },
                },
                pipeline: [
                  {
                    $match: { $expr: { $eq: ["$_id", "$$friendId"] } },
                  },
                  {
                    $project: { _id: 0, username: 1 },
                  },
                ],
                as: "friend",
              },
            },
          ],
          as: "friends",
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          is_fake: 1,
          name: 1,
          username: 1,
          email: 1,
          password: 1,
          gender: 1,
          birthdate: 1,
          description: 1,
          country: 1,
          city: 1,
          postcode: 1,
          timezone: 1,
          height: 1,
          weight: 1,
          eye_color: 1,
          hair_color: 1,
          hair_length: 1,
          marital_status: 1,
          interests: 1,
          credits: 1,
          ip_address: 1,
          free_message: 1,
          is_verified: 1,
          is_flagged: 1,
          friends: 1,
          friends: {
            $map: {
              input: "$friends.friend",
              as: "friend",
              in: "$$friend.username",
            },
          },
        },
      },
    ]);

    if (user.length === 0) {
      const response = {
        success: false,
        message: "User Not Found",
        data: null,
      };
      return res.status(404).json(response);
    }

    const response = {
      success: true,
      message: "User Get Successfully",
      data: user[0],
    };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    const response = {
      success: false,
      message: "Internal Server Error",
      data: null,
    };
    res.status(500).json(response);
  }
};




//Create  save a chat message
module.exports.saveChat =  async (req, res) => {
    try {
      const { senderId, receiverId, message } = req.body;

      const newChatMessage = await chatModel({
        senderId,
        receiverId,
        message,
      });
      
      const savedChatMessage = await newChatMessage.save();
    
      res.status(201).json(savedChatMessage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while saving the chat message' });
    }
  };




//api for get chat messages

module.exports.getChatMessages =  async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    const chatMessages = await chatModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(chatMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching chat messages' });
  }
};

