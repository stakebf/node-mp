import { Router } from 'express';
import { DataSource } from 'typeorm';
import GroupController from '@controllers/group';
import { schemaValidation } from '@middlewares/schemaValidation';
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
    .post(schemaValidation(createGroupSchema), createGroup);

  groupRouter
    .route('/:id')
    .get(getGroupByID)
    .put(schemaValidation(updateGroupSchema), updateGroup)
    .patch(schemaValidation(addUsersToGroupSchema), addUsersToGroup)
    .delete(deleteGroup);

  return groupRouter;
};

export default getGroupRouter;
