import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/components/modding/gun-modding.context";
import { getGun } from "@/data/guns";

export default async function Page({ params }: { params: { id: string } }) {
  const { relevantMods, gun } = await getGun(params.id);

  return (
    <GunModdingProvider gun={gun} mods={relevantMods}>
      <GunModding />
    </GunModdingProvider>
  );
}

export const revalidate = 86400;
