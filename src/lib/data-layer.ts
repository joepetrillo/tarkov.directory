import { TARKOV_API_URL } from "@/lib/constants";
import { unstable_cache } from "next/cache";
import request from "graphql-request";
import { GetAllGunsAndMods } from "@/graphql/queries";
import { processAllGunsAndMods } from "@/lib/data-mapping";
import { FullGun, FullMod, FullSlot, Slot } from "@/types";

export const getProcessedGunAndModData = unstable_cache(
  async () => {
    const data = await request(TARKOV_API_URL, GetAllGunsAndMods);
    return processAllGunsAndMods(data);
  },
  ["processedGunAndModData"],
  {
    revalidate: 3600,
  },
);

export const getFullGunData = async (id: string): Promise<FullGun | null> => {
  const { allGuns, allMods } = await getProcessedGunAndModData();

  const gun = allGuns[id];

  if (!gun) {
    console.warn(`Gun with id ${id} not found`);
    return null;
  }

  const populateSlots = (slots: Slot[], depth: number = 0): FullSlot[] => {
    if (depth >= 10) {
      console.warn(`Max depth reached. Stopping recursion.`);
      return [];
    }

    return slots.map((slot) => {
      const { allowedModIds, ...everythingExceptAllowedModIds } = slot;

      return {
        ...everythingExceptAllowedModIds,
        allowedMods: slot.allowedModIds
          .map((modId) => {
            const mod = allMods[modId];
            if (!mod) {
              console.warn(`Mod with id ${modId} not found`);
              return null;
            }
            return {
              ...mod,
              slots: populateSlots(mod.slots, depth + 1),
            };
          })
          .filter((mod): mod is FullMod => mod !== null),
      };
    });
  };

  const fullGun: FullGun = {
    ...gun,
    slots: populateSlots(gun.slots),
  };

  return fullGun;
};
