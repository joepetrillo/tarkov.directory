// This file contains utility functions that are used throughout the application

// Function to convert a string to title case
export function toTitleCase(str: string) {
  return str.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
    return match.toUpperCase();
  });
}

// Function that will sleep for the specified number of milliseconds
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
