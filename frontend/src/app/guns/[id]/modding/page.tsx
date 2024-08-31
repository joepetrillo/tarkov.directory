// app/guns/[id]/page.tsx

import { notFound } from "next/navigation";
import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import {
  getProcessedGunData,
  getProcessedModDataForGun,
} from "@/lib/data-layer";

export default async function Page({ params }: { params: { id: string } }) {
  const { allGuns } = await getProcessedGunData();
  const gun = allGuns[params.id];

  if (!gun) {
    notFound();
  }

  const relevantMods = await getProcessedModDataForGun(params.id, gun);

  return (
    <GunModdingProvider gun={gun} mods={relevantMods}>
      <GunModding />
    </GunModdingProvider>
  );
}
