// app/guns/[id]/page.tsx

import { notFound } from "next/navigation";
import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import { getProcessedGunData, getProcessedModData } from "@/lib/data-layer";

export default async function Page({ params }: { params: { id: string } }) {
  const { allGuns } = await getProcessedGunData();
  const { allMods } = await getProcessedModData();
  const gun = allGuns[params.id];

  if (!gun) {
    notFound();
  }

  return (
    <GunModdingProvider gun={gun} mods={allMods}>
      <GunModding />
    </GunModdingProvider>
  );
}
