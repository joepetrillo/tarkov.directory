"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import {
  Gun,
  Mod,
  Slot,
  SlotSelectionNode,
  GunModdingState,
  GunModdingAction,
} from "@/types";

function initializeEmptyState(slots: Slot[]): GunModdingState {
  return {
    selections: slots.map((slot) => ({
      slotNameId: slot.nameId,
      modId: null,
      slots: [],
    })),
  };
}

function updateSelectionNode(
  node: SlotSelectionNode,
  mods: Record<string, Mod>,
  path: string[],
  modId: string | null,
): SlotSelectionNode {
  if (node.slotNameId === path[0]) {
    if (path.length === 1) {
      if (modId === null) {
        return { ...node, modId, slots: [] };
      }
      const mod = mods[modId];
      return {
        ...node,
        modId,
        slots: mod.slots.map((slot) => ({
          slotNameId: slot.nameId,
          modId: null,
          slots: [],
        })),
      };
    }
    return {
      ...node,
      slots: node.slots.map((subNode) =>
        subNode.slotNameId === path[1]
          ? updateSelectionNode(subNode, mods, path.slice(1), modId)
          : subNode,
      ),
    };
  }
  return node;
}

type GunModdingContextType = {
  state: GunModdingState;
  dispatch: React.Dispatch<GunModdingAction>;
  gun: Gun;
  mods: Record<string, Mod>;
  preset?: SlotSelectionNode[];
};

const GunModdingContext = createContext<GunModdingContextType | null>(null);

export function GunModdingProvider({
  children,
  gun,
  mods,
  preset,
}: {
  children: ReactNode;
  gun: Gun;
  mods: Record<string, Mod>;
  preset?: SlotSelectionNode[];
}) {
  const reducer = useCallback<React.Reducer<GunModdingState, GunModdingAction>>(
    (state, action) => {
      switch (action.type) {
        case "updated_selection":
          const newSelections = state.selections.map((node) =>
            updateSelectionNode(node, mods, action.path, action.modId),
          );
          return {
            selections: newSelections,
          };
        case "reset":
          return initializeEmptyState(action.slots);
        default:
          return state;
      }
    },
    [mods],
  );

  const [state, dispatch] = useReducer(
    reducer,
    preset ? { selections: preset } : initializeEmptyState(gun.slots),
  );

  const value: GunModdingContextType = { state, dispatch, gun, mods, preset };

  console.log(state);

  return (
    <GunModdingContext.Provider value={value}>
      {children}
    </GunModdingContext.Provider>
  );
}

export function useGunModding() {
  const context = useContext(GunModdingContext);
  if (context === null) {
    throw new Error("useGunModding must be used within a GunModdingProvider");
  }
  return context;
}
