import { Elysia } from "elysia";
import { TarkovJsonError } from "../lib/tarkov-json";
import { tarkovDataCache } from "../services/tarkov-data-cache";

const ROUTE_PREFIX = "/guns";

export const gunsRoutes = new Elysia({ prefix: ROUTE_PREFIX })
  .get("/", async () => {
    // Throw on Tarkov/cache failure (→ onError 503) so Eden success type stays GunData-only.
    return await tarkovDataCache.getGuns();
  })
  .get("/:gunId/mods", async ({ params: { gunId }, set }) => {
    const gunData = await tarkovDataCache.getGuns();
    const gun = gunData.allGuns[gunId];

    if (!gun) {
      set.status = 404;
      return { error: "Gun not found" as const };
    }

    const relevantMods = await tarkovDataCache.getRelevantMods(gun);
    return { relevantMods, gun };
  })
  .onError(({ error, set }) => {
    // Upstream dump/cache problems — not "gun missing" (that's 404 above).
    if (error instanceof TarkovJsonError) {
      set.status = 503;
      return { error: error.message };
    }
  });
