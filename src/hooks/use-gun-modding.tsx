// src/hooks/useGunModding.ts

import { Reducer, useCallback, useReducer } from "react";
import {
  GunModdingAction,
  Gun,
  ItemId,
  Mod,
  Slot,
  SlotSelectionNode,
  GunModdingState,
} from "@/types";

// reset all slots to empty
function initializeEmptyState(slots: Slot[]): GunModdingState {
  return {
    selections: slots.map((slot) => ({
      slotNameId: slot.nameId,
      modId: null,
      slots: [],
    })),
    // conflictingModIds: new Set(), will add later
    // conflictingSlotIds: new Set(), will add later
  };
}

function updateSelectionNode(
  node: SlotSelectionNode,
  mods: Record<ItemId, Mod>,
  path: string[],
  modId: ItemId | null,
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

export function useGunModding(
  gun: Gun,
  mods: Record<ItemId, Mod>,
  preset?: SlotSelectionNode[],
) {
  const reducer = useCallback<Reducer<GunModdingState, GunModdingAction>>(
    (state, action) => {
      switch (action.type) {
        case "updated_selection":
          const newSelections = state.selections.map((node) =>
            updateSelectionNode(node, mods, action.path, action.modId),
          );
          return {
            selections: newSelections,
            // conflictingModIds, will add later
            // conflictingSlotIds, will add later
          };
        case "reset":
          return initializeEmptyState(action.slots);
        default:
          return state;
      }
    },
    [mods], // Now 'mods' is explicitly listed as a dependency
  );

  const [state, dispatch] = useReducer(
    reducer,
    preset ? { selections: preset } : initializeEmptyState(gun.slots),
  );

  return {
    selections: state.selections,
    dispatch,
  };
}
