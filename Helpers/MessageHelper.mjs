import fs from 'fs';
import winston from 'winston';
import chalk from 'chalk';
import { promises as fsPromises } from 'fs';
import { parse } from 'stack-trace';
import { fileURLToPath } from 'url';
import path from 'path';

function extractFilePath(error) {
    if (error instanceof Error && error.stack) {
        const trace = parse(error);
        const callSite = trace[1];
        if (callSite) {
            const fullPath = callSite.getFileName();
            // Replace the 'file://' prefix and convert backslashes to forward slashes for consistency
            const formattedFullPath = fullPath.replace('file://', '').replace(/\\/g, '/');
            const projectDirectory = getProjectDirectory().replace(/\\/g, '/') + '/';
            // Get the relative path by replacing the project directory part in the full path
            const relativePath = formattedFullPath.replace(projectDirectory, '');
            return {
                filePath: relativePath,
                lineNumber: callSite.getLineNumber(),
            };
        }
    }
    return { filePath: 'Unknown file', lineNumber: 'Unknown line' };
}


function getProjectDirectory() {
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentDir = path.dirname(currentFilePath);
  const projectDirectory = path.resolve(currentDir, '../../');
  return projectDirectory;
}


function generateLogMessage({timestamp, level, message, error}) {
  const { filePath, lineNumber } = error ? extractFilePath(error) : { filePath: 'Unknown file', lineNumber: 'Unknown line' };
  // Remove the project name from the file path
  const formattedFilePath = filePath.replace('jojoSupaLoggExceptionColour/', '');
  return `${timestamp} ${level}: ${message} (File: ${formattedFilePath}, Line: ${lineNumber})`;
}

function formatMessage(message, error) {
  // Remove the project name from the file path
  const formattedFilePath = extractFilePath(error).filePath.replace('jojoSupaLoggExceptionColour/', '');
  return `${message} (File: ${formattedFilePath}, Line: ${extractFilePath(error).lineNumber})`;
}

function log(type, message, error = null) {
  const formattedMessage = formatMessage(message, error);
  this.logger[type](formattedMessage, { error });
  this.messages.push(createMessageObject(formattedMessage, type));
}

function createMessageObject(formattedMessage, type) {
  return { 
    [type]: formattedMessage, 
    timestamp: new Date().toISOString().slice(16)  // This slices off the date part, keeping the time and the timezone offset.
  };
}

function colorizeLevel(level) {
  switch (level) {
    case 'info': return chalk.green(level);
    case 'warn': return chalk.yellow(level);
    case 'error': return chalk.red(level);
    default: return level;
  }
}

function createLogger(logDirectory) {
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }
  
  const logFormat = winston.format.combine(
    winston.format.timestamp({format: 'h:mm:ss A'}),
    winston.format.printf(info => generateLogMessage(info))
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
class MessageHelper {
  constructor() {
    this.logDirectory = 'logs';
    this.logger = createLogger(this.logDirectory);
    this.messages = [];
    this.addConsoleTransport();
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

  logSuccess(message, error = null) {
    log.call(this, 'info', message, error);
  }

  logError(message, error) {
    log.call(this, 'error', message, error);
  }

  logWarn(message, error = null) {
    log.call(this, 'warn', message, error);
  }

  async saveMessagesToJsonFile() {
    const logFilePath = `${this.logDirectory}/ExecutionLog.json`;
    const currentDate = new Date();

    const projectDirectory = getProjectDirectory();

    // Mapping through the errors and modifying the timestamp property to trim the date part
    const errorsWithTrimmedTimestamps = this.messages.filter(msg => msg.error)
      .map(msg => {
        const trimmedTimestamp = msg.timestamp.slice(8);  // This slices off the date part, keeping the time and the timezone offset.
        return { ...msg, timestamp: trimmedTimestamp };
      });

      const aggregatedMessages = {
        Summary: {
            Hour_Minutes: currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),  // This will output the time in HH:mm format
            File: `file://${projectDirectory.replace(/\\/g, '/')}/jojoSupaLoggExceptionColour/`,  // Convert Windows-style paths to URL format
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
    this.messages = [];  // Clear the messages queue after saving
  }
}

export default new MessageHelper();