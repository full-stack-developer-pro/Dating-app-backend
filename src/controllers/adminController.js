const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel')
const aboutModel = require('../models/aboutModel')
const contactModel = require('../models/contactModel')
const socialModel = require('../models/socialLinkModel')
const terms = require('../models/termsAndCondition')
const policy = require('../models/policyModel')
const blog = require('../models/blogModel')
const user =require('../models/userModel')
const topBanner =require('../models/topBanner')
const middleBanner = require('../models/middleBanner')
const secondLastBanner = require('../models/SecondLastBanner')
const credit = require('../models/creditModel')
const lastBanner =require('../models/lastBanner')
const response = require('../db/dbRes');
const bcryptService = require('../services/bcryptService');
const jwtServices = require('../services/jwtService');
const campareService = require('../services/camprePassword');


module.exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const loginAdmin = await adminModel.findOne({ email: email });

        if (loginAdmin) {
            const passwordMatch = await campareService.comparePasswords(password, loginAdmin.password);
            if (passwordMatch) {
                const adminToken = await jwtServices.createJwt(loginAdmin);

                response.success = true;
                response.message = "Admin Login Successfully";
                response.data = { loginAdmin, accessToken: adminToken };
                return res.status(201).send(response);
            } else {
                response.success = false;
                response.message = 'Invalid password';
                response.data = null;
                return res.status(401).send(response);
            }
        } else {
            response.success = false;
            response.message = 'User Not Found';
            response.data = null;
            return res.status(401).send(response);
        }
    } catch (error) {
        console.log(error);
        response.success = false;
        response.message = "Internal Server Error";
        response.data = null;
        return res.status(500).json(response);
    }
};

// update..
module.exports.adminUpdate = async (req, res) => {
    try {
        const { name, email, _id } = req.body
        const updateData = await adminModel.findByIdAndUpdate(_id, {
            name: name,
            email: email,
        })
        if (updateData) {
            response.success = true,
                response.message = "Update Successfully",
                response.data = null,
                res.status(200).send(response)
        } else {
            response.success = false,
                response.message = ' admin Does Not Updated'
            response.data = null
            res.status(400).send(response)
        }
    } catch (error) {
        console.log(error);
        response.success = false,
            response.message = 'Internal Server Error'
        response.data = null
        res.status(500).send(response)
    }
}

// changePassword...
module.exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword, _id } = req.body;
        const adminChangePassword = await adminModel.findById(_id);
        if (!adminChangePassword) {
            response.success = false,
                response.message = 'Admin Id Not Found'
            response.data = null
            res.status(404).send(response)
        }
        const matchPassword = await campareService.comparePasswords(
            oldPassword,
            adminChangePassword.password
        );
        if (!matchPassword) {
            return res.status(400).json({
                success: false,
                message: 'Old Password does not match',
                data: null
            });
        }
        if (newPassword !== confirmPassword) {
            response.success = false,
                response.message = 'Admin Password Not Match'
            response.data = null
            res.status(400).send(response)
        }
        const hashedPassword = await bcryptService.hashPassword(newPassword);
        const update = await adminModel.findByIdAndUpdate(_id, { password: hashedPassword });
        if (update) {
            response.success = true,
                response.message = "Admin Change Password Successfully",
                response.data = { update },
                res.status(201).send(response)
        } else {
            response.success = false,
                response.message = "Not Update Admin Password",
                response.data = null,
                res.status(400).send(response)
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: null
        });
    }
};



// forgetPassword........

