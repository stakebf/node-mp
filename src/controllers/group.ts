import { Request, Response, NextFunction } from 'express';
import GroupService from '@src/services/group';
import logger from '@src/logger';

class GroupController {
  private readonly service: GroupService;

  constructor(service: GroupService) {
    this.service = service;
  }

  createGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;

    const createdGroup = await this.service.createGroup(body);

    if (!createdGroup) {
      const message = 'Group wasn\'t created';

      logger.error({
        method: 'createGroup',
        args: {
          body
        },
        message
      });

      return res.status(400).json({ message });
    }


    return res.json(createdGroup);
  };

  getGroupByID = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;
    const group = await this.service.getGroupByID(id);

    if (!group) {
      const message = `Group with ${id} doesn't exist`;

      return res.status(404).json({ message });
    }

    return res.json(group);
  };

  updateGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id }, body } = req;

    const updatedGroup = await this.service.updateGroup(id, body);

    if (!updatedGroup) {
      const message = `Group with ${id} has been already removed or doesn't exist`;

      logger.error({
        method: 'updateGroup',
        args: {
          id,
          body
        },
        message
      });

      return res.status(400).json({ message });
    }

    return res.json(updatedGroup);
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;

    const deletedGroup = await this.service.deleteGroup(id);

    if (!deletedGroup) {
      const message = `Group with {id: ${id}} doesn't exist or has been already removed`;

      logger.error({
        method: 'deleteGroup',
        args: {
          id
        },
        message
      });

      return res.status(404).json({ message });
    }

    return res.json({ status: true });
  };

  addUsersToGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id }, body: { userIds } } = req;
    const updatedGroup = await this.service.addUsersToGroup(id, userIds);

    if (updatedGroup === undefined) {
      const message = `Group with {id: ${id}} or userIds ${userIds} don't exist or has been already removed`;

      logger.error({
        method: 'addUsersToGroup',
        args: {
          id,
          userIds
        },
        message
      });

      return res.status(404).json({ message });
    }

    return res.json(updatedGroup?.users);
  };

  removeUsersFromGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id }, body: { userIds } } = req;
    const updatedGroup = await this.service.removeUsersFromGroup(id, userIds);

    if (updatedGroup === undefined) {
      const message = `Group with {id: ${id}} or userIds ${userIds} don't exist or has been already removed`;

      logger.error({
        method: 'removeUsersFromGroup',
        args: {
          id,
          userIds
        },
        message
      });

      return res.status(404).json({ message });
    }

    return res.json(updatedGroup?.users);
  };

  getUsersFromGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;
    const group = await this.service.getGroupByID(id);

    if (!group) {
      const message = `Group with ${id} doesn't exist`;

      return res.status(404).json({ message });
    }

    return res.json(group.users);
  };
}

export default GroupController;
