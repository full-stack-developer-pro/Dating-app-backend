const profile = require('../models/gallery')
const response = require("../db/dbRes");

module.exports.addProfileImages = async (req, res) => {
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

        res.status(201).json({ message: 'Gallery image uploaded and pending approval.', data: newProfile });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload profile image.' });
    }
}

module.exports.getGalleryImages = async (req, res) => {
    try {
        const { _id } = req.params
        const user = await profile.findById({_id:_id})
        if (!user) {
            response.success = false;
            response.message = "User Not Found";
            response.data = null;
            res.status(404).json(response);

        }
        res.status(201).json({ message: 'Gallery Get Successfully.', data: user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal error' });
    }
}


module.exports.getAllGalleryImages = async (req, res) => {
    try {
        const user = await profile.find()
        if (!user) {
            response.success = false;
            response.message = "User Not Found";
            response.data = null;
            res.status(404).json(response);

        }
        res.status(201).json({ message: 'All Gallery Get Successfully.', data: user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal error' });
    }
}
