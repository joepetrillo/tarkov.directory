// This file contains functions that map raw data from the GraphQL API into a type safe format.

import type {
  Gun,
  Mod,
  Slot,
  TraderOffer,
} from "@tarkov.directory/shared-types";
import { type FragmentOf, readFragment, type ResultOf } from "../graphql/tada";
import {
  BuyForFragment,
  type GetAllGuns,
  type GetAllMods,
  SlotFragment,
} from "../graphql/queries";

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

// Processes relevant mods for a gun
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
  relevantModIds.forEach((modId) => {
    if (allMods[modId]) {
      relevantMods[modId] = allMods[modId];
    }
  });

  return relevantMods;
}

// Processes slot data from the API into a more usable format
function processSlots(slots: FragmentOf<typeof SlotFragment>[]): Slot[] {
  return slots
    .map((currentSlot) => {
      const slot = readFragment(SlotFragment, currentSlot);

      if (
        !slot ||
        !slot.id ||
        slot.required === null ||
        !slot.name ||
        !slot.nameId ||
        !slot.filters
      ) {
        if (slot?.name && slot?.id) {
          console.warn(
            `Skipped slot with name "${slot.name}"\nID equals "${slot.id}"\n`,
          );
        } else if (slot?.id) {
          console.warn(`Skipped slot with id ${slot.id}`);
        } else {
          console.warn(`Skipped unknown slot`);
        }
        return null;
      }

      return {
        id: slot.id,
        required: slot.required,
        name: slot.name,
        nameId: slot.nameId,
        allowedModIds: slot.filters.allowedItems
          .map((item) => item?.id ?? null)
          .filter((id): id is string => id !== null),
      };
    })
    .filter((slot): slot is Slot => slot !== null);
}

// Extracts the Flea Market RUB price from list of offers
function processFleaMarketPrice(
  offers: FragmentOf<typeof BuyForFragment>[],
): number | undefined {
  return (
    offers.reduce((acc: number | null, offer) => {
      const buyFor = readFragment(BuyForFragment, offer);
      if (buyFor?.vendor.__typename === "FleaMarket") {
        return buyFor.priceRUB;
      }
      return acc;
    }, null) ?? undefined
  );
}

// Extracts array of TraderOffer objects from list of offers
function processTraderOffers(
  offers: FragmentOf<typeof BuyForFragment>[],
): TraderOffer[] | undefined {
  const validOffers = offers
    .map((offer): TraderOffer | null => {
      const buyFor = readFragment(BuyForFragment, offer);
      if (
        !buyFor ||
        buyFor.vendor.__typename !== "TraderOffer" ||
        buyFor.vendor.minTraderLevel === null ||
        buyFor.price === null ||
        buyFor.currency === null ||
        buyFor.priceRUB === null
      ) {
        return null;
      }

      return {
        name: buyFor.vendor.name,
        normalizedName: buyFor.vendor.normalizedName,
        minTraderLevel: buyFor.vendor.minTraderLevel,
        price: buyFor.price,
        currency: buyFor.currency,
        priceRUB: buyFor.priceRUB,
      };
    })
    .filter((offer): offer is TraderOffer => offer !== null)
    .sort((a, b) => a.priceRUB - b.priceRUB);

  return validOffers.length > 0 ? validOffers : undefined;
}

