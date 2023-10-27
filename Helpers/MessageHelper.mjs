import fs from 'fs';
import winston from 'winston';
import chalk from 'chalk';
import { promises as fsPromises } from 'fs';
import { parse } from 'stack-trace';
import { fileURLToPath } from 'url';
import path from 'path';
import VError from 'verror';
import { LOGGING_ENABLED } from './config.mjs';

function formatFilePath(filePath, projectName) {
  return filePath.replace(`${projectName}/`, '');
}
function extractFilePath(error, messageHelper) {
  if (error instanceof VError) {
    error = error.cause();
  }

  if (error instanceof Error && error.stack) {
    const trace = parse(error);
    const callSite = trace[1];
    if (callSite) {
      const fullPath = callSite.getFileName();
      const formattedFullPath = fullPath.replace('file://', '').replace(/\\/g, '/');
      const projectDirectory = messageHelper.getProjectDirectory().replace(/\\/g, '/') + '/';
      const relativePath = formattedFullPath.replace(projectDirectory, '');
      return {
        filePath: relativePath,
        lineNumber: callSite.getLineNumber(),
      };
    }
  }
  return { filePath: 'Unknown file', lineNumber: 'Unknown line' };
}
function generateLogMessage({ timestamp, level, message, error }, messageHelper) {
  const { filePath, lineNumber } = error ? extractFilePath(error, messageHelper) : { filePath: 'Unknown file', lineNumber: 'Unknown line' };
  const formattedFilePath = formatFilePath(filePath, messageHelper.getProjectName());
  return `${timestamp} ${level}: ${message} (File: ${formattedFilePath}, Line: ${lineNumber})`;
}
class MessageHelper {
  constructor() {
    this.projectName = this.getProjectName();
    this.logDirectory = 'logs';
    this.logger = this.createLogger(this.logDirectory, this);
    this.messages = [];
    this.addConsoleTransport();
  }
  getFilePathInfo() {
    const currentFileUrl = import.meta.url;
    const currentFilePath = fileURLToPath(currentFileUrl);
    const currentDir = path.dirname(currentFilePath);
    const projectDirectory = path.resolve(currentDir, '../../');
    return { projectDirectory, projectName: path.basename(projectDirectory) };
  }
  addConsoleTransport() {
    if (process.env.NODE_ENV !== 'production') {
      const consoleFormat = winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(info => `${chalk.blue(info.timestamp)} ${colorizeLevel(info.level)}: ${info.message}`)
      );

      this.logger.add(new winston.transports.Console({
        format: consoleFormat
      }));
    }
  }
  log(type, message, error = null) {
    if (LOGGING_ENABLED) {
      console.log('Error object:', error);
      if (error) {
        console.log(error.stack);
      }
    }
    const formattedMessage = this.formatMessage(message, error, this);
    this.logger[type](formattedMessage, { error });
    this.messages.push(this.createMessageObject(formattedMessage, type));
  }
  formatMessage(message, error, messageHelper) {
    const formattedFilePath = formatFilePath(extractFilePath(error, messageHelper).filePath, this.projectName);
    return `${message} (File: ${formattedFilePath}, Line: ${extractFilePath(error, messageHelper).lineNumber})`;
  }
  createMessageObject(formattedMessage, type) {
    return {
      [type]: formattedMessage,
      timestamp: new Date().toISOString().slice(16)
    };
  }
  logSuccess(message, error = null) {
    this.log('info', message, error);
  }
  logError(message, error) {
    this.log('error', message, error);
  }
  logWarn(message, error = null) {
    this.log('warn', message, error);
  }
  getProjectName() {
    const { projectName } = this.getFilePathInfo();
    return projectName;
  }
  getProjectDirectory() {
    const { projectDirectory } = this.getFilePathInfo();
    return projectDirectory;
  }
  createLogger(logDirectory, messageHelper) {
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }

    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'h:mm:ss A' }),
      winston.format.printf(info => generateLogMessage(info, messageHelper))
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
  async saveMessagesToJsonFile() {
    const logFilePath = `${this.logDirectory}/ExecutionLog.json`;
    const currentDate = new Date();

    const projectName = this.getProjectName();
    const projectDirectory = this.getProjectDirectory();

    const aggregatedMessages = {
      Summary: {
        Hour_Minutes: currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        File: `file://${projectDirectory.replace(/\\/g, '/')}/${projectName}/`,
      },
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
    this.messages = [];
  }
}
function colorizeLevel(level) {
  switch (level) {
    case 'info': return chalk.green(level);
    case 'warn': return chalk.yellow(level);
    case 'error': return chalk.red(level);
    default: return level;
  }
}
export default new MessageHelper();