import React from "react";
import GunList from "@/components/gun-list";
import { getProcessedGunAndModData } from "@/lib/data-layer";

export default async function Page() {
  const { gunsByCategory, allGuns } = await getProcessedGunAndModData();
  const categorizedGunList = Object.entries(gunsByCategory).map(
    ([_, gunIds]) => {
      return {
        categoryName: allGuns[gunIds[0]].category.name,
        guns: gunIds
          .map((id) => {
            const currGun = allGuns[id];
            return {
              id: currGun.id,
              name: currGun.name,
              shortName: currGun.shortName,
              defaultPresetImageUrl: currGun.defaultPresetImageUrl,
              caliber: currGun.caliber,
            };
          })
          .sort((a, b) => a.shortName.localeCompare(b.shortName)),
      };
    },
  );

  return <GunList categorizedGunList={categorizedGunList} />;
}
