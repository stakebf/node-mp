import { MigrationInterface, QueryRunner } from 'typeorm';
import UserEntity from '../entities/User';

export class CreateUserTable1655839053915 implements MigrationInterface {
  name = 'CreateUserTable1655839053915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying NOT NULL, "password" character varying NOT NULL, "age" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))');

    await queryRunner.manager.insert(UserEntity, {
      id: 'a81bc81b-dead-4e5d-abff-90865d1e13b1',
      login: 'test',
      password: 'test123',
      age: 20
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
