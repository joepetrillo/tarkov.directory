import type { SortingState, Updater } from "@tanstack/react-table";

export const TRADER_PRICE_COLUMN_ID = "traderPrice";
export const TRADER_AVAILABILITY_RANK_COLUMN_ID = "traderAvailabilityRank";

export function normalizeModSelectorSorting(
  nextSorting: SortingState,
): SortingState {
  const sortingWithoutAvailabilityRank = nextSorting.filter(
    (sort) => sort.id !== TRADER_AVAILABILITY_RANK_COLUMN_ID,
  );
  const traderPriceIndex = sortingWithoutAvailabilityRank.findIndex(
    (sort) => sort.id === TRADER_PRICE_COLUMN_ID,
  );

  if (traderPriceIndex === -1) {
    return sortingWithoutAvailabilityRank;
  }

  return [
    ...sortingWithoutAvailabilityRank.slice(0, traderPriceIndex),
    { id: TRADER_AVAILABILITY_RANK_COLUMN_ID, desc: false },
    ...sortingWithoutAvailabilityRank.slice(traderPriceIndex),
  ];
}

export function getNextModSelectorSorting(
  updater: Updater<SortingState>,
  currentSorting: SortingState,
): SortingState {
  const nextSorting =
    typeof updater === "function" ? updater(currentSorting) : updater;

  return normalizeModSelectorSorting(nextSorting);
}

export function getVisibleSorting(sorting: SortingState): SortingState {
  return sorting.filter(
    (sort) => sort.id !== TRADER_AVAILABILITY_RANK_COLUMN_ID,
  );
}

export function getVisibleSortIndex(
  sorting: SortingState,
  columnId: string,
): number {
  return getVisibleSorting(sorting).findIndex((sort) => sort.id === columnId);
}
