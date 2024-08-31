import React from "react";
import GunList from "@/components/gun-list";
import { getProcessedGunData } from "@/lib/data-layer";

export default async function Page() {
  const { gunsByCategory, allGuns } = await getProcessedGunData();
  const categorizedGunList = Object.entries(gunsByCategory)
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
