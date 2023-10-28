import fs from 'fs';
import winston from 'winston';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import chalk from 'chalk';
import { generateLogMessage, colorizeLevel } from './logHelper.mjs';
import { LOGGING_ENABLED } from '../config/config.mjs';


class MessageHelper {
  constructor() {
    this.projectInfo = this.getFilePathInfo();
    this.logDirectory = 'logs';
    this.logger = this.createLogger(this.logDirectory);
    this.messages = [];
    this.addConsoleTransport();
  }

  getFilePathInfo() {
    const currentFileUrl = import.meta.url;
    const currentFilePath = fileURLToPath(currentFileUrl);
    const currentDir = path.dirname(currentFilePath);
    const projectDirectory = path.resolve(currentDir, '../');
    return { projectDirectory, projectName: path.basename(projectDirectory) };
  }

  addConsoleTransport() {
    if (process.env.NODE_ENV !== 'production') {
      const consoleFormat = winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(info => `${chalk.blue(info.timestamp)} ${colorizeLevel(info.level)}: ${info.message}`)
      );
      this.logger.add(new winston.transports.Console({ format: consoleFormat }));
    }
  }

  log(type, message, error = null) {
    if (LOGGING_ENABLED) {
      if (error) {
        console.log(error.stack);
      }
    }
    const projectDirectory = this.projectInfo.projectDirectory.replace(/\\/g, '/');  // Convert to forward slashes
    const formattedMessage = generateLogMessage({ timestamp: new Date(), level: type, message, error }, this, projectDirectory);
    this.logger[type](formattedMessage, { error });
    this.messages.push({ [type]: formattedMessage, timestamp: new Date().toISOString().slice(16) });
  }

  logSuccess(message, error = null) { this.log('info', message, error); }
  logError(message, error) { this.log('error', message, error); }
  logWarn(message, error = null) { this.log('warn', message, error); }

  createLogger(logDirectory) {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'h:mm:ss A' }),
      winston.format.printf(info => info.message)
    );
    return winston.createLogger({
      level: 'info',
      format: logFormat,
      transports: [
        new winston.transports.File({ filename: `${logDirectory}/error.json`, level: 'error' }),
        new winston.transports.File({ filename: `${logDirectory}/combined.json` })
      ]
    });
  }

// Inside MessageHelper class
async saveMessagesToJsonFile() {
  const logFilePath = `${this.logDirectory}/ExecutionLog.json`;

  // Get the current date and format it as desired
  const currentDate = new Date().toString();

  // Get the project directory and replace backslashes with forward slashes
  let projectDirectory = this.projectInfo.projectDirectory.replace(/\\/g, '/');

  // Ensure there's no trailing slash
  projectDirectory = projectDirectory.endsWith('/') ? projectDirectory.slice(0, -1) : projectDirectory;

  const aggregatedMessages = {
      Summary: {
          Hour_Minutes: currentDate,  // Use the formatted current date
          File: `file://${projectDirectory}/`,
      },
      Errors: this.messages.filter(msg => msg.error),
      Successful: this.messages.filter(msg => msg.success)
  };
  const json = JSON.stringify(aggregatedMessages, null, 2);
  try {
      await fsPromises.writeFile(logFilePath, json);
  } catch (err) {
      this.logError(`Failed to write to ${logFilePath}: ${err.message}`, err);
  }
}


  async flushLogs() {
    await this.saveMessagesToJsonFile();
    this.messages = [];
  }
}

export default new MessageHelper();