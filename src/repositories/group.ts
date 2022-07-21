import { Repository, In } from 'typeorm';
import { IGroup } from '@src/shared/types/group';
import { IUser } from '@src/shared/types/user';
import GroupEntity from '@src/entities/Group';

class GroupRepository {
  private readonly repository: Repository<GroupEntity>;

  constructor(repository: Repository<GroupEntity>) {
    this.repository = repository;
  }

  getAllGroups = async (): Promise<IGroup[]> => {
    const allGroups = await this.repository.find({
      withDeleted: true
    });

    return allGroups;
  };

  createGroup = async (group: Omit<IGroup, 'id' | 'createdAt'>): Promise<IGroup | undefined> => {
    const groupEntity = new GroupEntity();
    const newGroup = {
      ...groupEntity,
      ...group
    };

    const createdGroup = await this.repository.save(
      this.repository.create(newGroup)
    );

    return createdGroup;
  };

  getGroupByID = async (id: string): Promise<IGroup | undefined> => {
    const group = await this.repository.findOne({
      where: { id },
      relations: ['users']
    });

    if (!group) {
      return undefined;
    }

    return group;
  };

  getGroupsByID = async (groupIds: string[]): Promise<GroupEntity[] | undefined> => {
    const groups = await this.repository.find({
      where: {
        id: In(groupIds)
      }
    });

    return groups;
  };

  updateGroup = async (id: string, newGroupInfo: Partial<IGroup>, users: IUser[] | undefined): Promise<IGroup | undefined> => {
    const group = await this.repository.findOne({
      where: { id },
      relations: ['users']
    });

    if (!group) {
      return undefined;
    }

    const updatedGroupInfo = users?.length ?
      { ...group, ...newGroupInfo, users } :
      { ...group, ...newGroupInfo };
    const updatedGroup = await this.repository.save(updatedGroupInfo);

    return updatedGroup;
  };

  deleteGroup = async (id: string): Promise<IGroup | undefined> => {
    const deletedGroup = await this.getGroupByID(id);

    if (!deletedGroup || deletedGroup.deletedAt) {
      return undefined;
    }

    await this.repository.delete(id);

    return deletedGroup;
  };

  deleteAllGroups = async (groupsId: string[]) => {
    await this.repository.delete(groupsId);
  };
}

export default GroupRepository;
