import { Router } from 'express';
import { DataSource } from 'typeorm';
import GroupController from '@controllers/group';
import { schemaValidation } from '@middlewares/schemaValidation';
import validateToken from '@middlewares/accessTokeValidation';
import {
  createGroupSchema,
  updateGroupSchema,
  addUsersToGroupSchema
} from '@shared/schemes/group';
import UserEntity from '@entities/User';
import GroupEntity from '@entities/Group';
import UserRepository from '@repositories/user';
import GroupRepository from '@repositories/group';
import GroupService from '@services/group';

const getGroupRouter = (dataSource: DataSource) => {
  const groupRouter = Router();
  const userRepository = new UserRepository(dataSource.getRepository(UserEntity));
  const groupRepository = new GroupRepository(dataSource.getRepository(GroupEntity));
  const groupService = new GroupService(
    groupRepository,
    userRepository,
    dataSource
  );
  const {
    createGroup,
    getGroupByID,
    deleteGroup,
    updateGroup,
    addUsersToGroup
  } = new GroupController(groupService);

  groupRouter
    .route('/')
    .post(schemaValidation(createGroupSchema), validateToken, createGroup);

  groupRouter
    .route('/:id')
    .get(validateToken, getGroupByID)
    .put(schemaValidation(updateGroupSchema), validateToken, updateGroup)
    .patch(schemaValidation(addUsersToGroupSchema), validateToken, addUsersToGroup)
    .delete(validateToken, deleteGroup);

  return groupRouter;
};

export default getGroupRouter;
