import { TARKOV_API_URL } from "@/lib/constants";
import { unstable_cache } from "next/cache";
import request from "graphql-request";
import { processAllGuns, processAllMods } from "@/lib/data-mapping";
import { GetAllGuns, GetAllMods } from "@/graphql/queries";
import { Gun, Mod } from "@/types";

export const getProcessedGunData = unstable_cache(
  async () => {
    console.warn(
      "unstable_cache MISS for gun data: attempting to make request and cache for 24 hours",
    );
    const gunData = await request(TARKOV_API_URL, GetAllGuns);
    return processAllGuns(gunData);
  },
  ["processedGunData"],
  {
    revalidate: 86400,
  },
);

// export const getProcessedModData = unstable_cache(
//   async () => {
//     console.warn(
//       "unstable_cache MISS for mod data: attempting to make request and cache for 24 hours",
//     );
//     const modData = await request(TARKOV_API_URL, GetAllMods);
//     return processAllMods(modData);
//   },
//   ["processedModData"],
//   {
//     revalidate: 86400,
//   },
// );

export const getProcessedModDataForGun = unstable_cache(
  async (gunId: string, gun: Gun) => {
    console.warn(
      `unstable_cache MISS for mod data for gun ${gunId}: attempting to make request and cache for 24 hours`,
    );
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

    return relevantMods;
  },
  [`processedModDataForGun`],
  {
    revalidate: 86400,
  },
);
