// Logger.mjs
import fs from 'fs';
import winston from 'winston';
import chalk from 'chalk';
import { promises as fsPromises } from 'fs';

function createLogger() {
  const logDirectory = 'logs';
  
  // Check if the log directory exists, create it if not
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()  // Log in JSON format
    ),
    transports: [
      new winston.transports.File({ filename: `${logDirectory}/error.json`, level: 'error' }),  // Prepend directory to file paths
      new winston.transports.File({ filename: `${logDirectory}/combined.json` })  // Prepend directory to file paths
    ]
  });
}
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
class Logger {
  constructor() {
    this.infoMessages = [];
    this.warnMessages = [];
    this.errorMessages = [];
    this.logger = createLogger();
    addConsoleTransport(this.logger);
  }
  async prependLogs(level, messages) {
    if (messages.length > 0) {
      const logDirectory = 'logs';
      const filepath = level === 'error' ? `${logDirectory}/error.json` : `${logDirectory}/combined.json`;

      // Read existing log data
      let existingData = '';
      try {
        existingData = await fsPromises.readFile(filepath, 'utf8');
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;  // Ignore file not found error
      }

      // Create new log messages using Winston logger to ensure formatting (including timestamp)
      const newLogEntries = messages.map(msg => {
        const info = { level, ...msg };
        const formatted = this.logger.format.transform(info, this.logger.format.options);
        return JSON.stringify(formatted);
      });

      // Prepend new log messages
      const newData = newLogEntries.join('\n') + '\n' + existingData;

      // Write updated log data back to file
      await fsPromises.writeFile(filepath, newData);
    }
  }  logInfo(message, { file, line } = {}) {
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
  async flushLogs() {
    await Promise.all([
      this.prependLogs('info', this.infoMessages),
      this.prependLogs('warn', this.warnMessages),
      this.prependLogs('error', this.errorMessages)
    ]);
    this.infoMessages = [];
    this.warnMessages = [];
    this.errorMessages = [];
  }
}

export default new Logger();