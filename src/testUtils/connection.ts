import { DataSource } from 'typeorm';

class TestConnection {
  connection: DataSource;

  constructor(connection: DataSource) {
    this.connection = connection;
  }

  create = async (): Promise<void> => {
    await this.connection.initialize().then(() => {
      console.log('PostgresDataSource is initialized');
    })
      .catch((error) => {
        console.log(error);
      });
  };
  destroy = async (): Promise<void> => {
    await this.connection.destroy();
  };
}

export default TestConnection;
