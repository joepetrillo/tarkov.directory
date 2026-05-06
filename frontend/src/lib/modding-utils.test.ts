import { describe, expect, test } from "bun:test";
import type { Gun, Mod, Slot } from "@tarkov.directory/shared-types";
import { createModdingUtils } from "./modding-utils";

function slot(id: string, allowedModIds: string[]): Slot {
  return {
    id,
    required: false,
    name: id,
    nameId: id,
    allowedModIds,
  };
}

function mod(id: string, overrides: Partial<Mod> = {}): Mod {
  return {
    id,
    name: id,
    normalizedName: id,
    shortName: id,
    iconImageUrl: null,
    recoilModifier: 0,
    ergonomicsModifier: 0,
    conflictingSlotIds: [],
    conflictingModIds: [],
    avgFleaMarketRUBPrice: undefined,
    traderOffers: undefined,
    slots: [],
    ...overrides,
  };
}

function gun(overrides: Partial<Gun> = {}): Gun {
  return {
    id: "gun",
    name: "gun",
    normalizedName: "gun",
    shortName: "gun",
    category: {
      name: "Assault rifles",
      normalizedName: "assault-rifles",
    },
    caliber: "5.56x45",
    recoilHorizontal: 80,
    recoilVertical: 100,
    ergonomics: 50,
    defaultPresetImageUrl: null,
    avgFleaMarketRUBPrice: undefined,
    traderOffers: undefined,
    slots: [],
    ...overrides,
  };
}

describe("modding utils", () => {
  test("calculates stats recursively and preserves current rounding/clamping", () => {
    const rootSlot = slot("root-slot", ["parent"]);
    const childSlot = slot("child-slot", ["child"]);
    const mods = {
      parent: mod("parent", {
        ergonomicsModifier: 3,
        recoilModifier: -10,
        slots: [childSlot],
      }),
      child: mod("child", {
        ergonomicsModifier: -60,
        recoilModifier: -5,
      }),
    };
    const utils = createModdingUtils(gun({ slots: [rootSlot] }), mods);
    const withParent = utils.getUpdatedSelections(
      utils.getEmptySelections(),
      ["root-slot"],
      "parent",
    );
    const withChild = utils.getUpdatedSelections(
      withParent,
      ["root-slot", "child-slot"],
      "child",
    );

    expect(utils.calculateStats(withChild)).toEqual({
      ergonomics: 0,
      recoilVertical: 85,
      recoilHorizontal: 68,
    });
  });

  test("detects selected mod conflicts recursively", () => {
    const rootSlot = slot("root-slot", ["selected"]);
    const targetSlot = slot("target-slot", ["candidate"]);
    const mods = {
      selected: mod("selected", {
        conflictingModIds: ["candidate"],
      }),
      candidate: mod("candidate"),
    };
    const utils = createModdingUtils(
      gun({ slots: [rootSlot, targetSlot] }),
      mods,
    );
    const selections = utils.getUpdatedSelections(
      utils.getEmptySelections(),
      ["root-slot"],
      "selected",
    );

    expect(utils.isConflicting(selections, ["target-slot"], "candidate")).toBe(
      true,
    );
  });

  test("does not mark the selected mod as conflicting with itself at the target path", () => {
    const rootSlot = slot("root-slot", ["selected"]);
    const mods = {
      selected: mod("selected", {
        conflictingModIds: ["selected"],
      }),
    };
    const utils = createModdingUtils(gun({ slots: [rootSlot] }), mods);
    const selections = utils.getUpdatedSelections(
      utils.getEmptySelections(),
      ["root-slot"],
      "selected",
    );

    expect(utils.isConflicting(selections, ["root-slot"], "selected")).toBe(
      false,
    );
  });

  test("detects candidate mods that conflict with occupied slot ids", () => {
    const selectedSlot = slot("selected-slot", ["selected"]);
    const targetSlot = slot("target-slot", ["candidate"]);
    const mods = {
      selected: mod("selected"),
      candidate: mod("candidate", {
        conflictingSlotIds: ["selected-slot"],
      }),
    };
    const utils = createModdingUtils(
      gun({ slots: [selectedSlot, targetSlot] }),
      mods,
    );
    const selections = utils.getUpdatedSelections(
      utils.getEmptySelections(),
      ["selected-slot"],
      "selected",
    );

    expect(utils.isConflicting(selections, ["target-slot"], "candidate")).toBe(
      true,
    );
  });

  test("detects selected mods that conflict with the target slot id", () => {
    const selectedSlot = slot("selected-slot", ["selected"]);
    const targetSlot = slot("target-slot", ["candidate"]);
    const mods = {
      selected: mod("selected", {
        conflictingSlotIds: ["target-slot"],
      }),
      candidate: mod("candidate"),
    };
    const utils = createModdingUtils(
      gun({ slots: [selectedSlot, targetSlot] }),
      mods,
    );
    const selections = utils.getUpdatedSelections(
      utils.getEmptySelections(),
      ["selected-slot"],
      "selected",
    );

    expect(utils.isConflicting(selections, ["target-slot"], "candidate")).toBe(
      true,
    );
  });
});
