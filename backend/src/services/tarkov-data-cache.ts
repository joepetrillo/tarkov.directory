/**
 * Process-local cache of mapped Gun/Mod data (not Redis / not Next's cache).
 * Cleared on process restart; warmed on startup + hourly cron.
 * We store full catalogs only — relevant mods are derived on demand (cheap in RAM).
 */
import type { Gun, Mod, ProcessedData } from "@tarkov.directory/shared-types";
import { CacheKeys } from "../lib/constants";
import {
  processAllGuns,
  processAllMods,
  processRelevantMods,
} from "../lib/data-mapping";
import { fetchTarkovDataset, TarkovJsonError } from "../lib/tarkov-json";

export type GunData = {
  gunsByCategory: ProcessedData["gunsByCategory"];
  allGuns: ProcessedData["allGuns"];
};

class TarkovDataCache {
  private cache = new Map<string, unknown>();
  /** In-flight refresh so concurrent cache misses share one Tarkov download. */
  private refreshPromise: Promise<void> | null = null;

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  private set<T>(key: string, value: T): T {
    this.cache.set(key, value);
    return value;
  }

  flush(): void {
    this.cache.clear();
  }

  async refresh(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.runRefresh().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async runRefresh(): Promise<void> {
    console.log("Updating all cached data from Tarkov JSON API...");

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const dataset = await fetchTarkovDataset();
        const processedGuns = processAllGuns(dataset);
        const allMods = processAllMods(dataset);

        if (Object.keys(processedGuns.allGuns).length === 0) {
          throw new TarkovJsonError("Processed zero guns from Tarkov JSON API");
        }
        if (Object.keys(allMods).length === 0) {
          throw new TarkovJsonError("Processed zero mods from Tarkov JSON API");
        }

        this.set(CacheKeys.GUN_DATA, processedGuns);
        this.set(CacheKeys.MOD_DATA, allMods);

        console.log(
          `Cache update completed: ${Object.keys(processedGuns.allGuns).length} guns, ${Object.keys(allMods).length} mods.`,
        );
        return;
      } catch (error) {
        lastError = error;
        if (attempt === 0) {
          console.error("Error updating cache, retrying once:", error);
        }
      }
    }

    console.error("Error updating cache after retry:", lastError);
    throw lastError;
  }

  private async ensureCached<T>(key: CacheKeys, label: string): Promise<T> {
    const hit = this.get<T>(key);
    if (hit) return hit;

    await this.refresh();

    const warmed = this.get<T>(key);
    if (!warmed) {
      throw new TarkovJsonError(`${label} unavailable after refresh`);
    }
    return warmed;
  }

  async getGuns(): Promise<GunData> {
    return this.ensureCached(CacheKeys.GUN_DATA, "Gun cache");
  }

  async getMods(): Promise<Record<string, Mod>> {
    return this.ensureCached(CacheKeys.MOD_DATA, "Mod cache");
  }

  /** Not cached per gun — processRelevantMods over in-memory MOD_DATA is enough. */
  async getRelevantMods(gun: Gun): Promise<Record<string, Mod>> {
    const allMods = await this.getMods();
    return processRelevantMods(gun, allMods);
  }
}

export const tarkovDataCache = new TarkovDataCache();
