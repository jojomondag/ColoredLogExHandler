import Logger from '../helpers/messageHelper.mjs';

/**
 * Handles the execution of a function and logs any errors that occur.
 * @param {Function} action - The function to execute.
 * @param {Function} [errorHandler] - Optional error handler to call on error.
 * @return {Promise} The result of the action, or null if an error occurs.
 */
export async function execute(action, errorHandler = null) {
    try {
        return await action();
    } catch (ex) {
        if (errorHandler) {
            await errorHandler(ex);
        } else {
            logError(ex);
        }
        return null;
    }
}
/**
 * Logs an error to the logger.
 * @param {Error} ex - The error to log.
 * @param {string} [errorMessage] - Optional custom error message.
 */
function logError(ex, errorMessage = null) {
    Logger.logError(errorMessage || `Oops! Something went wrong: ${ex.message}`, ex);
}

export const LOGGING_ENABLED = false;