import { describe, expect, test } from "bun:test";
import type { CategorizedGunListData } from "@/types";
import {
  filterCategorizedGunList,
  getGunCaliberOptions,
  getGunListCount,
} from "./gun-list-filters";

const m4 = gun("m4", "M4A1", "5.56x45");
const ak74 = gun("ak-74", "AK-74", "5.45x39");
const akm = gun("akm", "AKM", "7.62x39");
const m45 = gun("m45", "M45A1", ".45 ACP");
const glock = gun("glock", "Glock 17", "9x19");

const categorizedGunList = [
  {
    categoryName: "assault rifles",
    guns: [m4, ak74, akm],
  },
  {
    categoryName: "pistols",
    guns: [m45, glock],
  },
] satisfies CategorizedGunListData;

function gun(id: string, shortName: string, caliber: string) {
  return {
    id,
    name: shortName,
    shortName,
    defaultPresetImageUrl: null,
    caliber,
  };
}

describe("gun list filters", () => {
  test("returns the total gun count across categories", () => {
    expect(getGunListCount(categorizedGunList)).toBe(5);
  });

  test("returns unique caliber options with counts in sorted display order", () => {
    const gunListWithDuplicateCalibers = [
      {
        categoryName: "assault rifles",
        guns: [m4, gun("hk416", "HK 416A5", "5.56x45"), ak74, akm],
      },
      {
        categoryName: "pistols",
        guns: [m45, glock],
      },
    ] satisfies CategorizedGunListData;

    expect(getGunCaliberOptions(gunListWithDuplicateCalibers)).toEqual([
      { caliber: ".45 ACP", count: 1 },
      { caliber: "5.45x39", count: 1 },
      { caliber: "5.56x45", count: 2 },
      { caliber: "7.62x39", count: 1 },
      { caliber: "9x19", count: 1 },
    ]);
  });

  test("filters by normalized search text", () => {
    expect(
      filterCategorizedGunList(categorizedGunList, {
        search: "ak74",
        caliber: "",
      }),
    ).toEqual([
      {
        categoryName: "assault rifles",
        guns: [ak74],
      },
    ]);
  });

  test("filters by caliber only", () => {
    expect(
      filterCategorizedGunList(categorizedGunList, {
        search: "",
        caliber: "5.56x45",
      }),
    ).toEqual([
      {
        categoryName: "assault rifles",
        guns: [m4],
      },
    ]);
  });

  test("combines search and caliber filters", () => {
    expect(
      filterCategorizedGunList(categorizedGunList, {
        search: "m4",
        caliber: ".45 ACP",
      }),
    ).toEqual([
      {
        categoryName: "pistols",
        guns: [m45],
      },
    ]);
  });

  test("returns no categories when filters do not match", () => {
    expect(
      filterCategorizedGunList(categorizedGunList, {
        search: "m4",
        caliber: "9x19",
      }),
    ).toEqual([]);
  });
});
