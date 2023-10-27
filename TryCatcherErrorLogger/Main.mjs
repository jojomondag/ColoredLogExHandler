import Logger from '../Helpers/MessageHelper.mjs';
import { execute as tryCatchAsync } from '../Helpers/ExceptionHelper.mjs';
import { createAndThrowVError } from '../Helpers/ErrorHandlingHelper.mjs';

generateErrorsAndWarnings();

async function generateLowLevelError() {
  throw new Error('A low-level error');
}

async function generateSimulatedError() {
  throw new Error('A simulated error.');
}

async function generateErrorsAndWarnings() {
  // Log messages
  Logger.logSuccess('This is an info message.', new Error());
  Logger.logWarn('This is a warning message.', new Error());
  Logger.logError('This is an Error message.', new Error());

  // Generate errors using tryCatchAsync
  await tryCatchAsync(async () => {
    try {
      await generateSimulatedError();
    } catch (err) {
      await createAndThrowVError(err);  // Updated to use the new function
    }
  });

  await tryCatchAsync(async () => {
    try {
      await generateLowLevelError();
    } catch (err) {
      await createAndThrowVError(err);  // Updated to use the new function
    }
  });

  // Flush the logs to the logger
  await Logger.flushLogs();
}