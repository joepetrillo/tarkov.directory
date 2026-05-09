import "server-only";
import { api } from "@/lib/api-client";
import { CategorizedGunListData } from "@/types";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

export async function getCategorizedGunList() {
  const response = await api.guns.get();

  if (response.error) {
    throw new Error("There was an error fetching the categorized gun list");
  }

  const { allGuns, gunsByCategory } = response.data;

  const categorizedGunList: CategorizedGunListData = [];

  for (const gunIds of Object.values(gunsByCategory)) {
    const gunId = gunIds[0];
    if (!gunId) continue;

    const gun = allGuns[gunId];
    if (!gun) continue;

    const guns: CategorizedGunListData[number]["guns"] = [];
    for (const id of gunIds) {
      const currGun = allGuns[id];
      if (!currGun) continue;

      guns.push({
        id: currGun.id,
        name: currGun.name,
        shortName: currGun.shortName,
        defaultPresetImageUrl: currGun.defaultPresetImageUrl,
        caliber: currGun.caliber,
      });
    }

    guns.sort((a, b) => a.shortName.localeCompare(b.shortName));
    categorizedGunList.push({
      categoryName: gun.category.name,
      guns,
    });
  }

  return { categorizedGunList };
}

export async function getGun(gunId: string) {
  "use cache: remote";
  cacheLife("tarkovHourly");
  cacheTag("tarkov:guns", `tarkov:gun:${gunId}`);

  const response = await api.guns({ gunId }).mods.get();

  if (response.status === 404) {
    notFound();
  }

  if (response.error) {
    throw new Error("There was an error fetching the gun");
  }

  if (!response.data.gun && !response.data.relevantMods) {
    notFound();
  }

  return response.data;
}
