module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  preset: 'ts-jest',
  testTimeout: 100000,
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@routes/(.*)': '<rootDir>/src/routes/$1',
    '@repositories/(.*)': '<rootDir>/src/repositories/$1',
    '@controllers/(.*)': '<rootDir>/src/controllers/$1',
    '@shared/(.*)': '<rootDir>/src/shared/$1',
    '@middlewares/(.*)': '<rootDir>/src/middlewares/$1',
    '@entities/(.*)': '<rootDir>/src/entities/$1',
    '@migrations/(.*)': '<rootDir>/src/migrations/$1'
  }
};
