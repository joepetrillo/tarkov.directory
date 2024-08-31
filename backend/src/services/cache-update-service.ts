import { cacheService } from "./cache-service";
import request from "graphql-request";
import { CacheKeys, TARKOV_API_URL } from "../lib/constants";
import { GetAllGuns, GetAllMods } from "../graphql/queries";
import {
  processAllGuns,
  processAllMods,
  processRelevantMods,
} from "../lib/data-mapping";

export const cacheUpdateService = {
  async updateAllCachedData() {
    console.log("Updating all cached data...");

    const updateAttempt = async () => {
      // Fetch and update gun data
      const gunData = await request(TARKOV_API_URL, GetAllGuns);
      const processedGuns = processAllGuns(gunData);
      cacheService.set(CacheKeys.GUN_DATA, processedGuns);

      // Fetch and update mod data
      const modData = await request(TARKOV_API_URL, GetAllMods);
      const { allMods } = processAllMods(modData);
      cacheService.set(CacheKeys.MOD_DATA, allMods);

      // Update relevant mods for each gun
      const { allGuns } = processedGuns;
      for (const gunId in allGuns) {
        const gun = allGuns[gunId];
        if (!gun) {
          continue;
        }
        const relevantMods = processRelevantMods(gun, allMods);
        const cacheKey = `gunMods:${gunId}`;
        cacheService.set(cacheKey, relevantMods);
      }

      console.log("Cache update completed successfully.");
    };

    try {
      await updateAttempt();
    } catch (error) {
      console.error("Error updating cache, retrying once:", error);
      try {
        await updateAttempt();
      } catch (retryError) {
        console.error("Error updating cache after retry:", retryError);
      }
    }
  },
};
