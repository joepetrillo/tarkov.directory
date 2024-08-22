// app/guns/[id]/page.tsx

import { notFound } from "next/navigation";
import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import { getProcessedGunAndModData } from "@/lib/data-layer";
import { Gun, Mod } from "@/types";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function Page({ params }: { params: { id: string } }) {
  // const { allGuns, allMods } = await getProcessedGunAndModData();

  const allGuns = (await redis.get<Record<string, Gun>>("allGuns")) ?? {};
  const allMods = (await redis.get<Record<string, Mod>>("allMods")) ?? {};

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
