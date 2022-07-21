import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import User from '@entities/User';

@Entity({ name: 'groups' })
class GroupEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column()
    name: string;

  @Column('text', { array: true, default: [] })
    permissions: string[];

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'users_groups'
  })
    users: User[];
}

export default GroupEntity;
