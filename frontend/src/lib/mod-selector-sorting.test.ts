import { describe, expect, test } from "bun:test";
import {
  getNextModSelectorSorting,
  getVisibleSortIndex,
  normalizeModSelectorSorting,
  TRADER_AVAILABILITY_RANK_COLUMN_ID,
  TRADER_PRICE_COLUMN_ID,
} from "./mod-selector-sorting";

describe("mod selector sorting", () => {
  test("inserts availability rank immediately before trader price", () => {
    const result = normalizeModSelectorSorting([
      { id: TRADER_PRICE_COLUMN_ID, desc: false },
    ]);

    expect(result).toEqual([
      { id: TRADER_AVAILABILITY_RANK_COLUMN_ID, desc: false },
      { id: TRADER_PRICE_COLUMN_ID, desc: false },
    ]);
  });

  test("keeps availability rank ascending when trader price is descending", () => {
    const result = normalizeModSelectorSorting([
      { id: TRADER_AVAILABILITY_RANK_COLUMN_ID, desc: true },
      { id: TRADER_PRICE_COLUMN_ID, desc: true },
    ]);

    expect(result).toEqual([
      { id: TRADER_AVAILABILITY_RANK_COLUMN_ID, desc: false },
      { id: TRADER_PRICE_COLUMN_ID, desc: true },
    ]);
  });

  test("removes availability rank when trader price is not sorted", () => {
    const result = normalizeModSelectorSorting([
      { id: "ergonomicsModifier", desc: false },
      { id: TRADER_AVAILABILITY_RANK_COLUMN_ID, desc: false },
    ]);

    expect(result).toEqual([{ id: "ergonomicsModifier", desc: false }]);
  });

  test("preserves multi-sort order around trader price", () => {
    const result = normalizeModSelectorSorting([
      { id: "recoilModifier", desc: true },
      { id: TRADER_PRICE_COLUMN_ID, desc: false },
      { id: "avgFleaMarketRUBPrice", desc: false },
    ]);

    expect(result).toEqual([
      { id: "recoilModifier", desc: true },
      { id: TRADER_AVAILABILITY_RANK_COLUMN_ID, desc: false },
      { id: TRADER_PRICE_COLUMN_ID, desc: false },
      { id: "avgFleaMarketRUBPrice", desc: false },
    ]);
  });

  test("normalizes updater functions from TanStack sorting changes", () => {
    const result = getNextModSelectorSorting(
      (currentSorting) => [
        ...currentSorting,
        { id: TRADER_PRICE_COLUMN_ID, desc: false },
      ],
      [{ id: "ergonomicsModifier", desc: true }],
    );

    expect(result).toEqual([
      { id: "ergonomicsModifier", desc: true },
      { id: TRADER_AVAILABILITY_RANK_COLUMN_ID, desc: false },
      { id: TRADER_PRICE_COLUMN_ID, desc: false },
    ]);
  });

  test("computes visible sort index without the hidden availability rank", () => {
    const sorting = normalizeModSelectorSorting([
      { id: "recoilModifier", desc: true },
      { id: TRADER_PRICE_COLUMN_ID, desc: false },
      { id: "avgFleaMarketRUBPrice", desc: false },
    ]);

    expect(getVisibleSortIndex(sorting, TRADER_PRICE_COLUMN_ID)).toBe(1);
    expect(getVisibleSortIndex(sorting, "avgFleaMarketRUBPrice")).toBe(2);
  });
});