const accountSid = "AC7e9d3f6cbbd4479493b670a0a51c3cd9"
const authToken = "8b29d8fac40925fb8841d28a91735501"
const client = require('twilio')(accountSid, authToken);
module.exports.forgetPasswordUsePhone = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const admin = await userModel.findOne({ phoneNumber })
        if (admin) {
            const serviceSid = 'VA45b3bbd251c427192bdf8910ac2aa59c';
            client.verify.services(serviceSid)
                .verifications.create({ to: `+91${phoneNumber}`, channel: 'sms' })
                .then((verification) =>
                    console.log(verification.sid),
                    response.success = true,
                    response.message = 'Send Otp Your PhoneNumber  Successfully',
                    response.data = null,
                    res.status(200).json(response)
                )
        } else {
            response.success = false,
                response.message = "User Not Found",
                response.data = null,
                res.status(400).json(response)
        }
    } catch (error) {
        response.success = false,
            response.message = "Internal Server Error",
            response.data = null,
            res.status(500).json(response)
    }
}

exports.verifyOTPNumber = async (req, res) => {
    const accountSid = "AC7e9d3f6cbbd4479493b670a0a51c3cd9";
    const authToken = "8b29d8fac40925fb8841d28a91735501";
    const client = require('twilio')(accountSid, authToken);
    const serviceSid = 'VA45b3bbd251c427192bdf8910ac2aa59c';
    try {
        const { otp } = req.body;
        const verificationCheck = await client.verify.services(serviceSid)
            .verificationChecks
            .create({ to: `+917895928022`, code: otp });
        if (verificationCheck.status === 'approved') {
            response.success = true,
                response.message = 'OTP verification successful!',
                response.data = null,
                res.status(200).json(response)
        } else {
            response.success = false,
                response.message = "'OTP verification failed!",
                response.data = null,
                res.status(400).json(response)
        }
    } catch (error) {
        console.log(error);
        response.success = false,
            response.message = "Internal Server Error",
            response.data = null,
            res.status(500).json(response)
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { phoneNumber, newPassword } = req.body;
        const admin = await userModel.findOne({ phoneNumber });
        if (admin) {
            const hashedPassword = await bcryptService.hashPassword(newPassword);
            admin.password = hashedPassword;
            await admin.save();
            response.success = true,
                response.message = 'Password reset successfully',
                response.data = null,
                res.status(200).json(response)
        } else {
            response.success = false,
                response.message = "'User Not Found",
                response.data = null,
                res.status(404).json(response)
        }
    } catch (error) {
        console.log(error);
        response.success = false,
            response.message = "Internal Server Error",
            response.data = null,
            res.status(500).json(response)
    }
};



// about as......

