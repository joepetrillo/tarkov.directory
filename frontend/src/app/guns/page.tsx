import React from "react";
import GunList from "@/components/gun-list";
import { api } from "@/lib/api-client";
import { CategorizedGunListData } from "@/types";

export default async function Page() {
  const response = await api.guns.index.get();

  if (!response.data) {
    return <div>Error loading guns</div>;
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

  return <GunList categorizedGunList={categorizedGunList} />;
}

export const revalidate = 86400;
