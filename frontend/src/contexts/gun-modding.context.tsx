"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useMemo,
  useState,
} from "react";
import { Gun, Mod } from "@tarkov.directory/shared-types";
import {
  SlotSelectionNode,
  GunModdingState,
  GunModdingAction,
  GunModdingContextType,
} from "@/types";
import { createModdingUtils } from "@/lib/modding-utils";
import {
  DEFAULT_TRADER_LEVELS,
  readStoredTraderLevels,
  type TraderLevel,
  writeStoredTraderLevels,
} from "@/lib/trader-levels";

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
  const [traderLevels, setTraderLevels] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_TRADER_LEVELS;
    }

    return readStoredTraderLevels(window.localStorage);
  });

  const setTraderLevel = useCallback(
    (normalizedName: string, traderLevel: TraderLevel) => {
      setTraderLevels((currentTraderLevels) => {
        const nextTraderLevels = {
          ...currentTraderLevels,
          [normalizedName]: traderLevel,
        };

        writeStoredTraderLevels(window.localStorage, nextTraderLevels);

        return nextTraderLevels;
      });
    },
    [],
  );

  const resetTraderLevels = useCallback(() => {
    setTraderLevels(DEFAULT_TRADER_LEVELS);
    writeStoredTraderLevels(window.localStorage, DEFAULT_TRADER_LEVELS);
  }, []);

  const value: GunModdingContextType = {
    state,
    dispatch,
    gun,
    mods,
    traderLevels,
    setTraderLevel,
    resetTraderLevels,
    moddingUtils,
  };

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
