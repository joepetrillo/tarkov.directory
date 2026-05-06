import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import Spinner from "@/components/ui/spinner";
import { getGun } from "@/data/guns";
import { toTitleCase } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";

async function CachedGunPage({ id }: { id: string }) {
  "use cache";
  cacheLife("tarkovHourly");
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

async function RuntimeGunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connection();

  return <CachedGunPage id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<Spinner />}>
      <RuntimeGunPage params={params} />
    </Suspense>
  );
}
