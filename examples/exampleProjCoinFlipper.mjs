import { Logger, tryCatchAsync, createAndThrowVError } from '../src/helpers/indexBarrel.mjs';

// Function to simulate a coin flip
async function flipCoin() {
    const randomValue = Math.random();
    if (randomValue < 0.5) {
        Logger.logSuccess('Heads!');
    } else if (randomValue < 0.98) {
        Logger.logSuccess('Tails!');
    } else {
        createAndThrowVError(new Error('Coin landed on its edge.'));
    }
}

// Exported function to execute the coin flips
export async function flipCoinExample() {
    for (let i = 0; i < 100; i++) {
        await tryCatchAsync(flipCoin);
    }
    await Logger.flushLogs();
}