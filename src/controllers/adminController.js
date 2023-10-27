const adminModel = require('../models/adminModel');
const aboutModel = require('../models/aboutModel')
const contactModel = require('../models/contactModel')
const socialModel = require('../models/socialLinkModel')
const terms = require('../models/termsAndCondition')
const policy = require('../models/policyModel')
const blog = require('../models/blogModel')
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
module.exports.userUpdate = async (req, res) => {
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
                response.message = ' User Does Not Updated'
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


// delete.....

module.exports.adminDelete = async (req, res) => {
    try {
        const { _id } = req.body
        const user = await adminModel.findByIdAndDelete({ _id: _id })
        if (user) {
            response.success = true,
                response.message = ' Admin  Delete Successfully'
            response.data = null
            res.status(200).json(response)
        } else {
            response.success = false,
                response.message = ' Admin Does Not Delete'
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

// getalluser.....
module.exports.getAllUser = async (req, res) => {
    try {
        const { } = req.body;
        const userId = await adminModel.find();
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
            url: `https://localhost:3000/uploads/${encodeURIComponent(image.filename)}`,
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
