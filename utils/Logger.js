const winston = require('winston');
const fs = require('fs');

class Logger {
  constructor() {
    const configData = fs.readFileSync('config.json', 'utf8');
    const logConfig = JSON.parse(configData).log;

    this.logger = winston.createLogger({
      level: logConfig.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: logConfig.filename , maxsize: logConfig.maxsize })
      ]
    });
  }
  error(message) {
    this.logger.error(message);
  }
  warn(message) {
    this.logger.warn(message);
  }
  log(message) {
    this.logger.info(message);
  }
  verbose(message) {
    this.logger.verbose(message);
  }
  debug(message) {
    this.logger.debug(message);
  }
  silly(message){
    this.logger.silly(message);
  }
}

module.exports = new Logger();
