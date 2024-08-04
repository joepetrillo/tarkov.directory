// src/hooks/useGunModding.ts

import { useReducer } from "react";
import {
  Action,
  Gun,
  ItemId,
  Mod,
  Slot,
  SlotSelectionNode,
  State,
} from "@/types";

// reset all slots to empty
function initializeEmptyState(slots: Slot[]): State {
  return {
    selections: slots.map((slot) => ({
      slotNameId: slot.nameId,
      modId: null,
      slots: [],
    })),
    // conflictingModIds: new Set(),
    // conflictingSlotIds: new Set(),
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

function reducer(
  state: State,
  action: Action,
  mods: Record<ItemId, Mod>,
): State {
  switch (action.type) {
    case "updated_selection":
      const newSelections = state.selections.map((node) =>
        updateSelectionNode(node, mods, action.path, action.modId),
      );
      return {
        selections: newSelections,
        // conflictingModIds,
        // conflictingSlotIds,
      };
    case "reset":
      return initializeEmptyState(action.slots);
    default:
      return state;
  }
}

export function useGunModding(
  gun: Gun,
  mods: Record<ItemId, Mod>,
  preset?: SlotSelectionNode[],
) {
  const [state, dispatch] = useReducer(
    (state: State, action: Action) => reducer(state, action, mods),
    preset ? { selections: preset } : initializeEmptyState(gun.slots),
  );

  return {
    selections: state.selections,
    dispatch,
  };
}
