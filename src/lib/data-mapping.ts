// This file contains functions that map raw data from the GraphQL API into a type safe format.

import { GetAllGunsQuery } from "@/gql/graphql";
import { BasicGunInfo } from "@/types";

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
