import { Logger, tryCatchAsync, createAndThrowVError } from '../src/helpers/indexBarrel.mjs';

// Define some dummy functions to simulate different scenarios
async function simulateSuccessScenario() {
    // Simulate a successful operation
    Logger.logSuccess('The operation completed successfully.');
}

async function simulateWarningScenario() {
    // Simulate a warning scenario
    Logger.logWarn('A potential issue has been detected.', createAndThrowVError(new Error('Warning detected')));
}

async function simulateErrorScenario() {
    // Simulate an error scenario
    createAndThrowVError(new Error('An error occurred.'));
}

// Execution
(async () => {
    // Execute each scenario using the tryCatchAsync helper
    await tryCatchAsync(simulateSuccessScenario);
    await tryCatchAsync(simulateWarningScenario);
    await tryCatchAsync(simulateErrorScenario);
    await execute(simulateErrorScenario);  // Assuming execute is imported or defined elsewhere
    // Flush the logs
    await Logger.flushLogs();
})();