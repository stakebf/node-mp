import { v4 as uuidv4 } from 'uuid';
import UserModel from '../user';
import { IUser } from '@shared/types/user';

const getMockedUserConfig = (config: Partial<IUser>) => ({
    login: 'user',
    password: '1234',
    age: 25,
    ...config
}); 

describe('UserModel', () => {
  test('should correctly create users', () => {
    const userList = new UserModel();
    const mockedUser: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({});
    userList.createUser(mockedUser);

    expect(userList.getAvailableUserList()).toHaveLength(1);
    expect(userList.getAvailableUserList()[0].isDeleted).toBe(false);
  });

  test('should return user by passed ID', () => {
    const userList = new UserModel();
    const mockedUser: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({});
    const createdUser = userList.createUser(mockedUser);

    expect(userList.getUserByID(createdUser!.id)).toEqual(createdUser);
  });

  test('should return `undefined` by wrong passed ID', () => {
    const userList = new UserModel();
    const mockedUser: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({});
    userList.createUser(mockedUser);

    expect(userList.getUserByID(uuidv4())).toEqual(undefined);
  });

  test('should correctly do soft delete user', () => {
    const userList = new UserModel();
    const mockedUser1: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({ login: 'user1'});
    const mockedUser2: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({ login: 'user2'});

    userList.createUser(mockedUser1);
    const userToDelete = userList.createUser(mockedUser2);
    
    expect(userList.getAvailableUserList()).toHaveLength(2);

    userList.softDeleteUser(userToDelete!.id);

    expect(userList.getAvailableUserList()).toHaveLength(1);
    expect(userList.getAvailableUserList()[0].id).not.toEqual(userToDelete?.id);
  });

  test('should return only available user list isDeleted=false', () => {
    const userList = new UserModel();
    const mockedUser1: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({ login: 'user1'});
    const mockedUser2: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({ login: 'user2'});
    const mockedUser3: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({ login: 'user3'});

    userList.createUser(mockedUser1);
    userList.createUser(mockedUser2);
    const userToDelete = userList.createUser(mockedUser3);
    
    userList.softDeleteUser(userToDelete!.id);

    expect(userList.getAvailableUserList()).toHaveLength(2);
  });

  test('should correctly update user', () => {
    const userList = new UserModel();
    const mockedUser1: Omit<IUser, 'id' | 'isDeleted'> = getMockedUserConfig({ login: 'user1'});

    const createdUser = userList.createUser(mockedUser1);
    const updatedUser = userList.updateUser(createdUser!.id, { login: 'updatedUser', age: 55 });

    expect(createdUser).not.toEqual(updatedUser);
    expect(updatedUser!.login).toEqual('updatedUser');
    expect(updatedUser!.age).toEqual(55);
  });

  test('should correctly return sorted auto suggest user list', () => {
    const userList = new UserModel();
    userList.createUser(getMockedUserConfig({ login: 'tazik'}));
    userList.createUser(getMockedUserConfig({ login: 'user3'}));
    userList.createUser(getMockedUserConfig({ login: 'talik'}));
    userList.createUser(getMockedUserConfig({ login: 'tabalik'}));
    userList.createUser(getMockedUserConfig({ login: 'ali'}));

    const autoSuggestUsersWithoutLimit = userList.getAutoSuggestUsers('ali');

    expect(autoSuggestUsersWithoutLimit).toHaveLength(3);
    expect(autoSuggestUsersWithoutLimit).toEqual(['ali', 'tabalik', 'talik']);

    const autoSuggestUsersWithLimit = userList.getAutoSuggestUsers('ali', 2);

    expect(autoSuggestUsersWithLimit).toHaveLength(2);
    expect(autoSuggestUsersWithLimit).toEqual(['ali', 'tabalik']);
  });
});
