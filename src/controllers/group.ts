import { Request, Response, NextFunction } from 'express';
import GroupService from '@src/services/group';

class GroupController {
  private readonly service: GroupService;

  constructor(service: GroupService) {
    this.service = service;
  }

  createGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;

    const createdGroup = await this.service.createGroup(body);

    return res.json(createdGroup);
  };

  getGroupByID = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;
    const group = await this.service.getGroupByID(id);

    if (!group) {
      return res.status(404).json({
        message: `Group with ${id} doesn't exist`
      });
    }

    return res.json(group);
  };

  updateGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id }, body } = req;

    const updatedGroup = await this.service.updateGroup(id, body);

    if (!updatedGroup) {
      return res.status(400).json({
        message: `Group with ${id} has been already removed`
      });
    }

    return res.json(updatedGroup);
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id } } = req;

    const deletedGroup = await this.service.deleteGroup(id);

    if (!deletedGroup) {
      return res.status(404).json({
        message: `Group with {id: ${id}} doesn't exist or has been already removed`
      });
    }

    return res.json({ status: true });
  };

  addUsersToGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { params: { id }, body: { userIds } } = req;
    const updatedGroup = await this.service.addUsersToGroup(id, userIds);

    if (updatedGroup === undefined) {
      return res.status(404).json({
        message: `Group with {id: ${id}} or userIds ${userIds} don't exist or has been already removed`
      });
    }

    if (updatedGroup === null) {
      return res.status(500).json({
        message: 'Something went wrong during adding users into group'
      });
    }

    return res.json(updatedGroup);
  };
}

export default GroupController;
