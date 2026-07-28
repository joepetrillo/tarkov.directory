import { describe, expect, test } from "bun:test";
import { CacheKeys } from "./lib/constants";
import { fetchTarkovDataset } from "./lib/tarkov-json";
import {
  processAllGuns,
  processAllMods,
  processRelevantMods,
} from "./lib/data-mapping";
import { tarkovDataCache } from "./services/tarkov-data-cache";

describe("live Tarkov JSON integration", () => {
  test(
    "fetches, validates, and maps real dataset",
    async () => {
      const dataset = await fetchTarkovDataset();
      const { allGuns, gunsByCategory } = processAllGuns(dataset);
      const allMods = processAllMods(dataset);

      expect(Object.keys(dataset.items).length).toBeGreaterThan(1000);
      expect(Object.keys(allGuns).length).toBeGreaterThan(100);
      expect(Object.keys(allMods).length).toBeGreaterThan(500);
      expect(Object.keys(gunsByCategory).length).toBeGreaterThan(5);

      const m4 = Object.values(allGuns).find((gun) =>
        gun.normalizedName.includes("m4a1"),
      );
      expect(m4).toBeDefined();
      expect(m4!.name.toLowerCase()).toContain("m4");
      expect(m4!.slots.length).toBeGreaterThan(0);
      expect(m4!.defaultPresetImageUrl).toMatch(/^https:\/\/assets\.tarkov\.dev\//);

      const relevant = processRelevantMods(m4!, allMods);
      expect(Object.keys(relevant).length).toBeGreaterThan(50);
    },
    60_000,
  );

  test(
    "cache refresh warms gun/mod keys with single-flight and serves from memory",
    async () => {
      tarkovDataCache.flush();
      expect(tarkovDataCache.get(CacheKeys.GUN_DATA)).toBeUndefined();

      const [a, b] = await Promise.all([
        tarkovDataCache.refresh(),
        tarkovDataCache.refresh(),
      ]);
      expect(a).toBeUndefined();
      expect(b).toBeUndefined();

      const gunData = tarkovDataCache.get<{
        allGuns: Record<string, { id: string }>;
      }>(CacheKeys.GUN_DATA);
      const modData = tarkovDataCache.get<Record<string, unknown>>(
        CacheKeys.MOD_DATA,
      );
      expect(gunData).toBeDefined();
      expect(modData).toBeDefined();
      // Per-gun keys should NOT be prewarmed anymore
      const gunId = Object.keys(gunData!.allGuns)[0]!;
      expect(tarkovDataCache.get(`gunMods:${gunId}`)).toBeUndefined();

      const first = await tarkovDataCache.getGuns();
      const second = await tarkovDataCache.getGuns();
      expect(first).toBe(second);

      const gun = first.allGuns[gunId]!;
      const relevant = await tarkovDataCache.getRelevantMods(gun);
      expect(Object.keys(relevant).length).toBeGreaterThan(0);
    },
    60_000,
  );
});
