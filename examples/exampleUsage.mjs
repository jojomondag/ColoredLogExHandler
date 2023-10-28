import { Logger, tryCatchAsync, createAndThrowVError } from '../src/helpers/indexBarrel.mjs';

// Define some dummy functions to simulate different scenarios
async function simulateSuccessScenario() {
    // Simulate a successful operation
    Logger.logSuccess('The operation completed successfully.');
}

async function simulateWarningScenario() {
    // Simulate a warning scenario
    Logger.logWarn('A potential issue has been detected.', new Error('Warning detected'));
}

async function simulateErrorScenario() {
    // Simulate an error scenario
    try {
        throw new Error('An error occurred.');
    } catch (err) {
        createAndThrowVError(err);
    }
}

// Execution
(async () => {
    // Execute each scenario using the tryCatchAsync helper
    await tryCatchAsync(simulateSuccessScenario);
    await tryCatchAsync(simulateWarningScenario);
    await tryCatchAsync(simulateErrorScenario);

    // Flush the logs
    await Logger.flushLogs();
})();
