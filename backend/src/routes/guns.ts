import { Elysia } from "elysia";
import request from "graphql-request";
import { CacheKeys, TARKOV_API_URL } from "../lib/constants";
import { GetAllGuns, GetAllMods } from "../graphql/queries";
import {
  processAllGuns,
  processAllMods,
  processRelevantMods,
} from "../lib/data-mapping";
import type { Gun, Mod } from "../lib/types";
import { dataCachePlugin } from "../services/cache-service";

const ROUTE_PREFIX = "/guns";

type GunData = {
  gunsByCategory: Record<string, string[]>;
  allGuns: Record<string, Gun>;
};

export const gunsRoutes = new Elysia({ prefix: ROUTE_PREFIX })
  .use(dataCachePlugin)
  .get("/", async ({ cache }) => {
    // try to get cached data
    const cachedGunData = cache.get<GunData>(CacheKeys.GUN_DATA);
    if (cachedGunData) return cachedGunData;

    // if not cached, get data from API
    const gunData = await request(TARKOV_API_URL, GetAllGuns);
    const processedGuns = cache.set<GunData>(
      CacheKeys.GUN_DATA,
      processAllGuns(gunData)
    );

    return processedGuns;
  })
  .get("/:gunId/mods", async ({ cache, params: { gunId }, set }) => {
    let gun: Gun | undefined = undefined;

    // try to get cached gun data
    const cachedGunData = cache.get<GunData>(CacheKeys.GUN_DATA);
    if (cachedGunData) {
      gun = cachedGunData.allGuns[gunId];
    } else {
      // if not cached, get data from API
      const gunData = await request(TARKOV_API_URL, GetAllGuns);
      const processedGuns = processAllGuns(gunData);
      cache.set<GunData>(CacheKeys.GUN_DATA, processedGuns);
      gun = processedGuns.allGuns[gunId];
    }

    if (!gun) {
      set.status = 404;
      return {
        error: "Gun not found",
      };
    }

    // try to get cached relevant mod data for gun
    const cacheKey = `gunMods:${gunId}`;
    const cachedRelevantMods = cache.get<Record<string, Mod>>(cacheKey);
    if (cachedRelevantMods) {
      return { relevantMods: cachedRelevantMods, gun };
    }

    // if relevant mods not cached, try to get all mods cached to avoid api call
    const cachedModData = cache.get<Record<string, Mod>>(CacheKeys.MOD_DATA);
    if (cachedModData) {
      const relevantMods = processRelevantMods(gun, cachedModData);
      cache.set<Record<string, Mod>>(cacheKey, relevantMods);
      return { relevantMods, gun };
    }

    // if not cached, get data from API
    const allModData = await request(TARKOV_API_URL, GetAllMods);
    const { allMods } = processAllMods(allModData);
    cache.set<Record<string, Mod>>(CacheKeys.MOD_DATA, allMods);

    const relevantMods = processRelevantMods(gun, allMods);
    cache.set<Record<string, Mod>>(cacheKey, relevantMods);

    return { relevantMods, gun };
  });
