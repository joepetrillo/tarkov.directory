export function toTitleCase(str: string) {
  return str.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
    return match.toUpperCase();
  });
}

// Sleep function that will sleep for the specified number of milliseconds
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
