// app/guns/[id]/page.tsx

import { notFound } from "next/navigation";
import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import { getProcessedGunAndModData } from "@/lib/data-layer";

export default async function Page({ params }: { params: { id: string } }) {
  const { allGuns, allMods } = await getProcessedGunAndModData();
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
