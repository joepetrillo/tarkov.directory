export type ItemId = string;

export type ProcessedData = {
  gunsByCategory: Record<string, ItemId[]>;
  allGuns: Record<ItemId, Gun>;
  allMods: Record<ItemId, Mod>;
};

export type Gun = {
  id: ItemId;
  name: string;
  normalizedName: string;
  shortName: string;
  category: {
    name: string;
    normalizedName: string;
  };
  caliber: string;
  recoilHorizontal: number;
  recoilVertical: number;
  ergonomics: number;
  defaultPresetImageUrl: string | null;
  slots: Slot[];
};

export type FullGun = Omit<Gun, "slots"> & { slots: FullSlot[] };

export type Slot = {
  id: string;
  required: boolean;
  name: string;
  nameId: string;
  allowedModIds: ItemId[];
};

export type FullSlot = Omit<Slot, "allowedModIds"> & { allowedMods: FullMod[] };

export type Mod = {
  id: ItemId;
  name: string;
  normalizedName: string;
  shortName: string;
  iconImageUrl: string | null;
  recoilModifier: number;
  ergonomicsModifier: number;
  conflictingSlotIds: string[];
  conflictingModIds: ItemId[];
  slots: Slot[];
};

export type FullMod = Omit<Mod, "slots"> & { slots: FullSlot[] };

export type CategorizedGunListData = {
  categoryName: string;
  guns: Pick<
    Gun,
    "id" | "name" | "shortName" | "defaultPresetImageUrl" | "caliber"
  >[];
}[];

export type ModPreset = {
  // id: string;
  gunId: string;
  name: string;
  // createdAt: Date;
  // updatedAt: Date;
  selections: {
    slotId: string;
    modId: string | null;
  }[];
};

export type ModdingAction =
  | {
      type: "added_item";
      nameId: string;
      item: Mod;
    }
  | {
      type: "removed_item";
      nameId: string;
    };

export type ModdingState = {
  stats: {
    recoilVertical: number;
    recoilHorizontal: number;
    ergonomics: number;
  };
  selectedItems: {
    [nameId: string]: Mod | null;
  };
};
