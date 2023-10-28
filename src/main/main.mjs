import readline from 'readline';
import { flipCoinExample } from '../../examples/exampleProjCoinFlipper.mjs';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function displayMenu() {
    console.log('');  // Adds a line break before displaying the menu
    console.log('1. Run Coin Flip Example');
    console.log('2. Run Error Generation Example');
    console.log('0. Exit');
    console.log('');  // Adds a line break before displaying the menu
    rl.question('Enter your choice: ', handleMenuSelection);
}

function handleMenuSelection(choice) {
    console.log('');  // Adds a line break before executing the choice
    switch (choice) {
        case '1':
            flipCoinExample().finally(() => {
                console.log('');  // Adds a line break before redisplaying the menu
                displayMenu();
            });
            break;
        case '2':
            generateErrorsAndWarnings().finally(() => {
                console.log('');  // Adds a line break before redisplaying the menu
                displayMenu();
            });
            break;
        case '0':
            rl.close();
            break;
        default:
            console.log('Invalid choice. Try again.');
            displayMenu();
            break;
    }
}

export async function generateErrorsAndWarnings() {
}

// Display menu on startup
displayMenu();