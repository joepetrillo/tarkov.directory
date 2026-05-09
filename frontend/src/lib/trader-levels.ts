export type TraderLevel = 1 | 2 | 3 | 4;

export type TraderLevels = Record<string, TraderLevel>;

const TRADER_LEVEL_STORAGE_KEY = "tarkov-directory.trader-levels.v1";

const DEFAULT_TRADER_LEVEL: TraderLevel = 1;

export const TRADER_LEVEL_OPTIONS = [1, 2, 3, 4] as const;

export const KNOWN_TRADERS = [
  { name: "Prapor", normalizedName: "prapor" },
  { name: "Therapist", normalizedName: "therapist" },
  { name: "Skier", normalizedName: "skier" },
  { name: "Peacekeeper", normalizedName: "peacekeeper" },
  { name: "Mechanic", normalizedName: "mechanic" },
  { name: "Ragman", normalizedName: "ragman" },
  { name: "Jaeger", normalizedName: "jaeger" },
  { name: "Fence", normalizedName: "fence" },
  { name: "Ref", normalizedName: "ref" },
] as const;

export const DEFAULT_TRADER_LEVELS: TraderLevels = Object.fromEntries(
  KNOWN_TRADERS.map((trader) => [trader.normalizedName, DEFAULT_TRADER_LEVEL]),
) as TraderLevels;

function isTraderLevel(value: unknown): value is TraderLevel {
  return (
    typeof value === "number" &&
    TRADER_LEVEL_OPTIONS.includes(value as TraderLevel)
  );
}

export function getTraderLevel(
  traderLevels: TraderLevels,
  normalizedName: string,
): TraderLevel {
  return traderLevels[normalizedName] ?? DEFAULT_TRADER_LEVEL;
}

function normalizeTraderLevels(value: unknown): TraderLevels {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_TRADER_LEVELS;
  }

  return {
    ...DEFAULT_TRADER_LEVELS,
    ...Object.fromEntries(
      Object.entries(value).filter(([, level]) => isTraderLevel(level)),
    ),
  };
}

export function readStoredTraderLevels(storage: Storage): TraderLevels {
  const rawValue = storage.getItem(TRADER_LEVEL_STORAGE_KEY);

  if (!rawValue) {
    return DEFAULT_TRADER_LEVELS;
  }

  try {
    return normalizeTraderLevels(JSON.parse(rawValue));
  } catch {
    return DEFAULT_TRADER_LEVELS;
  }
}

export function writeStoredTraderLevels(
  storage: Storage,
  traderLevels: TraderLevels,
) {
  storage.setItem(
    TRADER_LEVEL_STORAGE_KEY,
    JSON.stringify(normalizeTraderLevels(traderLevels)),
  );
}
