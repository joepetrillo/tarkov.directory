import { Gun, Mod } from "@tarkov.directory/shared-types";

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
