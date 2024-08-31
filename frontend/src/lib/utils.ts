// This file contains utility functions that are used throughout the application
import prapor from "@/components/modding/images/prapor.webp";
import therapist from "@/components/modding/images/therapist.webp";
import skier from "@/components/modding/images/skier.webp";
import peacekeeper from "@/components/modding/images/peacekeeper.webp";
import mechanic from "@/components/modding/images/mechanic.webp";
import ragman from "@/components/modding/images/ragman.webp";
import jaeger from "@/components/modding/images/jaeger.webp";
import fence from "@/components/modding/images/fence.webp";
import lightkeeper from "@/components/modding/images/lightkeeper.webp";
import unknown from "@/components/modding/images/unknown-trader.webp";
import { StaticImageData } from "next/image";

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

// Function to get the trader image for a given normalized name
export function getTraderImage(normalizedName: string) {
  const traderImages: Record<string, StaticImageData> = {
    prapor,
    therapist,
    skier,
    peacekeeper,
    mechanic,
    ragman,
    jaeger,
    fence,
    lightkeeper,
  };

  return traderImages[normalizedName] || unknown;
}

// Function to format a difference between two numbers
export function formatDiff(calculated: number, base: number) {
  const diff = calculated - base;
  if (diff === 0) return null;
  return diff > 0 ? `+${diff}` : `${diff}`;
}

// Function to round gun stats like BSG does
export function customRound(number: number) {
  const fractionalPart = number % 1;
  if (fractionalPart <= 0.5) {
    return Math.floor(number);
  } else {
    return Math.ceil(number);
  }
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
