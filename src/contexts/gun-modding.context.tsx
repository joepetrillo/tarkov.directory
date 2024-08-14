"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import {
  Gun,
  Mod,
  SlotSelectionNode,
  GunModdingState,
  GunModdingAction,
  GunModdingContextType,
} from "@/types";
import { createModdingUtils } from "@/lib/modding-utils";

type GunModdingProviderProps = {
  gun: Gun;
  mods: Record<string, Mod>;
  preset?: SlotSelectionNode[];
  children: ReactNode;
};

const GunModdingContext = createContext<GunModdingContextType | null>(null);

export function GunModdingProvider({
  gun,
  mods,
  preset,
  children,
}: GunModdingProviderProps) {
  const moddingUtils = useMemo(
    () => createModdingUtils(gun, mods),
    [gun, mods],
  );

  const reducer = useCallback<React.Reducer<GunModdingState, GunModdingAction>>(
    (state, action) => {
      switch (action.type) {
        case "updated_selection":
          return {
            selections: moddingUtils.getUpdatedSelections(
              state.selections,
              action.path,
              action.modId,
            ),
          };
        case "reset":
          return {
            selections: moddingUtils.getEmptySelections(),
          };
        default:
          return state;
      }
    },
    [moddingUtils],
  );

  const [state, dispatch] = useReducer(
    reducer,
    preset
      ? { selections: preset }
      : { selections: moddingUtils.getEmptySelections() },
  );

  const value: GunModdingContextType = {
    state,
    dispatch,
    gun,
    mods,
    moddingUtils,
  };

  console.log("SELECTIONS: ", state.selections);
  // console.log("GUN: ", gun);
  // console.log("MODS: ", mods);

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
