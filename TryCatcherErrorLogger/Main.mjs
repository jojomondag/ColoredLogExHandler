// Import the necessary modules and functions
import Logger from '../Helpers/MessageHelper.mjs';
import { tryCatchAsync } from '../Helpers/ExceptionHelper.mjs';
import VError from 'verror';  // Assuming you have 'verror' installed as a dependency

generateErrorsAndWarnings();

async function generateLowLevelError() {
  throw new Error('A low-level error');
}
async function generateSimulatedError() {
  throw new Error('A simulated error.');
}
async function generateErrorsAndWarnings() {
  // Log a warning message
  Logger.logSuccess('This is an info message.', new Error());
  Logger.logWarn('This is a warning message.', new Error());
  Logger.logError('This is an Error message.', new Error());

  // Generate an error using tryCatchAsync
  await tryCatchAsync(generateSimulatedError);

  // Generate a higher-level error using tryCatchAsync
  await tryCatchAsync(async () => {
      try {
          await generateLowLevelError();
      } catch (err) {
          throw new VError(err, 'A high-level error.');
      }
  });

  // Flush the logs to the logger
  await Logger.flushLogs();
}