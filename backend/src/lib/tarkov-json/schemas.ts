import { z } from "zod";

// Schemas cover the subset of dump fields we read — not the full items payload.
// Domain rules (weapon vs mod, required stats) live in data-mapping.ts.

export const slotSchema = z.object({
  id: z.string().min(1),
  nameId: z.string().min(1),
  // Placeholder key (e.g. MOD_PISTOL_GRIP); resolve via items_en translations.
  name: z.string().min(1),
  required: z.boolean(),
  filters: z.object({
    // Already item IDs (unlike old GraphQL `{ id }` objects).
    allowedItems: z.array(z.string()).default([]),
    allowedCategories: z.array(z.string()).optional(),
  }),
});

export const buyFromTraderSchema = z.object({
  // Trader id — join with /traders (+ traders_en) for display name.
  trader: z.string().min(1),
  price: z.number(),
  priceRUB: z.number(),
  currency: z.string().min(1),
  minTraderLevel: z.number(),
});

export const itemPropertiesSchema = z
  .object({
    propertiesType: z.string().optional(),
    caliber: z.string().nullable().optional(),
    recoilHorizontal: z.number().nullable().optional(),
    recoilVertical: z.number().nullable().optional(),
    ergonomics: z.number().nullable().optional(),
    // Preset item id, not an embedded object — look up baseImageLink on that item.
    defaultPreset: z.string().nullable().optional(),
    slots: z.array(slotSchema).optional(),
  })
  // Keep unknown property fields so we don't strip dump data we might need later.
  .passthrough();

export const handbookCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  normalizedName: z.string().min(1),
  parent: z.string().nullable().optional(),
});

export const itemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    shortName: z.string().min(1),
    normalizedName: z.string().min(1),
    types: z.array(z.string()).default([]),
    iconLink: z.string().nullable().optional(),
    baseImageLink: z.string().nullable().optional(),
    handbookCategories: z.array(z.string()).default([]),
    avg24hPrice: z.number().nullable().optional(),
    lastLowPrice: z.number().nullable().optional(),
    recoilModifier: z.number().nullable().optional(),
    ergonomicsModifier: z.number().nullable().optional(),
    conflictingSlotIds: z.array(z.string()).nullable().optional(),
    conflictingItems: z.array(z.string()).nullable().optional(),
    buyFromTrader: z.array(buyFromTraderSchema).nullable().optional(),
    properties: itemPropertiesSchema.nullable().optional(),
  })
  .passthrough();

export const traderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  normalizedName: z.string().min(1),
});

export const itemsResponseSchema = z.object({
  data: z.object({
    items: z.record(z.string(), z.unknown()),
    handbookCategories: z.record(z.string(), z.unknown()),
  }),
});

export const translationsResponseSchema = z.object({
  data: z.record(z.string(), z.string()),
});

export const tradersResponseSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

export type TarkovSlot = z.infer<typeof slotSchema>;
export type TarkovBuyFromTrader = z.infer<typeof buyFromTraderSchema>;
export type TarkovItemProperties = z.infer<typeof itemPropertiesSchema>;
export type TarkovHandbookCategory = z.infer<typeof handbookCategorySchema>;
export type TarkovItem = z.infer<typeof itemSchema>;
export type TarkovTrader = z.infer<typeof traderSchema>;
