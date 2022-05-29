import Joi from 'joi';

const passwordValidation = '^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,10}$';

const getUserSchema = (method: string) => {
  if (method === 'POST') {
    return Joi.object({
      login: Joi.string().trim().min(3).max(20).required(),
      password: Joi.string().pattern(new RegExp(passwordValidation)).required(),
      age: Joi.number().min(4).max(130).required()
    });
  } else if (method === 'PUT') {
    return Joi.object({
      login: Joi.string().trim().min(3).max(20),
      password: Joi.string().pattern(new RegExp(passwordValidation)),
      age: Joi.number().min(4).max(130)
    });
  }
};

export default getUserSchema;
