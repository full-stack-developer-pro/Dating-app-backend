const userModel = require('../models/userModel');


module.exports.addImages = async (req, res) => {
  try {
    const { userId } = req.params;
    const imagesIds = req.files;
    const { verifyStatus } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const images = [];

    for (const image of imagesIds) {
      const newImage = {
        path: image.path,
        url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
        verifyStatus: verifyStatus || false,
      };

      images.push(newImage);
    }

    user.images = user.images.concat(images);

    await user.save();

    res.status(201).json({
      message: 'Gallery images uploaded and associated with the user profile.',
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload gallery images.' });
  }
};
