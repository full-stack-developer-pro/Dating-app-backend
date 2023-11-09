const userModel = require("../models/userModel");
//const friendModel = require("../models/friendModel");
const chatModel = require("../models/chatModel");
const response = require("../db/dbRes");
const bcryptService = require("../services/bcryptService");
const jwtServices = require("../services/jwtService");
const campareService = require("../services/camprePassword");
const { v4: uuidv4 } = require("uuid");
const nodeMailer = require("nodemailer");
const mongoose = require("mongoose");
const messageModel = require('../models/chatModel')
const online = require('online');
const transporter = require('../services/emailVerifyService');



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
      friends,
      status,
    } = req.body;


    const photo = req.file;

    const imagePath = {
      path: photo.path,
      url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(photo.filename)}`,
    };

    const userId = uuidv4();
    const userIP = req.ip;
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      const response = {
        success: false,
        message: 'User Already Exists',
        data: null,
      };
      return res.status(409).json(response);
    }

    const hashedPassword = await bcryptService.hashPassword(password);

    const newUser = await userModel.create({
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
      is_verified: false,
      is_flagged,
      role,
      friends,
      status,
      verificationCode,
      photo: imagePath,
    });

    newUser.last_login = new Date();
    newUser.online = true;
    await newUser.save();

    const response = {
      success: true,
      message: 'User Signup Successfully. Check your email for the verification code.',
      data: newUser,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error(error);
    const response = {
      success: false,
      message: 'Internal Server Error',
      data: null,
    };
    return res.status(500).json(response);
  }
};


module.exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: 'Email is already verified' });
    }
    if (user.verificationCode === verificationCode) {
      user.isVerified = true;
      await user.save();
      return res.json({ message: 'Email verified successfully' });
    } else {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}


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
      age,
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
      status
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
      age,
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
      status
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


module.exports.memberStatic = async (req, res) => {
  try {
    // Get total number of members
    const totalMembers = await userModel.countDocuments();

    // Get active members
    const activeMembers = await userModel.countDocuments({ status: 'active' });

    // Get members who joined today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const membersJoinedToday = await userModel.countDocuments({ createdAt: { $gte: today } });

    // Get men who joined today
    const menJoinedToday = await userModel.countDocuments({ gender: 'male', createdAt: { $gte: today } });

    // Get women who joined today
    const womenJoinedToday = await userModel.countDocuments({ gender: 'female', createdAt: { $gte: today } });

    // Get messages sent today (you may need to define the message schema)
    const messagesSentToday = await messageModel.countDocuments({ createdAt: { $gte: today } });

    // Return the results as JSON
    return res.json({
      totalMembers,
      activeMembers,
      membersJoinedToday,
      menJoinedToday,
      womenJoinedToday,
      messagesSentToday,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// getalluser.....
module.exports.getAllUser = async (req, res) => {
  try {
      const { } = req.body;
      const userId = await userModel.find();
      if (userId) {
          response.success = true,
              response.message = ' User Get Successfuly'
          response.data = userId
          res.status(200).json(response)
      } else {
          response.success = false,
              response.message = ' User Not Found'
          response.data = null
          res.status(404).json(response)
      }
  } catch (error) {
      response.success = false,
          response.message = "Internal Server Error",
          response.data = null,
          res.status(500).json(response)
  }
}



module.exports.getDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

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
                    $project: { _id: 1 },
                  },
                ],
                as: "friends",
              },
            },
            {
              $unwind: "$friends",
            },
            {
              $project: {
                _id: 0,
                friends: "$friends._id",
              },
            },
          ],
          as: "friends",
        },
      },
      {
        $lookup: {
          from: "galleries",
          localField: "_id",
          foreignField: "images",
          as: "Gallery",
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
          age: 1,
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
          photo: 1,
          images:1,
          verifyStatus:1,
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
      message: "User Retrieved Successfully",
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





module.exports.getAllFriends = async (req, res) => {
  try {
    const { id } = req.params;

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
                    $project: {
                      _id: 1,
                      name: 1,
                      username: 1,
                      gender: 1,
                      description: 1,
                      country: 1,
                      city: 1,
                    },
                  },
                ],
                as: "friends",
              },
            },
            {
              $unwind: "$friends"
            },
            {
              $project: {
                "_id": 0,
                "user1": 0,
                "user2": 0,
                "__v": 0
              }
            }
          ],
          as: "friends",
        },
      },
      {
        $lookup: {
          from: "galleries",
          localField: "_id",
          foreignField: "photo",
          as: "gallery",
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
          profile: 1,
          photo:1
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
      message: "User's Friends Get Successfully",
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


