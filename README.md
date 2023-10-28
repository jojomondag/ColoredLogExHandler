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

## Usage
ColoredLogExHandler provides an interactive menu to test its logging and exception handling features. Follow the steps below to explore the library's capabilities:

**1**. Run the project using the following command:
```bash
npm start
```

**Or**

Open Project in your favourite in a **IDE**: Just press **Run**

**2**. You will be presented with a menu with options:

**3**. Enter the number corresponding to your choice and press Enter.

By following the on-screen prompts, you can explore the different logging and exception handling scenarios implemented in the library.

## Examples
The `examples` directory within the project houses illustrative examples demonstrating the usage of the library for logging and exception handling.

## Configuration
Logging preferences can be tailored in the `src/config/config.mjs` file. Set `LOGGING_ENABLED` to `true` to activate logging, or `false` to disable it.

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
