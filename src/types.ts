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

export type Slot = {
  id: string;
  required: boolean;
  name: string;
  nameId: string;
  allowedModIds: ItemId[];
};

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

export type FullGun = Omit<Gun, "slots"> & { slots: FullSlot[] };
export type FullSlot = Omit<Slot, "allowedModIds"> & { allowedMods: FullMod[] };
export type FullMod = Omit<Mod, "slots"> & { slots: FullSlot[] };

export type CategorizedGunListData = {
  categoryName: string;
  guns: Pick<
    Gun,
    "id" | "name" | "shortName" | "defaultPresetImageUrl" | "caliber"
  >[];
}[];

export type SlotSelectionNode = {
  slotNameId: string;
  modId: ItemId | null;
  slots: SlotSelectionNode[];
};

export type GunModdingState = {
  selections: SlotSelectionNode[];
  // conflictingModIds: Set<ItemId>;
  // conflictingSlotIds: Set<string>;
};

export type GunModdingAction =
  | { type: "updated_selection"; path: string[]; modId: ItemId | null }
  | { type: "reset"; slots: Slot[] };
