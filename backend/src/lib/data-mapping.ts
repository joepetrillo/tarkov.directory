/**
 * Maps validated Tarkov JSON dumps → shared Gun/Mod types for the API/frontend.
 * Joins placeholders via *_en tables; does not fetch HTTP (see tarkov-json/).
 */
import type {
  Gun,
  Mod,
  Slot,
  TraderOffer,
} from "@tarkov.directory/shared-types";
import {
  CALIBER_MAPPING,
  MOD_PROPERTY_TYPES,
  WEAPON_HANDBOOK_CATEGORIES,
} from "./domain";
import type {
  TarkovDataset,
  TarkovItem,
  TarkovSlot,
} from "./tarkov-json";

export function extractCaliber(input: string | null | undefined) {
  if (!input) {
    return "Unknown";
  }

  return CALIBER_MAPPING[input] ?? input.replace("Caliber", "") ?? "Unknown";
}

/** Walk slot → allowed mods recursively so gun detail doesn't ship the full mod catalog. */
export function processRelevantMods(
  gun: Gun,
  allMods: Record<string, Mod>,
): Record<string, Mod> {
  const relevantModIds = new Set<string>();

  function collectRelevantModIds(slots: Gun["slots"] | Mod["slots"]) {
    for (const slot of slots) {
      for (const modId of slot.allowedModIds) {
        if (relevantModIds.has(modId)) continue;
        relevantModIds.add(modId);
        const mod = allMods[modId];
        if (mod && mod.slots.length > 0) {
          collectRelevantModIds(mod.slots);
        }
      }
    }
  }

  collectRelevantModIds(gun.slots);

  const relevantMods: Record<string, Mod> = {};
  for (const modId of relevantModIds) {
    const mod = allMods[modId];
    if (mod) {
      relevantMods[modId] = mod;
    }
  }

  return relevantMods;
}

/** `key` is often a placeholder from the dump (`"<id> Name"`, `MOD_STOCK`); lookup in *_en. */
function translate(
  translations: Record<string, string>,
  key: string,
  fallback: string,
): string {
  return translations[key] ?? fallback;
}

function warnSkipped(
  kind: string,
  item?: Pick<TarkovItem, "id" | "normalizedName">,
) {
  if (item?.normalizedName && item.id) {
    console.warn(`Skipped ${kind} "${item.normalizedName}" (${item.id})`);
  } else if (item?.id) {
    console.warn(`Skipped ${kind} with id ${item.id}`);
  } else {
    console.warn(`Skipped unknown ${kind}`);
  }
}

function processSlots(
  slots: TarkovSlot[],
  translations: Record<string, string>,
): Slot[] {
  return slots.map((slot) => ({
    id: slot.id,
    required: slot.required,
    name: translate(translations, slot.name, slot.nameId),
    nameId: slot.nameId,
    allowedModIds: slot.filters.allowedItems,
  }));
}

function processTraderOffers(
  item: TarkovItem,
  traders: TarkovDataset["traders"],
  traderTranslations: Record<string, string>,
): TraderOffer[] | undefined {
  const validOffers: TraderOffer[] = [];

  for (const offer of item.buyFromTrader ?? []) {
    const trader = traders[offer.trader];
    if (!trader) continue;

    validOffers.push({
      name: translate(traderTranslations, trader.name, trader.normalizedName),
      normalizedName: trader.normalizedName,
      minTraderLevel: offer.minTraderLevel,
      price: offer.price,
      currency: offer.currency,
      priceRUB: offer.priceRUB,
    });
  }

  validOffers.sort((a, b) => a.priceRUB - b.priceRUB);
  return validOffers.length > 0 ? validOffers : undefined;
}

/** Flea price lives on the item now (not a buyFor FleaMarket vendor like GraphQL). */
function fleaPrice(item: TarkovItem): number | undefined {
  return item.avg24hPrice ?? item.lastLowPrice ?? undefined;
}

