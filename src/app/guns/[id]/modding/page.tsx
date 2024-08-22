// app/guns/[id]/page.tsx

import { notFound } from "next/navigation";
import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import { Gun, Mod } from "@/types";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const MAX_CHUNK_SIZE = 900 * 1024; // 900KB

async function getModsInChunks(): Promise<Record<string, Mod>> {
  const allMods: Record<string, Mod> = {};
  let offset = 0;
  let chunk: string | null;

  do {
    chunk = await redis.getrange(
      "allMods",
      offset,
      offset + MAX_CHUNK_SIZE - 1,
    );
    if (chunk) {
      const chunkMods = JSON.parse(chunk) as Record<string, Mod>;
      Object.assign(allMods, chunkMods);
      offset += chunk.length;
    }
  } while (chunk && chunk.length === MAX_CHUNK_SIZE);

  return allMods;
}

export default async function Page({ params }: { params: { id: string } }) {
  const allGuns = (await redis.get<Record<string, Gun>>("allGuns")) ?? {};
  const allMods = await getModsInChunks();

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
