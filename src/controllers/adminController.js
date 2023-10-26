const adminModel = require('../models/adminModel');
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
        const { Heading, Description, BottomHeading, BottomDescription } = req.body;

        const existingAbout = await adminModel.findOne({
            Heading: Heading,
            Description: Description,
            BottomHeading: BottomHeading,
            BottomDescription: BottomDescription,
        });

        if (existingAbout) {
            response.message = 'About Us with the same data already exists';
            return res.status(400).json(response);
        }
        const about = await adminModel({
            Heading: Heading,
            Description: Description,
            BottomHeading: BottomHeading,
            BottomDescription: BottomDescription,
        });
        console.log(about)
        await about.save();
        response.success = true;
        response.message = 'AboutAs added successfully';
        response.data = about;
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
};

// getAllAbout........

module.exports.getAbout = async (req, res) => {
    try {
        const {_id}=req.params
        const getData = await adminModel.findById(_id)
        if (!getData) {
            response.success = false,
                response.message = "'User Not Found",
                response.data = null,
                res.status(404).json(response)
        }
        response.success = true;
        response.message = 'AboutAs Get successfully';
        response.data = getData;
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}


// contactAs
module.exports.addContact = async (req, res) => {
    try {
        const { lat, long, address, phoneNumber, email } = req.body;
        const _id = req.params.id;
        let contact;
        if (_id) {
            contact = await adminModel.findByIdAndUpdate(_id, {
                lat: lat,
                long: long,
                address: address,
                phoneNumber: phoneNumber,
                email: email
            });
        } else {
            contact = new adminModel({
                lat: lat,
                long: long,
                address: address,
                phoneNumber: phoneNumber,
                email: email
            });
            await contact.save();
        }
        response.success = true;
        response.message = _id ? 'Contact updated successfully' : 'Contact added successfully';
        response.data = contact;
        res.status(200).json(response);
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
        const {_id}=req.params
        const getData = await adminModel.findById(_id)
        if (!getData) {
            response.success = false,
                response.message = "'User Not Found",
                response.data = null,
                res.status(404).json(response)
        }
        response.success = true;
        response.message = 'contactAs Get successfully';
        response.data = getData;
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// SocialLinks.....

module.exports.addSocialLink = async (req, res) => {
    try {
        const { socialLinks } = req.body;
        if (!socialLinks) {
            response.success = false,
                response.message = "'SocialLinks Not Found",
                response.data = null,
                res.status(404).json(response)
        }
        const newSocialLink = new adminModel({ socialLinks });
        await newSocialLink.save();
        response.success = true;
        response.message = 'Social links added successfully';
        response.data = newSocialLink;
        res.status(200).json(response);
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
        const socialLink = await adminModel.find();
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
        const { heading, description } = req.body;
        const privacyPolicyAdd = await adminModel({
            heading: heading,
            description: description
        });
        await privacyPolicyAdd.save();

        response.success = true;
        response.message = 'Add Policy&Privacy successfully';
        response.data = privacyPolicyAdd;
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// getPrivacy&Policy

module.exports.getPolicy = async (req, res) => {
    try {
        const privacyPolicy = await adminModel.find();
        if (!privacyPolicy) {
            response.success = false,
                response.message = "'Privacy Policy not found",
                response.data = null,
                res.status(404).json(response)
        }
        response.success = true;
        response.message = 'Policy And Privacy Get successfully';
        response.data = privacyPolicy;
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// Term&Condition.....

module.exports.addTermsAndCondition = async (req, res) => {
    try {
        const { heading, description } = req.body;
        const privacyPolicyAdd = await adminModel({
            heading: heading,
            description: description
        });
        await privacyPolicyAdd.save();

        response.success = true;
        response.message = 'Add Terms&Condition successfully';
        response.data = privacyPolicyAdd;
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}

// getTermsAnd Condition....
module.exports.getTermsAndCondition = async (req, res) => {
    try {
        const user = await adminModel.find();
        if (!user) {
            response.success = false,
                response.message = "'Terms And Conditon not found",
                response.data = null,
                res.status(404).json(response)
        }
        response.success = true;
        response.message = 'Terms And Conditon Get successfully';
        response.data = user;
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        response.message = 'Internal Server Error';
        res.status(500).json(response);
    }
}



// blogs....
exports.uploadImage = async (req, res) => {
  try {
    const {  heading, description } = req.body;
    const image = req.file.path;

    if (!heading || !image || !description) {
      return res.status(400).json({ code: 400, message: 'Bad Request' });
    }

    const newFile = new adminModel({ heading, image, description });
    const response = await newFile.save();

    if (response) {
      return res.status(200).json({ code: 200, message: 'File and data uploaded successfully' });
    } else {
      return res.status(500).json({ code: 500, message: 'Failed to save file and data' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 500, message: 'Server Error' });
  }
};

