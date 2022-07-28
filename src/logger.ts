import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      if (info.method) {
        return `${info.timestamp} - ${info.level} - ${info.message} - { args: ${JSON.stringify(info.args)} }`;
      }

      return `${info.timestamp} - ${info.level} - ${info.message}`;
    })
  ),
  transports: [
    new transports.Console({
      level: 'debug',
      handleExceptions: true
    }),
    new transports.File({ filename: './logs/app.log', level: 'error' })
  ],
  exitOnError: false
});

export default logger;
