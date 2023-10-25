// extendedLogger.mjs
import winston from 'winston';
import chalk from 'chalk';

// Function to colorize the severity level
function colorizeLevel(level) {
  switch (level) {
    case 'info':
      return chalk.green(level);
    case 'warn':
      return chalk.yellow(level);
    case 'error':
      return chalk.red(level);
    default:
      return level;
  }
}

// Custom format function for console output
const customFormat = winston.format.printf(info => {
  const { timestamp, level, message, errorCode, file, line } = info;
  return `${chalk.blue(timestamp)} ${colorizeLevel(level)}: ${message} ${errorCode ? `(Error Code: ${errorCode})` : ''} ${file ? `at File: ${file} Line: ${line}` : ''}`;
});

// Function to create the Winston logger
function createLogger() {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()  // Log in JSON format
    ),
    transports: [
      new winston.transports.File({ filename: 'error.json', level: 'error' }),  // Change file extension to .json
      new winston.transports.File({ filename: 'combined.json' })  // Change file extension to .json
    ]
  });
}

// Function to add a console transport to the logger
function addConsoleTransport(logger) {
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        customFormat  // Apply the custom format for console output
      )
    }));
  }
}
class ExtendedLogger {
  constructor() {
    this.infoMessages = [];
    this.warnMessages = [];
    this.errorMessages = [];
    this.logger = createLogger();
    addConsoleTransport(this.logger);
  }
  logInfo(message, { file, line } = {}) {
    this.infoMessages.push({ message, file, line });
  }
  logWarn(message, { errorCode, file, line } = {}) {
    this.warnMessages.push({ message, errorCode, file, line });
  }
  logError(err, { errorCode } = {}) {
    let message = err instanceof Error ? err.message : err;
    let { file, line } = this.getStackTraceInfo(err);
    this.errorMessages.push({ message, errorCode, file, line });
  }
  getStackTraceInfo(err) {
    if (err instanceof Error) {
      const stackLines = err.stack.split('\n');
      if (stackLines.length > 1) {
        const match = stackLines[1].match(/at .* \((.*):(\d+):\d+\)/) || stackLines[1].match(/at (.*):(\d+):\d+/);
        if (match) {
          return { file: match[1], line: match[2] };
        }
      }
    }
    return { file: '', line: '' };
  }
  flushLogs() {
    this.infoMessages.forEach(msg => {
      this.logger.info(msg);
    });
    this.warnMessages.forEach(msg => {
      this.logger.warn(msg);
    });
    this.errorMessages.forEach(msg => {
      this.logger.error(msg);
    });
    this.infoMessages = [];
    this.warnMessages = [];
    this.errorMessages = [];
  }
  flushLogType(logType, messages) {
    if (messages.length > 0) {
      messages.forEach(msg => {
        this.logger[logType](msg);
      });
      messages.length = 0;  // Clear the messages array
    }
  }
}

export default new ExtendedLogger();
