import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import { getGun } from "@/data/guns";
import { toTitleCase } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
