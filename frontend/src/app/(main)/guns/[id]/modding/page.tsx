import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/components/modding/gun-modding.context";
import { getGun } from "@/data/guns";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { relevantMods, gun } = await getGun(params.id);

  return (
    <GunModdingProvider gun={gun} mods={relevantMods}>
      <GunModding />
    </GunModdingProvider>
  );
}
