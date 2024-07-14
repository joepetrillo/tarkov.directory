// This file contains functions that map raw data from the GraphQL API into a type safe format.

import { GetAllGunsQuery, GetGunInfoQuery } from "@/gql/graphql";
import { BasicGunInfo, FullGunInfo } from "@/types";

export function mapAllGunsToCategories(
  data: GetAllGunsQuery,
): Array<{ categoryName: string; items: BasicGunInfo[] }> {
  // group guns by their normalized category name
  const categorizedData = data.items.reduce(
    (acc, gun) => {
      if (
        !gun ||
        !gun.name ||
        !gun.normalizedName ||
        !gun.shortName ||
        !gun.properties ||
        gun.properties.__typename !== "ItemPropertiesWeapon"
      ) {
        return acc;
      }

      const currentGun: BasicGunInfo = {
        id: gun.id,
        name: gun.name,
        normalizedName: gun.normalizedName,
        shortName: gun.shortName,
        defaultPresetImageUrl:
          gun.properties.defaultPreset?.baseImageLink ?? null,
        category: {
          // get first element in handbook categories array for most specific category
          name: gun.handbookCategories[0]?.name ?? "Miscellaneous",
          normalizedName: gun.handbookCategories[0]?.normalizedName ?? "misc",
        },
      };

      if (!acc[currentGun.category.normalizedName]) {
        acc[currentGun.category.normalizedName] = [currentGun];
      } else {
        acc[currentGun.category.normalizedName].push(currentGun);
      }

      return acc;
    },
    {} as Record<string, BasicGunInfo[]>,
  );

  // Convert the categorizedData object into the desired array shape
  return Object.entries(categorizedData).map(([_, items]) => ({
    categoryName: items[0].category.name ?? "Miscellaneous",
    items,
  }));
}

export function mapToFullGunInfo(data: GetGunInfoQuery): FullGunInfo {
  if (data.items.length < 1) {
    throw new Error("No gun found matching the provided ID.");
  }

  if (data.items.length > 1) {
    throw new Error("Query by ID should return no more than one gun.");
  }

  // we know at this point the array has exactly one element if no errors were thrown
  const gun = data.items[0];

  if (
    gun &&
    gun.name &&
    gun.normalizedName &&
    gun.shortName &&
    gun.properties &&
    gun.properties.__typename === "ItemPropertiesWeapon" &&
    gun.properties.recoilHorizontal != null &&
    gun.properties.recoilVertical != null &&
    gun.properties.ergonomics != null &&
    gun.properties.slots
  ) {
    return {
      id: gun.id,
      name: gun.name,
      normalizedName: gun.normalizedName,
      shortName: gun.shortName,
      defaultPresetImageUrl:
        gun.properties.defaultPreset?.baseImageLink ?? null,
      category: {
        name: gun.handbookCategories[0]?.name ?? "Miscellaneous",
        normalizedName: gun.handbookCategories[0]?.normalizedName ?? "misc",
      },
      recoilHorizontal: gun.properties.recoilHorizontal,
      recoilVertical: gun.properties.recoilVertical,
      ergonomics: gun.properties.ergonomics,
      slots: gun.properties.slots.map((slot) => {
        if (
          slot &&
          slot.id &&
          slot.required != null &&
          slot.name &&
          slot.nameId &&
          slot.filters &&
          slot.filters.allowedItems
        ) {
          return {
            id: slot.id,
            required: slot.required,
            name: slot.name,
            nameId: slot.nameId,
            allowedItems: slot.filters.allowedItems.map((allowedItem) => {
              if (
                allowedItem &&
                allowedItem.id &&
                allowedItem.name &&
                allowedItem.shortName &&
                allowedItem.iconLink &&
                allowedItem.recoilModifier != null &&
                allowedItem.ergonomicsModifier != null &&
                allowedItem.conflictingSlotIds &&
                allowedItem.conflictingItems
              ) {
                return {
                  id: allowedItem.id,
                  name: allowedItem.name,
                  shortName: allowedItem.shortName,
                  iconLink: allowedItem.iconLink,
                  recoilModifier: allowedItem.recoilModifier,
                  ergonomicsModifier: allowedItem.ergonomicsModifier,
                  conflictingSlotIds: allowedItem.conflictingSlotIds.map(
                    (id) => {
                      if (id) {
                        return id;
                      }
                      throw new Error(
                        "conflictingSlotIds - Incomplete slot data received from the API.",
                      );
                    },
                  ),
                  conflictingItems: allowedItem.conflictingItems.map(
                    (conflictingItem) => {
                      if (conflictingItem && conflictingItem.id) {
                        return {
                          id: conflictingItem.id,
                        };
                      }
                      throw new Error(
                        "conflictingItems - Incomplete slot data received from the API.",
                      );
                    },
                  ),
                };
              }
              throw new Error(
                "allowedItems - Incomplete slot data received from the API.",
              );
            }),
          };
        }
        throw new Error("slots - Incomplete slot data received from the API.");
      }),
    };
  } else {
    throw new Error("Incomplete gun data received from the API.");
  }
}
