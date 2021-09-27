import fs from 'fs' // enables interacting with the file system
import path from 'path' // provides utilities for working with file and directory paths
import config from 'config' //Node-config organizes hierarchical configurations for your app deployments
import winston from 'winston' //A logger for just about everything
import winstonDaily from 'winston-daily-rotate-file'//A transport for winston which logs to a rotating file

// logs dir
const logDir: string = path.join(__dirname, config.get('log.dir'))

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack })
  }
  return info
})

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp({
      format: 'DD.MM.YYYY HH:mm:ss',
    }),
    logFormat
  ),
  transports: [
    // debug log setting
    new winstonDaily({
      level: 'debug',
      datePattern: 'DD.MM.YYYY',
      dirname: logDir + '/debug', // log file /logs/debug/*.log in save
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      json: false,
      zippedArchive: true,
    }),
    // error log setting
    new winstonDaily({
      level: 'error',
      datePattern: 'DD.MM.YYYY',
      dirname: logDir + '/error', // log file /logs/error/*.log in save
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    })
  ]
})

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(winston.format.splat(), winston.format.colorize()),
  })
)

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')))
  }
}

export { logger, stream }
