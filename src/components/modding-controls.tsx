"use client";

import ModItemIcon from "@/components/mod-item-icon";
import StatsCard from "@/components/stats-card";
import { FullGunInfo, ModdingAction, ModdingState } from "@/types";
import { useReducer } from "react";

function reducer(state: ModdingState, action: ModdingAction) {
  switch (action.type) {
    case "added_item":
      return {
        ...state,
        stats: {
          recoilVertical:
            state.stats.recoilVertical + action.item.recoilModifier,
          recoilHorizontal:
            state.stats.recoilHorizontal + action.item.recoilModifier,
          ergonomics: state.stats.ergonomics + action.item.ergonomicsModifier,
        },
        selectedItems: {
          ...state.selectedItems,
          [action.nameId]: action.item,
        },
      };
    case "removed_item":
      const removedItem = state.selectedItems[action.nameId];
      if (!removedItem) return state;
      return {
        ...state,
        stats: {
          recoilVertical:
            state.stats.recoilVertical - removedItem.recoilModifier,
          recoilHorizontal:
            state.stats.recoilHorizontal - removedItem.recoilModifier,
          ergonomics: state.stats.ergonomics - removedItem.ergonomicsModifier,
        },
        selectedItems: {
          ...state.selectedItems,
          [action.nameId]: null,
        },
      };
  }
}

export default function ModdingControls({ gun }: { gun: FullGunInfo }) {
  const [moddingState, dispatch] = useReducer(reducer, {
    stats: {
      recoilVertical: gun.recoilVertical,
      recoilHorizontal: gun.recoilHorizontal,
      ergonomics: gun.ergonomics,
    },
    selectedItems: {},
  });

  return (
    <div>
      <StatsCard stats={moddingState.stats} />
      <div className="mt-8 flex flex-col gap-8">
        {gun.slots.map((slot) => (
          <div key={slot.id}>
            <h3 className="mb-4 text-xl font-bold">{slot.name}</h3>
            <div className="flex flex-wrap gap-1">
              {slot.allowedItems.map((item) => (
                <ModItemIcon
                  key={item.id}
                  dispatch={dispatch}
                  slotNameId={slot.nameId}
                  item={item}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
