import "server-only";

import { CategorizedGunListData } from "@/types";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";

export async function getCategorizedGunList() {
  const response = await api.guns.index.get();

  if (response.error) {
    throw new Error("There was an error fetching the categorized gun list");
  }

  const { allGuns, gunsByCategory } = response.data;

  const categorizedGunList: CategorizedGunListData = Object.entries(
    gunsByCategory,
  )
    .map(([_, gunIds]) => {
      if (!gunIds[0]) return null;
      const gunId = gunIds[0];
      if (!allGuns[gunId]) return null;
      const gun = allGuns[gunId];

      return {
        categoryName: gun.category.name,
        guns: gunIds
          .map((id) => {
            const currGun = allGuns[id];
            if (!currGun) return null;
            return {
              id: currGun.id,
              name: currGun.name,
              shortName: currGun.shortName,
              defaultPresetImageUrl: currGun.defaultPresetImageUrl,
              caliber: currGun.caliber,
            };
          })
          .filter((gun) => gun !== null)
          .sort((a, b) => a.shortName.localeCompare(b.shortName)),
      };
    })
    .filter((category) => category !== null);

  return { categorizedGunList };
}

export async function getGun(gunId: string) {
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
