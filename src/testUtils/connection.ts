import { TestPostgresDataSource } from '@src/testUtils/data-source-tests';

class TestConnection {
  create = async (): Promise<void> => {
    await TestPostgresDataSource.initialize().then(() => {
      console.log('PostgresDataSource is initialized');
    })
      .catch((error) => {
        console.log(error);
      });
  };
  destroy = async (): Promise<void> => {
    await TestPostgresDataSource.destroy();
  };
}

export default TestConnection;
