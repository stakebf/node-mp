import { DataSource } from 'typeorm';
import { IGroup } from '@src/shared/types/group';
import UserRepository from '@repositories/user';
import GroupRepository from '@repositories/group';

class GroupService {
  private readonly groupRepository: GroupRepository;
  private readonly userRepository: UserRepository;
  private readonly groupDataSource: DataSource;

  constructor(groupRepository: GroupRepository, userRepository: UserRepository, dataSource: DataSource) {
    this.groupRepository = groupRepository;
    this.userRepository = userRepository;
    this.groupDataSource = dataSource;
  }

  createGroup = async (group: Omit<IGroup, 'id' | 'createdAt'> & { users: string[] }): Promise<IGroup | undefined> => {
    const users = await this.userRepository.getUserListByIDs(group.users ?? []);
    const createdGroup = await this.groupRepository.createGroup({ ...group, users });

    return createdGroup;
  };

  getGroupByID = async (id: string): Promise<IGroup | undefined> => {
    const group = await this.groupRepository.getGroupByID(id);

    return group;
  };

  updateGroup = async (id: string, newGroupInfo: Partial<IGroup> & { users?: string[] }): Promise<IGroup | undefined> => {
    const users = await this.userRepository.getUserListByIDs(newGroupInfo.users ?? []);
    const updatedGroup = await this.groupRepository.updateGroup(id, newGroupInfo, users);

    return updatedGroup;
  };

  deleteGroup = async (id: string): Promise<IGroup | undefined> => {
    const deletedGroup = await this.groupRepository.deleteGroup(id);

    return deletedGroup;
  };

  addUsersToGroup = async (groupId: string, userIds: string[]): Promise<IGroup | undefined | null> => {
    const users = await this.userRepository.getUserListByIDs(userIds);
    const group = await this.getGroupByID(groupId);

    if (!group || !users?.length) {
      return undefined;
    }

    users.forEach((user) => {
      const isGroupExist = user.groups.find(({ id }) => groupId === id);

      if (!isGroupExist) {
        group.users?.push(user);
      }
    });

    let updatedGroup;

    await this.groupDataSource.manager.transaction(async (transactionalEntityManager) => {
      try {
        updatedGroup = await transactionalEntityManager.save(group);
      } catch (e) {
        return null;
      }
    });

    return updatedGroup;
  };
}

export default GroupService;
