import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import { getGun } from "@/data/guns";
import { toTitleCase } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";
import type { Metadata } from "next";

type GunPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: GunPageProps): Promise<Metadata> {
  const { id } = await params;
  const { gun } = await getGun(id);
  const gunName = toTitleCase(gun.name);

  return {
    title: `${gunName} Mods | Tarkov Directory`,
    description: `Compare compatible mods, stats, trader prices, and flea prices for the ${gunName}.`,
  };
}

export default async function Page({ params }: GunPageProps) {
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
