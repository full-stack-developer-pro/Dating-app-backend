const profile = require('../models/uploadProfileImages')

module.exports.addProfileImages =async (req, res) => {
    try {
    
        const images = req.files;
        const imagePaths = images.map((image) => ({
            path: image.path,
            url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
        }));
  
      const newProfile = new profile({
        is_verified: false, 
        images: imagePaths,
      });
  
      await newProfile.save();
  
      res.status(201).json({ message: 'Profile image uploaded and pending approval.' ,data:newProfile});
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload profile image.' });
    }
  }