import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinTable,
  PrimaryColumn
} from 'typeorm';
import Group from '@entities/Group';
import User from '@entities/User';

@Entity('users_groups')
class UsersGroupsUsersGroups {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @PrimaryColumn({ type: 'uuid' })
    users_id: string;

  @PrimaryColumn({ type: 'uuid' })
    groups_id: string;

  @OneToOne(() => User)
  @JoinTable()
    hero: User;

  @OneToOne(() => Group)
  @JoinTable()
    skill: Group;
}

export default UsersGroupsUsersGroups;
