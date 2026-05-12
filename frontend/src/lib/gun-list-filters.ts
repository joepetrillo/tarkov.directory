import type { CategorizedGunListData } from "@/types";

export type GunListFilters = {
  search: string;
  caliber: string;
};

function normalizeGunSearch(input: string) {
  return input.replace(/-/g, "").replace(/\s+/g, "").toLowerCase();
}

export function getGunListCount(categorizedGunList: CategorizedGunListData) {
  return categorizedGunList.reduce(
    (count, category) => count + category.guns.length,
    0,
  );
}

export function getGunCaliberOptions(
  categorizedGunList: CategorizedGunListData,
) {
  const caliberCounts = new Map<string, number>();

  for (const category of categorizedGunList) {
    for (const gun of category.guns) {
      caliberCounts.set(gun.caliber, (caliberCounts.get(gun.caliber) ?? 0) + 1);
    }
  }

  return Array.from(caliberCounts, ([caliber, count]) => ({
    caliber,
    count,
  })).sort((a, b) =>
    a.caliber.localeCompare(b.caliber, undefined, { numeric: true }),
  );
}

export function filterCategorizedGunList(
  categorizedGunList: CategorizedGunListData,
  filters: GunListFilters,
) {
  const normalizedSearchInput = normalizeGunSearch(filters.search);

  return categorizedGunList.reduce<CategorizedGunListData>(
    (filteredCategories, category) => {
      const guns = category.guns.filter((gun) => {
        const matchesSearch = normalizeGunSearch(gun.shortName).includes(
          normalizedSearchInput,
        );
        const matchesCaliber =
          filters.caliber === "" || gun.caliber === filters.caliber;

        return matchesSearch && matchesCaliber;
      });

      if (guns.length > 0) {
        filteredCategories.push({
          categoryName: category.categoryName,
          guns,
        });
      }

      return filteredCategories;
    },
    [],
  );
}
