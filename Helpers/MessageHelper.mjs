import fs from 'fs';
import winston from 'winston';
import chalk from 'chalk';
import { promises as fsPromises } from 'fs';
import { parse } from 'stack-trace';

function extractFilePath(error) {
  const trace = parse(error);
  const callSite = trace[1];  // The first call site is usually the location where the error was thrown
  if (callSite) {
      return {
          filePath: callSite.getFileName(),
          lineNumber: callSite.getLineNumber(),
      };
  }
  return { filePath: 'Unknown file', lineNumber: 'Unknown line' };
}

function createLogger(logDirectory) {
  // Ensure the log directory exists
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(info => {
        const { timestamp, level, message, error } = info;
        const { filePath, lineNumber } = error ? extractFilePath(error) : { filePath: 'Unknown file', lineNumber: 'Unknown line' };
        return `${timestamp} ${level}: ${message} (File: ${filePath}, Line: ${lineNumber})`;
      })
    ),
    transports: [
      new winston.transports.File({ filename: `${logDirectory}/error.json`, level: 'error' }),
      new winston.transports.File({ filename: `${logDirectory}/combined.json` })
    ]
  });
}

class MessageHelper {
  constructor() {
    this.logDirectory = 'logs';
    this.logger = createLogger(this.logDirectory);
    this.messages = [];
    this.addConsoleTransport();
  }

  addConsoleTransport() {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(info => {
            const { timestamp, level, message } = info;
            return `${chalk.blue(timestamp)} ${colorizeLevel(level)}: ${message}`;
          })
        )
      }));
    }
  }

  logSuccess(message, error = null) {
    const formattedMessage = formatMessage(message, error);
    this.logger.info(formattedMessage, { error });
    const successMessage = createErrorMessage(formattedMessage);
    this.messages.push(successMessage);
}

  logError(message, error) {
    const formattedMessage = formatMessage(message, error);
    this.logger.error(formattedMessage, { error });
    const errorMessage = createErrorMessage(formattedMessage);
    this.messages.push(errorMessage);
}


logWarn(message, error = null) {
  const formattedMessage = formatMessage(message, error);
  this.logger.warn(formattedMessage, { error });
  const warnMessage = createErrorMessage(formattedMessage);
  this.messages.push(warnMessage);
}

  async saveMessagesToJsonFile() {
    const logFilePath = `${this.logDirectory}/ExecutionLog.json`;

    const aggregatedMessages = {
      Errors: this.messages.filter(msg => msg.error),
      Successful: this.messages.filter(msg => msg.success)
    };

    const json = JSON.stringify(aggregatedMessages, null, 2);

    try {
      await fsPromises.writeFile(logFilePath, json);
    } catch (err) {
      this.logger.error(`Failed to write to ${logFilePath}: ${err.message}`, { error: err });
    }
  }

  async flushLogs() {
    await this.saveMessagesToJsonFile();
    this.messages = [];  // Clear the messages queue after saving
  }
}
function formatMessage(message, error) {
  const { filePath, lineNumber } = error instanceof Error ? extractFilePath(error) : { filePath: 'Unknown file', lineNumber: 'Unknown line' };
  return `${message} (File: ${filePath}, Line: ${lineNumber})`;
}
function createErrorMessage(formattedMessage) {
  return { error: formattedMessage, timestamp: new Date().toISOString() };
}


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

export default new MessageHelper();