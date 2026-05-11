"use client";

import {
  createContext,
  type ReactNode,
  type Reducer,
  use,
  useReducer,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { Gun, Mod } from "@tarkov.directory/shared-types";
import {
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

  const reducer = useCallback<Reducer<GunModdingState, GunModdingAction>>(
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

  useLayoutEffect(() => {
    return () => {
      dispatch({ type: "reset" });
    };
  }, []);

  const value: GunModdingContextType = {
    state,
    dispatch,
    gun,
    mods,
    moddingUtils,
  };

  return (
    <GunModdingContext.Provider value={value}>
      {children}
    </GunModdingContext.Provider>
  );
}

export function useGunModding() {
  const context = use(GunModdingContext);
  if (context === null) {
    throw new Error("useGunModding must be used within a GunModdingProvider");
  }
  return context;
}
