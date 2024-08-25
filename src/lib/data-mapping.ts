// This file contains functions that map raw data from the GraphQL API into a type safe format.

import { extractCaliber } from "@/lib/utils";
import { Gun, Mod, Slot, TraderOffer } from "@/types";
import { FragmentOf, readFragment, ResultOf } from "gql.tada";
import {
  BuyForFragment,
  type GetAllGuns,
  type GetAllMods,
  SlotFragment,
} from "@/graphql/queries";

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
    .sort((a, b) => a.price - b.price);

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
