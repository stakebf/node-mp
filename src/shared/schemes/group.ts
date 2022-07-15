import Joi from 'joi';

export const createGroupSchema = Joi.object({
  name: Joi.string().trim().required(),
  permissions: Joi.array().items(Joi.string().trim()),
  users: Joi.array().items(Joi.string().trim())
});

export const updateGroupSchema = Joi.object({
  name: Joi.string().trim(),
  permissions: Joi.array().items(Joi.string().trim()),
  users: Joi.array().items(Joi.string().trim())
});

export const addUsersToGroupSchema = Joi.object({
  groupId: Joi.string().trim().required(),
  userIds: Joi.array().items(Joi.string().trim().required())
});
