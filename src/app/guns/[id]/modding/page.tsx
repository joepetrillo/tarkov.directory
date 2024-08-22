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

  const allGuns = JSON.parse(
    (await redis.get<string>("allGuns")) ?? "{}",
  ) as Record<string, Gun>;
  const allMods = JSON.parse(
    (await redis.get<string>("allMods")) ?? "{}",
  ) as Record<string, Mod>;

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
