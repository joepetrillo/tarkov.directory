import { describe, expect, test } from "bun:test";
import {
  extractCaliber,
  processAllGuns,
  processAllMods,
  processRelevantMods,
} from "./data-mapping";
import type { TarkovDataset } from "./tarkov-json";

function makeDataset(): TarkovDataset {
  return {
    translations: {
      "gun-1 Name": "Test Rifle",
      "gun-1 ShortName": "TR",
      "mod-1 Name": "Test Grip",
      "mod-1 ShortName": "TG",
      "mod-2 Name": "Test Mag",
      "mod-2 ShortName": "TM",
      "cat-ar": "Assault rifles",
      MOD_PISTOL_GRIP: "Pistol Grip",
      MOD_MAGAZINE: "Magazine",
      "trader-1 Nickname": "Mechanic",
    },
    traderTranslations: {
      "trader-1 Nickname": "Mechanic",
    },
    traders: {
      "trader-1": {
        id: "trader-1",
        name: "trader-1 Nickname",
        normalizedName: "mechanic",
      },
    },
    handbookCategories: {
      "cat-ar": {
        id: "cat-ar",
        name: "cat-ar",
        normalizedName: "assault-rifles",
        parent: "weapons",
      },
      weapons: {
        id: "weapons",
        name: "weapons",
        normalizedName: "weapons",
        parent: null,
      },
    },
    items: {
      "gun-1": {
        id: "gun-1",
        name: "gun-1 Name",
        shortName: "gun-1 ShortName",
        normalizedName: "test-rifle",
        types: ["gun"],
        handbookCategories: ["cat-ar", "weapons"],
        avg24hPrice: 50000,
        buyFromTrader: [
          {
            trader: "trader-1",
            price: 10000,
            priceRUB: 10000,
            currency: "RUB",
            minTraderLevel: 2,
          },
        ],
        properties: {
          propertiesType: "ItemPropertiesWeapon",
          caliber: "Caliber556x45NATO",
          recoilHorizontal: 100,
          recoilVertical: 50,
          ergonomics: 40,
          defaultPreset: "preset-1",
          slots: [
            {
              id: "slot-grip",
              nameId: "mod_pistol_grip",
              name: "MOD_PISTOL_GRIP",
              required: true,
              filters: { allowedItems: ["mod-1"] },
            },
          ],
        },
      },
      "preset-1": {
        id: "preset-1",
        name: "preset-1 Name",
        shortName: "preset-1 ShortName",
        normalizedName: "test-rifle-preset",
        types: ["preset"],
        handbookCategories: [],
        baseImageLink: "https://assets.tarkov.dev/preset-1-base-image.webp",
      },
      "mod-1": {
        id: "mod-1",
        name: "mod-1 Name",
        shortName: "mod-1 ShortName",
        normalizedName: "test-grip",
        types: ["mods"],
        handbookCategories: [],
        iconLink: "https://assets.tarkov.dev/mod-1-icon.webp",
        recoilModifier: 0,
        ergonomicsModifier: 5,
        conflictingSlotIds: [],
        conflictingItems: [],
        buyFromTrader: [],
        properties: {
          propertiesType: "ItemPropertiesWeaponMod",
          slots: [
            {
              id: "slot-mag",
              nameId: "mod_magazine",
              name: "MOD_MAGAZINE",
              required: false,
              filters: { allowedItems: ["mod-2"] },
            },
          ],
        },
      },
      "mod-2": {
        id: "mod-2",
        name: "mod-2 Name",
        shortName: "mod-2 ShortName",
        normalizedName: "test-mag",
        types: ["mods"],
        handbookCategories: [],
        iconLink: null,
        recoilModifier: -1,
        ergonomicsModifier: -2,
        conflictingSlotIds: ["slot-x"],
        conflictingItems: ["mod-x"],
        properties: {
          propertiesType: "ItemPropertiesMagazine",
          slots: [],
        },
      },
      "skipped-gun": {
        id: "skipped-gun",
        name: "skipped-gun Name",
        shortName: "skipped-gun ShortName",
        normalizedName: "toy-gun",
        types: ["gun"],
        handbookCategories: ["weapons"],
        properties: {
          propertiesType: "ItemPropertiesWeapon",
          caliber: "Caliber9x19PARA",
          recoilHorizontal: 1,
          recoilVertical: 1,
          ergonomics: 1,
          slots: [],
        },
      },
    },
  };
}

describe("extractCaliber", () => {
  test("maps known calibers", () => {
    expect(extractCaliber("Caliber556x45NATO")).toBe("5.56x45");
  });

  test("falls back for unknown values", () => {
    expect(extractCaliber("Caliber999")).toBe("999");
    expect(extractCaliber(null)).toBe("Unknown");
  });
});

describe("processAllGuns / processAllMods", () => {
  test("maps guns with translations, traders, and preset images", () => {
    const { allGuns, gunsByCategory } = processAllGuns(makeDataset());

    expect(Object.keys(allGuns)).toEqual(["gun-1"]);
    expect(gunsByCategory["assault-rifles"]).toEqual(["gun-1"]);

    const gun = allGuns["gun-1"]!;
    expect(gun.name).toBe("Test Rifle");
    expect(gun.shortName).toBe("TR");
    expect(gun.category).toEqual({
      name: "Assault rifles",
      normalizedName: "assault-rifles",
    });
    expect(gun.caliber).toBe("5.56x45");
    expect(gun.defaultPresetImageUrl).toBe(
      "https://assets.tarkov.dev/preset-1-base-image.webp",
    );
    expect(gun.avgFleaMarketRUBPrice).toBe(50000);
    expect(gun.traderOffers).toEqual([
      {
        name: "Mechanic",
        normalizedName: "mechanic",
        minTraderLevel: 2,
        price: 10000,
        currency: "RUB",
        priceRUB: 10000,
      },
    ]);
    expect(gun.slots[0]).toMatchObject({
      name: "Pistol Grip",
      nameId: "mod_pistol_grip",
      allowedModIds: ["mod-1"],
    });
  });

  test("maps mods and collects nested relevant mods", () => {
    const dataset = makeDataset();
    const { allGuns } = processAllGuns(dataset);
    const allMods = processAllMods(dataset);

    expect(Object.keys(allMods).sort()).toEqual(["mod-1", "mod-2"]);
    expect(allMods["mod-1"]?.name).toBe("Test Grip");
    expect(allMods["mod-2"]?.conflictingModIds).toEqual(["mod-x"]);

    const relevant = processRelevantMods(allGuns["gun-1"]!, allMods);
    expect(Object.keys(relevant).sort()).toEqual(["mod-1", "mod-2"]);
  });
});
