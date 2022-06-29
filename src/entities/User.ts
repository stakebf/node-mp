import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import bcrypt from 'bcrypt';

@Entity({ name: 'user' })
class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column({
    unique: true
  })
    login: string;

  @Column()
    password: string;

  @Column()
    age: number;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;

  @DeleteDateColumn()
    deletedAt: Date;

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password ?? this.password, salt);
  }
}

export default UserEntity;
