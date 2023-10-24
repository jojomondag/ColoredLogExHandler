import logger from './logger.mjs';
import verrorPkg from 'verror';
const { VError } = verrorPkg;

// Example log messages
logger.info('This is an info message.');
logger.warn('This is a warning message.');
logger.error('This is an error message.');

// Example with VError
try {
  try {
    throw new Error('A low-level error');
  } catch (err) {
    throw new VError(err, 'A high-level error');
  }
} catch (err) {
  logger.error(err.message);
}