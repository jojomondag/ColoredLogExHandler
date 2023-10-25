import Logger from './Logger.mjs';
import verrorPkg from 'verror';
const { VError } = verrorPkg;

// Example log messages
Logger.logInfo('This is an info message.');
Logger.logWarn('This is a warning message.');
Logger.logError('This is an error message.');

// Example with VError
try {
  try {
    throw new Error('A low-level error');  // This line will be captured in the log
  } catch (err) {
    throw new VError(err, 'A high-level error');
  }
} catch (err) {
  Logger.logError(err);  // Correct usage of logError
}

// Flush the logs to the logger
Logger.flushLogs();