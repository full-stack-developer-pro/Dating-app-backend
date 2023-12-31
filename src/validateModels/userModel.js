const Joi = require('joi');

module.exports.userValidationSchema = Joi.object({
    id: Joi.string(),
    is_fake: Joi.boolean(),
    name: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    gender: Joi.string().required(),
    age: Joi.number().required(),
    birthdate: Joi.date().required(),
    description: Joi.string(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    postcode: Joi.string(),
    timezone: Joi.object(),
    height: Joi.number().required(),
    weight: Joi.number().required(),
    eye_color: Joi.string(),
    hair_color: Joi.string(),
    hair_length: Joi.string(),
    marital_status: Joi.string(),
    interests: Joi.array().items(Joi.string()).required(),
    credits: Joi.number().required(),
    free_message: Joi.string(),
    is_verified: Joi.boolean(),
    is_flagged: Joi.boolean(),
    role: Joi.number(),
    status: Joi.string().valid('active', 'inactive').default('active'),
    friends: Joi.object(),
    
   

});



module.exports.loginUsers= Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required(),
  })

  