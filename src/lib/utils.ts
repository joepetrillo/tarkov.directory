// This file contains utility functions that are used throughout the application

// Function to easily check if the device is a mobile device
export function isMobileDevice() {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|Tablet|Kindle|Windows Phone|Silk|UCBrowser|Nokia|SymbianOS|SonyEricsson|LG|SAMSUNG|Samsung|Meizu|Huawei|Xiaomi|OPPO/i;
  return (
    mobileRegex.test(navigator.userAgent) ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

// Function to convert a string to title case
export function toTitleCase(str: string) {
  return str.replace(/(?:^|\s)\w/g, function (match) {
    return match.toUpperCase();
  });
}

// Function that will sleep for the specified number of milliseconds
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to normalize a string by removing spaces and hyphens and converting to lowercase
export function normalizeShortNameSearch(input: string) {
  return input.replace(/-/g, "").replace(/\s+/g, "").toLowerCase();
}

// Function to convert API caliber response to something more human readable
export function extractCaliber(input: string | null) {
  const caliberMapping: Record<string, string> = {
    Caliber556x45NATO: "5.56x45",
    Caliber9x18PM: "9x18",
    Caliber12g: "12g",
    Caliber762x54R: "7.62x54R",
    Caliber545x39: "5.45x39",
    Caliber9x19PARA: "9x19",
    Caliber762x25TT: "7.62x25",
    Caliber762x39: "7.62x39",
    Caliber762x51: "7.62x51",
    Caliber9x39: "9x39",
    Caliber366TKM: ".366 TKM",
    Caliber9x21: "9x21",
    Caliber1143x23ACP: ".45 ACP",
    Caliber40x46: "40x46",
    Caliber23x75: "23x75",
    Caliber46x30: "4.6x30",
    Caliber127x55: "12.7x55",
    Caliber57x28: "5.7x28",
    Caliber762x35: ".300 Blackout",
    Caliber86x70: ".338 Lapua",
    Caliber9x33R: ".357 Magnum",
    Caliber26x75: "26x75",
    Caliber68x51: "6.8x51",
    Caliber20x1mm: "Toy Disk",
  };

  if (!input) {
    return "Unknown";
  }

  return caliberMapping[input] ?? input.replace("Caliber", "") ?? "Unknown";
}
