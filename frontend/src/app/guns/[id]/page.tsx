import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import { getGun } from "@/data/guns";
import { toTitleCase } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";
import { cacheLife, cacheTag } from "next/cache";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  "use cache";
  cacheLife("tarkovHourly");

  const { id } = await params;

  cacheTag("tarkov:guns", `tarkov:gun:${id}`);

  const { relevantMods, gun } = await getGun(id);

  return (
    <>
      <Heading as="h3" size="5" mb="4" className="text-balance">
        {toTitleCase(gun.name)}
      </Heading>
      <GunModdingProvider gun={gun} mods={relevantMods}>
        <GunModding />
      </GunModdingProvider>
    </>
  );
}
