export type ProcessedData = {
  gunsByCategory: Record<string, string[]>;
  allGuns: Record<string, Gun>;
  allMods: Record<string, Mod>;
};

export type TraderOffer = {
  name: string;
  normalizedName: string;
  minTraderLevel: number;
  price: number; // displayed with proper currency symbol or directly as currency field value if not recognized
  currency: string;
  priceRUB: number; // used for sorting and calculations (standardized)
};

export type Gun = {
  id: string;
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
  avgFleaMarketRUBPrice?: number;
  traderOffers?: TraderOffer[];
  slots: Slot[];
};

export type Slot = {
  id: string;
  required: boolean;
  name: string;
  nameId: string;
  allowedModIds: string[];
};

export type Mod = {
  id: string;
  name: string;
  normalizedName: string;
  shortName: string;
  iconImageUrl: string | null;
  recoilModifier: number;
  ergonomicsModifier: number;
  conflictingSlotIds: string[];
  conflictingModIds: string[];
  avgFleaMarketRUBPrice?: number;
  traderOffers?: TraderOffer[];
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

export type GunModdingContextType = {
  state: GunModdingState;
  dispatch: React.Dispatch<GunModdingAction>;
  gun: Gun;
  mods: Record<string, Mod>;
  moddingUtils: {
    calculateStats: (selections: SlotSelectionNode[]) => {
      ergonomics: number;
      recoilVertical: number;
      recoilHorizontal: number;
    };
    getEmptySelections: () => GunModdingState["selections"];
    getUpdatedSelections: (
      selections: SlotSelectionNode[],
      path: string[],
      modId: string | null,
    ) => SlotSelectionNode[];
    isConflicting: (
      selections: SlotSelectionNode[],
      fullPathString: string,
      modId: string,
    ) => boolean;
  };
};

export type SlotSelectionNode = {
  slotNameId: string;
  modId: string | null;
  slots: SlotSelectionNode[];
};

export type GunModdingState = {
  selections: SlotSelectionNode[];
};

export type GunModdingAction =
  | { type: "updated_selection"; path: string[]; modId: string | null }
  | { type: "reset" };
