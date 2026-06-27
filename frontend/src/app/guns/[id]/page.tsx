export const unstable_dynamicStaleTime = 300;

import { Suspense } from "react";
import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import Spinner from "@/components/ui/spinner";
import { getGun } from "@/data/guns";
import { toTitleCase } from "@/lib/utils";
import { Heading } from "@radix-ui/themes";

type GunPageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: GunPageProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <GunPageContent params={params} />
    </Suspense>
  );
}

async function GunPageContent({ params }: GunPageProps) {
  const { id } = await params;

  const { relevantMods, gun } = await getGun(id);

  return (
    <>
      <Heading as="h3" size="5" mb="4" className="text-balance">
        {toTitleCase(gun.name)}
      </Heading>
      <GunModdingProvider key={gun.id} gun={gun} mods={relevantMods}>
        <GunModding />
      </GunModdingProvider>
    </>
  );
}