module.exports.addAbout = async (req, res) => {
    try {
        const { Heading, Description, BottomHeading, BottomDescription, _id } = req.body;
        const existingAbout = await aboutModel.findOne({ _id: _id });
        if (!existingAbout) {
            const about = new aboutModel({
                _id: _id,
                Heading: Heading,
                Description: Description,
                BottomHeading: BottomHeading,
                BottomDescription: BottomDescription,
            });
            await about.save();
            const response = {
                success: true,
                message: 'About added successfully',
                data: about,
            };
            res.status(200).json(response);
        } else {
            // Update the existing about document
            const aboutUpdate = await aboutModel.findByIdAndUpdate({ _id: _id },
                {
                    Heading: Heading,
                    Description: Description,
                    BottomHeading: BottomHeading,
                    BottomDescription: BottomDescription,
                })
            const response = {
                success: true,
                message: 'About updated successfully',
                data: aboutUpdate,
            };
            res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        const response = {
            success: false,
            message: 'Internal Server Error',
        };
        res.status(500).json(response);
    }
};

// getAllAbout........

module.exports.getAbout = async (req, res) => {
    try {
        const getData = await aboutModel.find()
        if (!getData.length > 0) {
            response.success = false,
                response.message = "'User Not Found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'AboutAs Get successfully';
            response.data = getData;
            res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}


// contactAs
module.exports.addContact = async (req, res) => {
    try {
        const { lat, long, address, phoneNumber, email, _id } = req.body;
        const existingContact = await contactModel.findOne({ _id: _id });
        if (!existingContact) {
            let contact = new contactModel({
                _id: _id,
                lat: lat,
                long: long,
                address: address,
                phoneNumber: phoneNumber,
                email: email
            });
            await contact.save();
            response.success = true;
            response.message = 'Contact added successfully';
            response.data = contact;
            res.status(200).json(response);
        } else {
            const contactUpdate = await contactModel.findByIdAndUpdate({ _id: _id },
                {
                    lat: lat,
                    long: long,
                    address: address,
                    phoneNumber: phoneNumber,
                    email: email
                })
            const response = {
                success: true,
                message: 'Contact updated successfully',
                data: contactUpdate,
            };
            res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.success = false;
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
};



// getContactAs...

module.exports.getContact = async (req, res) => {
    try {
        const getData = await contactModel.find()
        if (!getData.length > 0) {
            response.success = false,
                response.message = "'User Not Found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'contactAs Get successfully';
            response.data = getData;
            res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// SocialLinks.....

module.exports.addSocialLink = async (req, res) => {
    try {
        const { facebook, linkedin, twitter, instagram, snapchat, _id } = req.body;
        const existingContact = await socialModel.findOne({ _id: _id });
        if (!existingContact) {
            const newSocialLink = new socialModel({
                _id,
                facebook,
                linkedin,
                twitter,
                instagram,
                snapchat
            });
            await newSocialLink.save();
            response.success = true;
            response.message = 'Social links added successfully';
            response.data = newSocialLink;
            res.status(200).json(response);
        } else {
            const socialLinksUpdate = await socialModel.findByIdAndUpdate({ _id: _id },
                {
                    facebook: facebook,
                    linkedin: linkedin,
                    twitter: twitter,
                    instagram: instagram,
                    snapchat: snapchat
                })
            const response = {
                success: true,
                message: 'socialLinks updated successfully',
                data: socialLinksUpdate,
            };
            res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// getOneSocialLinks.....
module.exports.getSocialLink = async (req, res) => {
    try {
        const socialLink = await socialModel.find();
        if (!socialLink) {
            response.success = false;
            response.message = 'Social link not found';
            response.data = null;
            return res.status(404).json(response);
        }
        response.success = true;
        response.message = 'Social link Get successfully';
        response.data = socialLink;
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
};


// PrivacyPolicy
module.exports.addPolicy = async (req, res) => {
    try {
        const { heading, description, _id } = req.body;
        const existingContact = await policy.findOne({ _id: _id });
        if (!existingContact) {
            const privacyPolicyAdd = await policy({
                _id: _id,
                heading: heading,
                description: description
            });
            await privacyPolicyAdd.save();
            response.success = true;
            response.message = 'Add Policy&Privacy successfully';
            response.data = privacyPolicyAdd;
            return res.status(200).json(response);
        } else {
            const policyUpdate = await policy.findByIdAndUpdate({ _id: _id },
                {
                    heading: heading,
                    description: description
                })
            const response = {
                success: true,
                message: 'policy updated successfully',
                data: policyUpdate,
            };
            res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}
// getPrivacy&Policy

module.exports.getPolicy = async (req, res) => {
    try {
        const privacyPolicy = await policy.find();
        if (!privacyPolicy.length > 0) {
            response.success = false,
                response.message = "'Privacy Policy not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'Policy And Privacy Get successfully';
            response.data = privacyPolicy;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// Term&Condition.....

module.exports.addTermsAndCondition = async (req, res) => {
    try {
        const { heading, description, _id } = req.body;
        const existingTerms = await terms.findOne({ _id: _id });
        if (!existingTerms) {
            const termsAdd = await terms({
                _id: _id,
                heading: heading,
                description: description
            });
            await termsAdd.save();
            response.success = true;
            response.message = 'Add Terms successfully';
            response.data = termsAdd;
            return res.status(200).json(response);
        } else {
            const termsUpdate = await terms.findByIdAndUpdate({ _id: _id },
                {
                    heading: heading,
                    description: description
                })
            const response = {
                success: true,
                message: 'terms updated successfully',
                data: termsUpdate,
            };
            res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// getTermsAnd Condition....
module.exports.getTermsAndCondition = async (req, res) => {
    try {
        const user = await terms.find();
        if (!user.length > 0) {
            response.success = false,
                response.message = "'Terms And Conditon not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'Terms And Conditon Get successfully';
            response.data = user;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}



// blogs....

  module.exports.addBlog = async (req, res) => {
    try {
        const { heading, description ,_id} = req.body;
        const existingTerms = await blog.findOne({ _id: _id });
        const images = req.files;
        const imagePaths = images.map((image) => ({
            path: image.path,
            url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
        }));
        if (!existingTerms) {
        const newBlog = new blog({
            _id: _id ,
            heading: heading,
            description: description,
            images: imagePaths,
        });

        const savedBlog = await newBlog.save();

        response.success = true;
        response.message = 'Blog added successfully';
        response.data = savedBlog;

        res.status(201).json(response);
    }else{
        const blogUpdate = await blog.findByIdAndUpdate({ _id: _id },
            {
                heading: heading,
                description: description,
                images:imagePaths
            })
        const response = {
            success: true,
            message: 'blog updated successfully',
            data: blogUpdate,
        };
        res.status(200).json(response);

    }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
};


// getBlog.....
module.exports.getblog = async (req, res) => {
    try {
        const blogs = await blog.find();
        if (!blogs) {
            response.success = false,
                response.message = "'blog not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'Blog Get successfully';
            response.data = blogs;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}
module.exports.getOneblog = async (req, res) => {
    try {
        const {_id}=req.params
        const blogs = await blog.findById({_id:_id});
        if (!blogs) {
            response.success = false,
                response.message = "'blog not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'Blog Get successfully';
            response.data = blogs;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

module.exports.getAllUserByAdmin = async (req, res) => {
    try {
        const users = await user.find();
        if (!users) {
            response.success = false,
                response.message = "'users not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'Users Get successfully';
            response.data = users;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

module.exports.getOneUserByAdmin = async (req, res) => {
    try {
        const {_id}=req.params
        const users = await user.find({_id:_id});
        if (!users) {
            response.success = false,
                response.message = "'users not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'Users Get successfully';
            response.data = users;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// addTopBanner...........
module.exports.addTopBanner = async (req, res) => {
    try {
        const { heading, description ,_id} = req.body;
        const existingTerms = await topBanner.findOne({ _id: _id });
        const images = req.files;
        const imagePaths = images.map((image) => ({
            path: image.path,
            url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
        }));
        if (!existingTerms) {
        const newTopBanner = new topBanner({
            _id: _id ,
            heading: heading,
            description: description,
            images: imagePaths,
        });

        const topBanners = await newTopBanner.save();

        response.success = true;
        response.message = 'TopBanner added successfully';
        response.data = topBanners;

        res.status(201).json(response);
    }else{
        const topBannerUpdate = await topBanner.findByIdAndUpdate({ _id: _id },
            {
                heading: heading,
                description: description,
                images:imagePaths
            })
        const response = {
            success: true,
            message: 'topBanner updated successfully',
            data: topBannerUpdate,
        };
        res.status(200).json(response);

    }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
};


// getTopBanner.....
module.exports.getTopBanner = async (req, res) => {
    try {
        const topBanners = await topBanner.find();
        if (!topBanners) {
            response.success = false,
                response.message = "'topBanners not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'topBanners Get successfully';
            response.data = topBanners;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// addMiddleBanner...........
module.exports.addMiddleBanner = async (req, res) => {
    try {
        const { heading, description ,_id} = req.body;
        const existingTerms = await middleBanner.findOne({ _id: _id });
        const images = req.files;
        const imagePaths = images.map((image) => ({
            path: image.path,
            url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
        }));
        if (!existingTerms) {
        const newmiddleBanner = new middleBanner({
            _id: _id ,
            heading: heading,
            description: description,
            images: imagePaths,
        });

        const middleBanners = await newmiddleBanner.save();

        response.success = true;
        response.message = 'TopBanner added successfully';
        response.data = middleBanners;

        res.status(201).json(response);
    }else{
        const middleBannerUpdate = await middleBanner.findByIdAndUpdate({ _id: _id },
            {
                heading: heading,
                description: description,
                images:imagePaths
            })
        const response = {
            success: true,
            message: 'topBanner updated successfully',
            data: middleBannerUpdate,
        };
        res.status(200).json(response);

    }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
};


// getMiddleBanner.....
module.exports.getMiddleBanner = async (req, res) => {
    try {
        const topBanners = await middleBanner.find();
        if (!topBanners) {
            response.success = false,
                response.message = "'topBanners not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'topBanners Get successfully';
            response.data = topBanners;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// addSecondLastBanner...........
module.exports.addSecondLastBanner = async (req, res) => {
    try {
        const { heading, description ,_id} = req.body;
        const existingTerms = await secondLastBanner.findOne({ _id: _id });
        const images = req.files;
        const imagePaths = images.map((image) => ({
            path: image.path,
            url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
        }));
        if (!existingTerms) {
        const newSecondLastBanner = new secondLastBanner({
            _id: _id ,
            heading: heading,
            description: description,
            images: imagePaths,
        });

        const secondLastBanners = await newSecondLastBanner.save();

        response.success = true;
        response.message = 'secondLastBanners added successfully';
        response.data = secondLastBanners;

        res.status(201).json(response);
    }else{
        const secondLastBannersUpdate = await secondLastBanner.findByIdAndUpdate({ _id: _id },
            {
                heading: heading,
                description: description,
                images:imagePaths
            })
        const response = {
            success: true,
            message: 'secondLastBanners updated successfully',
            data: secondLastBannersUpdate,
        };
        res.status(200).json(response);

    }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
};


// getSecondLastBanner.....
module.exports.getSecondLastBanner = async (req, res) => {
    try {
        const secondLastBanners = await secondLastBanner.find();
        if (!secondLastBanners) {
            response.success = false,
                response.message = "'secondLastBanners not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'secondLastBanners Get successfully';
            response.data = secondLastBanners;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// addLastBanner...........
module.exports.addLastBanner = async (req, res) => {
    try {
        const { heading ,_id} = req.body;
        const existingTerms = await lastBanner.findOne({ _id: _id });
        const images = req.files;
        const imagePaths = images.map((image) => ({
            path: image.path,
            url: `https://dating-app-backend-xyrj.onrender.com/uploads/${encodeURIComponent(image.filename)}`,
        }));
        if (!existingTerms) {
        const newLastBanner = new lastBanner({
            _id: _id ,
            heading: heading,
            images: imagePaths,
        });

        const lastBanners = await newLastBanner.save();

        response.success = true;
        response.message = 'LastBanners added successfully';
        response.data = lastBanners;

        res.status(201).json(response);
    }else{
        const lastBannersUpdate = await lastBanner.findByIdAndUpdate({ _id: _id },
            {
                heading: heading,
                images:imagePaths
            })
        const response = {
            success: true,
            message: 'LastBanners updated successfully',
            data: lastBannersUpdate,
        };
        res.status(200).json(response);

    }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
};


// getSecondLastBanner.....
module.exports.getLastBanner = async (req, res) => {
    try {
        const lastBanners = await lastBanner.find();
        if (!lastBanners) {
            response.success = false,
                response.message = "'LastBanners not found",
                response.data = null,
                res.status(404).json(response)
        } else {
            response.success = true;
            response.message = 'LastBanners Get successfully';
            response.data = lastBanners;
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}


// creditAdd..........................................................................................

module.exports.addCredit =async(req,res)=>{
    try {
        const {credits, currency,price, bonus}=req.body
        const addCredits = new credit({
            credits:credits,
            currency:currency,
            price:price,
            bonus:bonus
        })
        await addCredits.save()
        response.success = true;
        response.message = 'Credits added successfully';
        response.data = addCredits;

    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

module.exports.getCreditById = async (req, res) => {
    try {
        const { _id } = req.params
      const foundCredit = await credit.findById({ _id : _id});
  
      if (foundCredit) {
        response.success = true;
        response.message = 'Credit Get Successfully';
        response.data = foundCredit;
        res.status(200).json(response);
      } else {
        response.success = false;
        response.message = 'Credit not found';
        response.data = null;
        res.status(404).json(response);
      }
    } catch (error) {
      console.error(error);
      response.success = false;
      response.message = 'Internal Server Error';
      response.data = null;
      res.status(500).json(response);
    }
  };

  module.exports.getAllCredits = async (req, res) => {
    try {
      const foundCredits = await credit.find();
  
      if (foundCredits && foundCredits.length > 0) {
        response.success = true;
        response.message = "Credits retrieved successfully";
        response.data = foundCredits;
        res.status(200).json(response);
      } else {
        response.success = false;
        response.message = "No credits found";
        response.data = [];
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


module.exports.deleteCredit = async (req, res) => {
    try {
      const {_id}= req.params
      const deletedCredit = await credit.findByIdAndDelete({_id:_id});
  
      if (deletedCredit) {
        response.success = true;
        response.message = 'Credits deleted successfully';
        response.data = deletedCredit;
        res.status(200).json(response);
      } else {
        response.success = false;
        response.message = 'Credit not found';
        response.data = null;
        res.status(404).json(response);
      }
    } catch (error) {
      console.error(error);
      response.success = false;
      response.message = 'Internal Server Error';
      response.data = null;
      res.status(500).json(response);
    }
  };
  


  module.exports.updateCredit = async (req, res) => {
    try {
      const {_id} = req.params
      const { credits, currency, price, bonus } = req.body;
      const updatedCredit = await credit.findByIdAndUpdate(_id, {
        credits,
        currency,
        price,
        bonus
      });
  
      if (updatedCredit) {
        response.success = true;
        response.message = 'Credits updated successfully';
        response.data = updatedCredit;
        res.status(200).json(response);
      } else {
        response.success = false;
        response.message = 'Credit not found';
        response.data = null;
        res.status(404).json(response);
      }
    } catch (error) {
      console.error(error);
      response.success = false;
      response.message = 'Internal Server Error';
      response.data = null;
      res.status(500).json(response);
    }
  };
  
// admin approved for profileUploadImages.........................................

// Approve a profile

module.exports.approveProfile = async (req, res) => {
  try {
    const { _id } = req.params;
   

    const user = await userModel.findById(_id);
 

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

  
    user.is_verified = true;

    await user.save();

    res.status(200).json({
      message: 'User approved successfully.',
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve the user.' });
  }
};
  
  // Reject a profile
  module.exports.rejectProfile = async (req, res) => {
    try {
      const { _id } = req.params;
      await userModel.findByIdAndUpdate(_id, { is_verified: false });
      res.status(200).json({ message: 'Profile rejected.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reject profile.' });
    }
  }
  

  

  // Route to approve an image
  module.exports.approveImage = async (req, res) => {
    try {
      const { _id, imageId } = req.params;
  
      const user = await userModel.findById(_id);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Find the image by its ID within the user's images array
      const image = user.images.find((img) => img._id == imageId);
  
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
  
      // Set is_approved to true to approve the image
      image.verifyStatus = true;
  
      await user.save();
  
      res.status(200).json({
        message: 'Image approved successfully.',
        data: user.images,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to approve the image.' });
    }
  };
  
  // Route to reject an image
  module.exports.rejectImage = async (req, res) => {
    try {
      const { _id, imageId } = req.params;
  
      const user = await userModel.findById(_id);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Find the image by its ID within the user's images array
      const image = user.images.find((img) => img._id == imageId);
  
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
  
      // Set is_approved to false to reject the image
      image.verifyStatus = false;
  
      await user.save();
  
      res.status(200).json({
        message: 'Image rejected successfully.',
        data: user.images,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to reject the image.' });
    }
  };
  