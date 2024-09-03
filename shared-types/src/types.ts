export type ProcessedData = {
  gunsByCategory: Record<string, string[]>;
  allGuns: Record<string, Gun>;
  allMods: Record<string, Mod>;
};

export type TraderOffer = {
  name: string;
  normalizedName: string;
  minTraderLevel: number; // minimum trader level needed to use offer
  price: number; // displayed with proper currency symbol or directly as currency field value if not recognized
  currency: string; // represents currency of the price field
  priceRUB: number; // used for sorting and calculations
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
