// This file contains functions that map raw data from the GraphQL API into a type safe format.

import { GetAllGunsAndModsQuery } from "@/gql/graphql";
import { extractCaliber } from "@/lib/utils";
import { Gun, ItemId, Mod, ProcessedData, Slot } from "@/types";

function processSlot(
  slot: {
    __typename: "ItemSlot";
    id: string;
    required: boolean | null;
    name: string;
    nameId: string;
    filters: {
      __typename: "ItemFilters";
      allowedItems: Array<{
        __typename: "Item";
        id: string;
      } | null>;
    } | null;
  } | null,
): Slot | null {
  if (
    !slot ||
    !slot.id ||
    slot.required === null ||
    !slot.name ||
    !slot.nameId ||
    !slot.filters
  ) {
    if (slot?.id) {
      console.warn(`Skipped slot with id ${slot.id}`);
    } else if (slot?.name) {
      console.warn(`Skipped slot with name ${slot.name}`);
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
}

export function processAllGunsAndMods(
  data: GetAllGunsAndModsQuery,
): ProcessedData {
  const gunsByCategory: Record<string, ItemId[]> = {};

  // Process guns
  const allGuns: Record<ItemId, Gun> = data.gunData.reduce(
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
        !gun.properties.slots
      ) {
        if (gun?.id) {
          console.warn(`Skipped gun with id ${gun.id}`);
        } else if (gun?.name) {
          console.warn(`Skipped gun with name ${gun.name}`);
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
        slots: gun.properties.slots
          .map(processSlot)
          .filter((slot): slot is Slot => slot !== null),
      };

      acc[processedGun.id] = processedGun;

      if (!gunsByCategory[processedGun.category.normalizedName]) {
        gunsByCategory[processedGun.category.normalizedName] = [];
      }
      gunsByCategory[processedGun.category.normalizedName].push(gun.id);

      return acc;
    },
    {} as Record<ItemId, Gun>,
  );

  // Process mods
  const allMods: Record<ItemId, Mod> = data.modData.reduce(
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
        !mod.properties.slots
      ) {
        if (mod?.id) {
          console.warn(`Skipped mod with id ${mod.id}`);
        } else if (mod?.name) {
          console.warn(`Skipped mod with name ${mod.name}`);
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
        slots: mod.properties.slots
          .map(processSlot)
          .filter((slot): slot is Slot => slot !== null),
      };

      acc[processedMod.id] = processedMod;

      return acc;
    },
    {} as Record<ItemId, Mod>,
  );

  return { gunsByCategory, allGuns, allMods };
}
