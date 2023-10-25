import extendedLogger from './extendedLogger.mjs';
import verrorPkg from 'verror';
const { VError } = verrorPkg;

// Example log messages
extendedLogger.logInfo('This is an info message.');
extendedLogger.logWarn('This is a warning message.');
extendedLogger.logError('This is an error message.');

// Example with VError
try {
  try {
    throw new Error('A low-level error');  // This line will be captured in the log
  } catch (err) {
    throw new VError(err, 'A high-level error');
  }
} catch (err) {
  extendedLogger.logError(err);  // Correct usage of logError
}

// Flush the logs to the logger
extendedLogger.flushLogs();
