import { TARKOV_API_URL } from "@/lib/constants";
import { unstable_cache } from "next/cache";
import request from "graphql-request";
import { processAllGuns, processAllMods } from "@/lib/data-mapping";
import { GetAllGuns, GetAllMods } from "@/graphql/queries";

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

export const getProcessedModData = unstable_cache(
  async () => {
    console.warn(
      "unstable_cache MISS for mod data: attempting to make request and cache for 24 hours",
    );
    const modData = await request(TARKOV_API_URL, GetAllMods);
    return processAllMods(modData);
  },
  ["processedModData"],
  {
    revalidate: 86400,
  },
);
