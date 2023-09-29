const Joi = require('joi')

module.exports.list = Joi.object({
    gender : Joi.string().valid('male', 'female')
  })