import Logger from './MessageHelper.mjs';

export async function tryCatchAsync(action, errorHandler = null) {
    try {
        await action();
    } catch (ex) {
        Logger.logError(`Oops! Something went wrong: ${ex.message}`);
        if (errorHandler) {
            await errorHandler(ex);
        }
    }
}
export async function tryCatchAsyncWithResult(action, errorHandler = null) {
    try {
        return await action();
    } catch (ex) {
        Logger.logError(`Oops! Something went wrong: ${ex.message}`);
        if (errorHandler) {
            await errorHandler(ex);
        }
        return null;
    }
}
export async function handleExceptionAsync(ex, errorMessage = null) {
    Logger.logError(errorMessage || `Oops! Something went wrong: ${ex.message}`);
}
export async function tryCatchAsyncCustom(action, catchBlock) {
    try {
        return await action();
    } catch (ex) {
        Logger.logError(`Oops! Something went wrong: ${ex.message}`);
        return await catchBlock(ex);
    }
}