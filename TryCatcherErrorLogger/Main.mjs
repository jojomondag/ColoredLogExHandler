import Logger from '../Helpers/MessageHelper.mjs';
import { tryCatchAsync } from '../Helpers/ExceptionHelper.mjs';
import VError from 'verror';

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
      throw new VError({
        name: 'SimulatedError',
        cause: err,
        info: {
          message: 'A simulated error.'
        }
      });
    }
  });

  await tryCatchAsync(async () => {
    try {
      await generateLowLevelError();
    } catch (err) {
      throw new VError({
        name: 'HighLevelError',
        cause: err,
        info: {
          message: 'A high-level error.'
        }
      });
    }
  });

  // Flush the logs to the logger
  await Logger.flushLogs();
}