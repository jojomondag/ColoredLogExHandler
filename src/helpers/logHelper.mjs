import chalk from 'chalk';
import { parse } from 'stack-trace';

export function formatFilePath(filePath, projectName) {
  return filePath.replace(`${projectName}/`, '');
}

export function extractFilePath(error) {
  if (error instanceof Error && error.stack) {
    const trace = parse(error);
    const callSite = trace[1];
    if (callSite) {
      const fullPath = callSite.getFileName();
      const formattedFullPath = fullPath.replace('file://', '').replace(/\\/g, '/');
      return {
        filePath: formattedFullPath,
        lineNumber: callSite.getLineNumber(),
      };
    }
  }
  return { filePath: 'Unknown file', lineNumber: 'Unknown line' };
}

export function generateLogMessage({ timestamp, level, message, error }, messageHelper, projectDirectory) {
  const { filePath, lineNumber } = error ? extractFilePath(error) : { filePath: 'Unknown file', lineNumber: 'Unknown line' };
  const formattedFilePath = filePath.replace(projectDirectory, '');
  
  // Remove the timestamp from the message
  return `${level}: ${message} (File: ${formattedFilePath}, Line: ${lineNumber})`;
}

export function colorizeLevel(level) {
  switch (level) {
    case 'info': return chalk.green(level);
    case 'warn': return chalk.yellow(level);
    case 'error': return chalk.red(level);
    default: return level;
  }
}