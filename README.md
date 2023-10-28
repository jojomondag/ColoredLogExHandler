# ColoredLogExHandler

ColoredLogExHandler is a sophisticated logging and exception handling library for Node.js projects. It facilitates structured logging with color-coded messages, streamlined exception handling, and exports log data in a user-friendly JSON format. The library supports a variety of logging levels and is built to handle asynchronous operations seamlessly.

## Features
- Color-coded logging for console output.
- Structured logging to JSON files for easy parsing and analysis.
- Robust asynchronous exception handling to ensure operational continuity.
- Demo projects to showcase the library's capabilities and usage.
- Configurable logging preferences to suit different project requirements.

## Getting Started

### Installation
1. Clone the repository to your local machine.
```bash
git clone https://github.com/your-username/ColoredLogExHandler.git
```
2. Navigate to the project directory.
```bash
cd ColoredLogExHandler
```
3. Install the required dependencies.
```bash
npm install
```

### Usage
Import the necessary helpers from the library and use them in your project.

```javascript
import { Logger, tryCatchAsync, createAndThrowVError } from './src/helpers/indexBarrel.mjs';

// Function to simulate a coin flip
async function flipCoin() {
    try {
        const randomValue = Math.random();
        if (randomValue < 0.5) {
            Logger.logSuccess('Heads!');
        } else if (randomValue < 0.98) {
            Logger.logSuccess('Tails!');
        } else {
            throw new Error('Coin landed on its edge.');
        }
    } catch (error) {
        createAndThrowVError(error);
    }
}

// Execute the function
flipCoin();
```

## Examples
The `examples` directory within the project houses illustrative examples demonstrating the usage of the library for logging and exception handling.

- `exampleProjCoinFlipper.mjs` simulates a coin flip and logs the result.
- `exampleUsage.mjs` demonstrates the application of logging and exception handling features in various scenarios.

To execute the examples, run the following command:
```bash
npm start
```

## Configuration
Logging preferences can be tailored in the `src/config/config.mjs` file. Set `LOGGING_ENABLED` to `true` to activate logging, or `false` to disable it.

## Documentation
In-depth documentation is embedded within the source code, elucidating the purpose and utilization of each function and class.

## Dependencies
ColoredLogExHandler leans on the following dependencies:
- chalk
- stack-trace
- verror
- winston

Ensure to install these dependencies using `npm install` before leveraging the library.

## Contributing
Contributions to this project are warmly welcomed. Feel free to create issues, submit pull requests, or reach out to the repository owner.

## License
ColoredLogExHandler is licensed under the ISC License. Refer to the LICENSE.md file for more details.