export function processAllGuns(gunData: ResultOf<typeof GetAllGuns>): {
  gunsByCategory: Record<string, string[]>;
  allGuns: Record<string, Gun>;
} {
  const gunsByCategory: Record<string, string[]> = {};

  // Process guns
  const allGuns: Record<string, Gun> = gunData.items.reduce(
    (acc, gun) => {
      if (
        !gun ||
        !gun.id ||
        !gun.name ||
        !gun.normalizedName ||
        !gun.shortName ||
        !gun.properties ||
        gun.properties.__typename !== "ItemPropertiesWeapon" ||
        gun.properties.recoilHorizontal === null ||
        gun.properties.recoilVertical === null ||
        gun.properties.ergonomics === null ||
        !gun.buyFor ||
        !gun.properties.slots
      ) {
        if (gun?.name && gun?.id) {
          console.warn(
            `Skipped gun with name "${gun.name}"\nID equals "${gun.id}"\n`,
          );
        } else if (gun?.id) {
          console.warn(`Skipped gun with id ${gun.id}`);
        } else {
          console.warn(`Skipped unknown gun`);
        }
        return acc; // Skip this gun
      }

      const processedGun: Gun = {
        id: gun.id,
        name: gun.name,
        normalizedName: gun.normalizedName,
        shortName: gun.shortName,
        category: {
          name: gun.handbookCategories[0]?.name ?? "Miscellaneous",
          normalizedName: gun.handbookCategories[0]?.normalizedName ?? "misc",
        },
        caliber: extractCaliber(gun.properties.caliber),
        recoilHorizontal: gun.properties.recoilHorizontal,
        recoilVertical: gun.properties.recoilVertical,
        ergonomics: gun.properties.ergonomics,
        defaultPresetImageUrl:
          gun.properties.defaultPreset?.baseImageLink ?? null,
        avgFleaMarketRUBPrice: processFleaMarketPrice(gun.buyFor),
        traderOffers: processTraderOffers(gun.buyFor),
        slots: processSlots(
          gun.properties.slots.filter(
            (slot): slot is FragmentOf<typeof SlotFragment> => slot !== null,
          ),
        ),
      };

      acc[processedGun.id] = processedGun;

      const existingCategory =
        gunsByCategory[processedGun.category.normalizedName];

      if (!existingCategory) {
        gunsByCategory[processedGun.category.normalizedName] = [gun.id];
      } else {
        existingCategory.push(gun.id);
      }

      return acc;
    },
    {} as Record<string, Gun>,
  );

  return { gunsByCategory, allGuns };
}

export function processAllMods(modData: ResultOf<typeof GetAllMods>): {
  allMods: Record<string, Mod>;
} {
  // Process mods
  const allMods: Record<string, Mod> = modData.items.reduce(
    (acc, mod) => {
      if (
        !mod ||
        !mod.id ||
        !mod.name ||
        !mod.normalizedName ||
        !mod.shortName ||
        mod.recoilModifier === null ||
        mod.ergonomicsModifier === null ||
        !mod.conflictingSlotIds ||
        !mod.conflictingItems ||
        !mod.properties ||
        (mod.properties.__typename !== "ItemPropertiesWeaponMod" &&
          mod.properties.__typename !== "ItemPropertiesBarrel" &&
          mod.properties.__typename !== "ItemPropertiesMagazine" &&
          mod.properties.__typename !== "ItemPropertiesScope") ||
        !mod.buyFor ||
        !mod.properties.slots
      ) {
        if (mod?.name && mod?.id) {
          console.warn(
            `Skipped mod with name "${mod.name}"\nID equals "${mod.id}"\n`,
          );
        } else if (mod?.id) {
          console.warn(`Skipped mod with id ${mod.id}`);
        } else {
          console.warn(`Skipped unknown mod`);
        }
        return acc; // Skip this mod
      }

      const processedMod: Mod = {
        id: mod.id,
        name: mod.name,
        normalizedName: mod.normalizedName,
        shortName: mod.shortName,
        iconImageUrl: mod.iconLink ?? null,
        recoilModifier: mod.recoilModifier,
        ergonomicsModifier: mod.ergonomicsModifier,
        conflictingSlotIds: mod.conflictingSlotIds.filter(
          (id): id is string => id !== null,
        ),
        conflictingModIds: mod.conflictingItems
          .map((item) => item?.id ?? null)
          .filter((id): id is string => id !== null),
        avgFleaMarketRUBPrice: processFleaMarketPrice(mod.buyFor),
        traderOffers: processTraderOffers(mod.buyFor),
        slots: processSlots(
          mod.properties.slots.filter(
            (slot): slot is FragmentOf<typeof SlotFragment> => slot !== null,
          ),
        ),
      };

      acc[processedMod.id] = processedMod;

      return acc;
    },
    {} as Record<string, Mod>,
  );

  return { allMods };
}
