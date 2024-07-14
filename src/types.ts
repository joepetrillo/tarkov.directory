export type BasicGunInfo = {
  id: string;
  name: string;
  normalizedName: string;
  shortName: string;
  defaultPresetImageUrl: string | null;
  category: {
    name: string;
    normalizedName: string;
  };
};

export type ModItem = {
  id: string;
  name: string;
  shortName: string;
  iconLink: string;
  recoilModifier: number;
  ergonomicsModifier: number;
  conflictingSlotIds: string[];
  conflictingItems: {
    id: string;
  }[];
};

export type FullGunInfo = BasicGunInfo & {
  recoilHorizontal: number;
  recoilVertical: number;
  ergonomics: number;
  slots: {
    id: string;
    required: boolean;
    name: string;
    nameId: string;
    allowedItems: ModItem[];
  }[];
};

export type ModdingAction =
  | {
      type: "added_item";
      nameId: string;
      item: ModItem;
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
    [nameId: string]: ModItem | null;
  };
};
