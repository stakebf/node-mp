import Joi from 'joi';

const passwordValidation = '^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,10}$';

export const userSchemaPost = Joi.object({
  login: Joi.string().trim().min(3).max(20).required(),
  password: Joi.string().pattern(new RegExp(passwordValidation)).required(),
  age: Joi.number().min(4).max(130).required()
});

export const userSchemaPut = Joi.object({
  login: Joi.string().trim().min(3).max(20),
  password: Joi.string().pattern(new RegExp(passwordValidation)),
  age: Joi.number().min(4).max(130)
});
