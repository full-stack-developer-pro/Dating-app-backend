const Joi = require('joi')
const { empty } = require('uuidv4')

module.exports.loginAdmin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})
module.exports.updateAdmin = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  _id: Joi.string().required(),
})

module.exports.deleteAdmin = Joi.object({
  _id: Joi.string().required(),
})

module.exports.changePassword = Joi.object({
  _id: Joi.string().required(),
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.string().required(),
})


module.exports.forgetAdmin = Joi.object({
  phoneNumber: Joi.number().integer().required(),
})

module.exports.verifyOtp = Joi.object({
  otp: Joi.number().integer().required(),
})

module.exports.restPassword = Joi.object({
  phoneNumber: Joi.number().integer().required(),
  newPassword: Joi.string().required(),
})

module.exports.about = Joi.object({
  _id: Joi.string().allow('', null), 
  Heading: Joi.string().required(),
  Description: Joi.string().required(),
  BottomHeading: Joi.string().required(),
  BottomDescription: Joi.string().required(),
});


module.exports.contact = Joi.object({
  _id: Joi.string().allow('', null), 
  lat: Joi.number().required(),
  long: Joi.number().required(),
  address: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().email().required(),
})

module.exports.socialLinks = Joi.object({
  _id: Joi.string().allow('', null), 
  facebook: Joi.string().required(),
  linkedin: Joi.string().required(),
  twitter: Joi.string().required(),
  instagram: Joi.string().required(),
  snapchat: Joi.string().required(),
})

module.exports.policy = Joi.object({
  _id: Joi.string().allow('', null), 
  heading: Joi.string().required(),
  description: Joi.string().required(),
 
})

module.exports.terms = Joi.object({
  _id: Joi.string().allow('', null), 
  heading: Joi.string().required(),
  description: Joi.string().required(),
 
})