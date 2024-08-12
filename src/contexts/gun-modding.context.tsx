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
  GunModdingContextType,
} from "@/types";

// gets us slots with at least one valid mod that can go in it, according to the mods object we have
function getValidNodeSlots(
  slots: Slot[],
  mods: Record<string, Mod>,
): SlotSelectionNode[] {
  return slots
    .map((slot) => {
      return {
        ...slot,
        allowedModIds: slot.allowedModIds.filter((modId) => mods[modId]),
      };
    })
    .filter((slot) => slot.allowedModIds.length > 0)
    .map((slot) => ({
      slotNameId: slot.nameId,
      modId: null,
      slots: [],
    }));
}

function initializeEmptyState(
  slots: Slot[],
  mods: Record<string, Mod>,
): GunModdingState {
  return {
    selections: getValidNodeSlots(slots, mods),
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
      if (!mod) {
        throw new Error(`Mod with id ${modId} not found`);
      }

      return {
        ...node,
        modId,
        slots: getValidNodeSlots(mod.slots, mods),
      };
    }
    return {
      ...node,
      slots: node.slots.map((childNode) =>
        childNode.slotNameId === path[1]
          ? updateSelectionNode(childNode, mods, path.slice(1), modId)
          : childNode,
      ),
    };
  }
  return node;
}

const GunModdingContext = createContext<GunModdingContextType | null>(null);

export function GunModdingProvider({
  gun,
  mods,
  preset,
  children,
}: {
  gun: Gun;
  mods: Record<string, Mod>;
  preset?: SlotSelectionNode[];
  children: ReactNode;
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
          return initializeEmptyState(action.slots, mods);
        default:
          return state;
      }
    },
    [mods],
  );

  const [state, dispatch] = useReducer(
    reducer,
    preset ? { selections: preset } : initializeEmptyState(gun.slots, mods),
  );

  const value: GunModdingContextType = { state, dispatch, gun, mods };

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
