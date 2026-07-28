import type { z } from "zod";
import {
  TARKOV_GAME_MODE,
  TARKOV_JSON_BASE_URL,
  TARKOV_LANG,
} from "./constants";
import {
  handbookCategorySchema,
  itemSchema,
  itemsResponseSchema,
  traderSchema,
  tradersResponseSchema,
  translationsResponseSchema,
  type TarkovHandbookCategory,
  type TarkovItem,
  type TarkovTrader,
} from "./schemas";

export class TarkovJsonError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "TarkovJsonError";
  }
}

async function fetchJson(path: string): Promise<unknown> {
  const url = `${TARKOV_JSON_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new TarkovJsonError(`Failed to fetch ${url}`, undefined, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new TarkovJsonError(
      `Tarkov JSON API returned ${response.status} for ${url}`,
      response.status,
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new TarkovJsonError(
      `Failed to parse JSON from ${url}`,
      response.status,
      { cause: error },
    );
  }
}

/** Hard-fail if the HTTP JSON wrapper is wrong (e.g. missing `{ data: ... }`). */
function parseEnvelope<T>(
  raw: unknown,
  schema: z.ZodType<T>,
  label: string,
): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new TarkovJsonError(
      `Invalid ${label} response shape: ${result.error.message}`,
    );
  }
  return result.data;
}

/**
 * Soft-parse each id→object entry. Skip bad rows (dump is huge/imperfect);
 * only throw if nothing usable remains.
 */
function parseRecord<T>(
  raw: Record<string, unknown>,
  schema: z.ZodType<T>,
  label: string,
): Record<string, T> {
  const parsed: Record<string, T> = {};
  let skipped = 0;

  for (const [id, value] of Object.entries(raw)) {
    const result = schema.safeParse(value);
    if (!result.success) {
      skipped += 1;
      continue;
    }
    parsed[id] = result.data;
  }

  if (Object.keys(parsed).length === 0) {
    throw new TarkovJsonError(
      `No valid ${label} entries parsed from API response`,
    );
  }

  if (skipped > 0) {
    console.warn(
      `Skipped ${skipped} invalid ${label} entries from Tarkov JSON API`,
    );
  }

  return parsed;
}

export type TarkovDataset = {
  items: Record<string, TarkovItem>;
  handbookCategories: Record<string, TarkovHandbookCategory>;
  /** English string table: placeholder keys like `"<id> Name"` → display text. */
  translations: Record<string, string>;
  traders: Record<string, TarkovTrader>;
  traderTranslations: Record<string, string>;
};

/**
 * Download + validate the Tarkov JSON dumps we need.
 * Items are locale-agnostic; `*_en` files supply English strings (not a path segment).
 * See https://json.tarkov.dev/endpoints
 */
export async function fetchTarkovDataset(): Promise<TarkovDataset> {
  const base = `/${TARKOV_GAME_MODE}`;

  // Parallel: wait for the slowest file (~items), not the sum of all four.
  const [itemsRaw, translationsRaw, tradersRaw, traderTranslationsRaw] =
    await Promise.all([
      fetchJson(`${base}/items`),
      fetchJson(`${base}/items_${TARKOV_LANG}`),
      fetchJson(`${base}/traders`),
      fetchJson(`${base}/traders_${TARKOV_LANG}`),
    ]);

  const itemsEnvelope = parseEnvelope(itemsRaw, itemsResponseSchema, "items");
  const translationsEnvelope = parseEnvelope(
    translationsRaw,
    translationsResponseSchema,
    `items_${TARKOV_LANG}`,
  );
  const tradersEnvelope = parseEnvelope(
    tradersRaw,
    tradersResponseSchema,
    "traders",
  );
  const traderTranslationsEnvelope = parseEnvelope(
    traderTranslationsRaw,
    translationsResponseSchema,
    `traders_${TARKOV_LANG}`,
  );

  return {
    items: parseRecord(itemsEnvelope.data.items, itemSchema, "items"),
    handbookCategories: parseRecord(
      itemsEnvelope.data.handbookCategories,
      handbookCategorySchema,
      "handbookCategories",
    ),
    translations: translationsEnvelope.data,
    traders: parseRecord(tradersEnvelope.data, traderSchema, "traders"),
    traderTranslations: traderTranslationsEnvelope.data,
  };
}
