"use client";

import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_TRADER_LEVELS,
  readStoredTraderLevels,
  type TraderLevel,
  type TraderLevels,
  writeStoredTraderLevels,
} from "@/lib/trader-levels";

type TraderLevelsContextType = {
  traderLevels: TraderLevels;
  setTraderLevel: (normalizedName: string, traderLevel: TraderLevel) => void;
  resetTraderLevels: () => void;
};

const TraderLevelsContext = createContext<TraderLevelsContextType | null>(null);

export function TraderLevelsProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({ traderLevels, setTraderLevel, resetTraderLevels }),
    [traderLevels, setTraderLevel, resetTraderLevels],
  );

  return (
    <TraderLevelsContext.Provider value={value}>
      {children}
    </TraderLevelsContext.Provider>
  );
}

export function useTraderLevels() {
  const context = use(TraderLevelsContext);
  if (context === null) {
    throw new Error(
      "useTraderLevels must be used within a TraderLevelsProvider",
    );
  }
  return context;
}
