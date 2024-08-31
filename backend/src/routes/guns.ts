import { Elysia } from "elysia";
import request from "graphql-request";
import { TARKOV_API_URL } from "../lib/constants";
import { GetAllGuns, GetAllMods } from "../graphql/queries";
import { processAllGuns, processAllMods } from "../lib/data-mapping";
import type { Gun, Mod } from "../lib/types";

const ROUTE_PREFIX = "/guns";

export const gunsRoutes = new Elysia({ prefix: ROUTE_PREFIX })
  .get("/", async () => {
    const gunData = await request(TARKOV_API_URL, GetAllGuns);
    return processAllGuns(gunData);
  })
  .get("/:gunId/mods", async ({ params: { gunId } }) => {
    const gunData = await request(TARKOV_API_URL, GetAllGuns);
    const guns = processAllGuns(gunData);
    const gun = guns.allGuns[gunId];

    if (!gun) {
      return {
        error: "Gun not found",
      };
    }

    const allModData = await request(TARKOV_API_URL, GetAllMods);
    const { allMods } = processAllMods(allModData);

    const relevantModIds = new Set<string>();

    function collectRelevantModIds(slots: Gun["slots"] | Mod["slots"]) {
      for (const slot of slots) {
        for (const modId of slot.allowedModIds) {
          if (relevantModIds.has(modId)) continue;
          relevantModIds.add(modId);
          const mod = allMods[modId];
          if (mod && mod.slots.length > 0) {
            collectRelevantModIds(mod.slots);
          }
        }
      }
    }

    collectRelevantModIds(gun.slots);

    const relevantMods: Record<string, Mod> = {};
    relevantModIds.forEach((modId) => {
      if (allMods[modId]) {
        relevantMods[modId] = allMods[modId];
      }
    });

    return { relevantMods, gun };
  });
