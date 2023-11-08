const profile = require('../models/gallery');
const userModel = require('../models/userModel');


// module.exports.addImages = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const imagesIds = req.files;

//         const user = await userModel.findById(userId);

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const images = [];

//         for (const image of imagesIds) {
//             const newImage = {
//                 path: image.path,
//                 url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
//             };

//             images.push(newImage);
//         }

//         const newGallery = new profile({
//             is_verified: false,
//             images: images, 
//         });

//         await newGallery.save();

//         user.gallery = newGallery;
//         await user.save();

//         res.status(201).json({
//             message: 'Gallery images uploaded and associated with the user profile.',
//             data: newGallery, 
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to upload gallery images.' });
//     }
// };


module.exports.addImages = async (req, res) => {
    try {
        const { userId } = req.params;
        const imagesIds = req.files;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const images = [];

        for (const image of imagesIds) {
            const newImage = {
                path: image.path,
                url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
            };

            images.push(newImage);
        }

        // Push the new images into the user's profile
        user.images = user.images.concat(images);

        await user.save();

        res.status(201).json({
            message: 'Gallery images uploaded and associated with the user profile.',
            data: user, // Return the updated user profile
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload gallery images.' });
    }
};



