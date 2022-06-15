const { createLogger, transports } = require('winston');

const logger = createLogger({
  transports: [
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true }),
    new transports.File({ filename: './logs/app.log', level: 'info' })
  ],
  exitOnError: false
});

export default logger;
