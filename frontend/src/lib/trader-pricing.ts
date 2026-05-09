import type { TraderOffer } from "@tarkov.directory/shared-types";
import { getTraderLevel, type TraderLevels } from "@/lib/trader-levels";

export type TraderPriceStatus =
  | {
      status: "available";
      offer: TraderOffer;
      sortPriceRUB: number;
    }
  | {
      status: "locked";
      offer: TraderOffer;
      sortPriceRUB: number;
    }
  | {
      status: "none";
      offer: null;
      sortPriceRUB: undefined;
    };

export function sortTraderOffersByPriceRUB(
  traderOffers: TraderOffer[],
): TraderOffer[] {
  return traderOffers.toSorted((a, b) => a.priceRUB - b.priceRUB);
}

export function getTraderPriceStatus(
  traderOffers: TraderOffer[] | undefined,
  traderLevels: TraderLevels,
): TraderPriceStatus {
  if (!traderOffers?.length) {
    return {
      status: "none",
      offer: null,
      sortPriceRUB: undefined,
    };
  }

  const sortedOffers = sortTraderOffersByPriceRUB(traderOffers);
  const availableOffer = sortedOffers.find(
    (offer) =>
      offer.minTraderLevel <=
      getTraderLevel(traderLevels, offer.normalizedName),
  );

  if (availableOffer) {
    return {
      status: "available",
      offer: availableOffer,
      sortPriceRUB: availableOffer.priceRUB,
    };
  }

  const cheapestLockedOffer = sortedOffers[0] as TraderOffer;

  return {
    status: "locked",
    offer: cheapestLockedOffer,
    sortPriceRUB: cheapestLockedOffer.priceRUB,
  };
}

export function getCurrencySymbol(currency: string) {
  switch (currency) {
    case "RUB":
      return "₽";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    default:
      return currency;
  }
}
