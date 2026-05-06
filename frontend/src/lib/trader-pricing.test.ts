import { describe, expect, test } from "bun:test";
import type { TraderOffer } from "@tarkov.directory/shared-types";
import {
  getTraderPriceStatus,
  sortTraderOffersByPriceRUB,
} from "./trader-pricing";
import type { TraderLevels } from "./trader-levels";

const allLl4: TraderLevels = {
  mechanic: 4,
  peacekeeper: 4,
  skier: 4,
};

function offer(overrides: Partial<TraderOffer>): TraderOffer {
  return {
    name: "Mechanic",
    normalizedName: "mechanic",
    minTraderLevel: 1,
    price: 1000,
    currency: "RUB",
    priceRUB: 1000,
    ...overrides,
  };
}

describe("trader pricing", () => {
  test("selects the cheapest available trader offer at all LL4", () => {
    const result = getTraderPriceStatus(
      [
        offer({ name: "Mechanic", normalizedName: "mechanic", priceRUB: 3000 }),
        offer({
          name: "Peacekeeper",
          normalizedName: "peacekeeper",
          minTraderLevel: 3,
          price: 20,
          currency: "USD",
          priceRUB: 2000,
        }),
      ],
      allLl4,
    );

    expect(result.status).toBe("available");
    expect(result.offer?.normalizedName).toBe("peacekeeper");
    expect(result.sortPriceRUB).toBe(2000);
  });

  test("ignores locked cheaper offers and selects the cheapest available offer", () => {
    const result = getTraderPriceStatus(
      [
        offer({
          name: "Peacekeeper",
          normalizedName: "peacekeeper",
          minTraderLevel: 3,
          price: 20,
          currency: "USD",
          priceRUB: 2000,
        }),
        offer({ name: "Mechanic", normalizedName: "mechanic", priceRUB: 3000 }),
      ],
      {
        mechanic: 1,
        peacekeeper: 1,
      },
    );

    expect(result.status).toBe("available");
    expect(result.offer?.normalizedName).toBe("mechanic");
    expect(result.sortPriceRUB).toBe(3000);
  });

  test("returns the cheapest locked offer when no trader offer is available", () => {
    const result = getTraderPriceStatus(
      [
        offer({
          name: "Peacekeeper",
          normalizedName: "peacekeeper",
          minTraderLevel: 3,
          priceRUB: 2000,
        }),
        offer({
          name: "Mechanic",
          normalizedName: "mechanic",
          minTraderLevel: 2,
          priceRUB: 1500,
        }),
      ],
      {
        mechanic: 1,
        peacekeeper: 1,
      },
    );

    expect(result.status).toBe("locked");
    expect(result.offer?.normalizedName).toBe("mechanic");
    expect(result.sortPriceRUB).toBe(1500);
  });

  test("returns no trader price when there are no trader offers", () => {
    const result = getTraderPriceStatus(undefined, allLl4);

    expect(result.status).toBe("none");
    expect(result.offer).toBeNull();
    expect(result.sortPriceRUB).toBeUndefined();
  });

  test("sorts mixed-currency offers by RUB-equivalent price", () => {
    const result = sortTraderOffersByPriceRUB([
      offer({
        name: "Peacekeeper",
        normalizedName: "peacekeeper",
        price: 10,
        currency: "USD",
        priceRUB: 5000,
      }),
      offer({ name: "Skier", normalizedName: "skier", priceRUB: 3000 }),
    ]);

    expect(result.map((currentOffer) => currentOffer.normalizedName)).toEqual([
      "skier",
      "peacekeeper",
    ]);
  });
});