/** Prefer a leaf weapon handbook cat over parent "weapons" (items list both ids). */
function resolveWeaponCategory(
  item: TarkovItem,
  handbookCategories: TarkovDataset["handbookCategories"],
  translations: Record<string, string>,
): Gun["category"] | null {
  for (const categoryId of item.handbookCategories) {
    const category = handbookCategories[categoryId];
    if (!category) continue;
    if (!WEAPON_HANDBOOK_CATEGORIES.has(category.normalizedName)) continue;

    return {
      name: translate(translations, category.name, category.normalizedName),
      normalizedName: category.normalizedName,
    };
  }

  return null;
}

/** defaultPreset is an item id; the pretty gun image lives on that preset's baseImageLink. */
function defaultPresetImageUrl(
  item: TarkovItem,
  items: Record<string, TarkovItem>,
): string | null {
  const presetId = item.properties?.defaultPreset;
  if (!presetId) {
    return item.baseImageLink ?? null;
  }

  return items[presetId]?.baseImageLink ?? item.baseImageLink ?? null;
}

type SharedItemFields = {
  id: string;
  name: string;
  normalizedName: string;
  shortName: string;
  avgFleaMarketRUBPrice?: number;
  traderOffers?: TraderOffer[];
  slots: Slot[];
};

function mapSharedItemFields(
  item: TarkovItem,
  dataset: TarkovDataset,
  slots: TarkovSlot[],
): SharedItemFields {
  const { translations, traders, traderTranslations } = dataset;

  return {
    id: item.id,
    name: translate(translations, item.name, item.normalizedName),
    normalizedName: item.normalizedName,
    shortName: translate(translations, item.shortName, item.normalizedName),
    avgFleaMarketRUBPrice: fleaPrice(item),
    traderOffers: processTraderOffers(item, traders, traderTranslations),
    slots: processSlots(slots, translations),
  };
}

export function processAllGuns(dataset: TarkovDataset): {
  gunsByCategory: Record<string, string[]>;
  allGuns: Record<string, Gun>;
} {
  const gunsByCategory: Record<string, string[]> = {};
  const allGuns: Record<string, Gun> = {};

  for (const item of Object.values(dataset.items)) {
    if (!item.types.includes("gun")) continue;

    const properties = item.properties;
    if (
      !properties ||
      properties.propertiesType !== "ItemPropertiesWeapon" ||
      properties.recoilHorizontal == null ||
      properties.recoilVertical == null ||
      properties.ergonomics == null ||
      !properties.slots
    ) {
      warnSkipped("gun", item);
      continue;
    }

    const category = resolveWeaponCategory(
      item,
      dataset.handbookCategories,
      dataset.translations,
    );
    if (!category) {
      warnSkipped("gun", item);
      continue;
    }

    const shared = mapSharedItemFields(item, dataset, properties.slots);
    const gun: Gun = {
      ...shared,
      category,
      caliber: extractCaliber(properties.caliber),
      recoilHorizontal: properties.recoilHorizontal,
      recoilVertical: properties.recoilVertical,
      ergonomics: properties.ergonomics,
      defaultPresetImageUrl: defaultPresetImageUrl(item, dataset.items),
    };

    allGuns[gun.id] = gun;

    const existing = gunsByCategory[gun.category.normalizedName];
    if (!existing) {
      gunsByCategory[gun.category.normalizedName] = [gun.id];
    } else {
      existing.push(gun.id);
    }
  }

  return { gunsByCategory, allGuns };
}

export function processAllMods(dataset: TarkovDataset): Record<string, Mod> {
  const allMods: Record<string, Mod> = {};

  for (const item of Object.values(dataset.items)) {
    if (!item.types.includes("mods")) continue;

    const properties = item.properties;
    if (
      !properties ||
      !properties.propertiesType ||
      !MOD_PROPERTY_TYPES.has(properties.propertiesType) ||
      item.recoilModifier == null ||
      item.ergonomicsModifier == null ||
      !properties.slots
    ) {
      warnSkipped("mod", item);
      continue;
    }

    const shared = mapSharedItemFields(item, dataset, properties.slots);
    allMods[item.id] = {
      ...shared,
      iconImageUrl: item.iconLink ?? null,
      recoilModifier: item.recoilModifier,
      ergonomicsModifier: item.ergonomicsModifier,
      conflictingSlotIds: item.conflictingSlotIds ?? [],
      conflictingModIds: item.conflictingItems ?? [],
    };
  }

  return allMods;
}
