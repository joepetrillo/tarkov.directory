// app/guns/[id]/page.tsx

import { notFound } from "next/navigation";
import GunModding from "@/components/modding/gun-modding";
import { GunModdingProvider } from "@/contexts/gun-modding.context";
import { api } from "@/lib/api-client";

export default async function Page({ params }: { params: { id: string } }) {
  const response = await api.guns({ gunId: params.id }).mods.get();

  if (!response.data) {
    return <div>Error loading guns</div>;
  }

  const { relevantMods, gun } = response.data;

  if (!gun) {
    notFound();
  }

  return (
    <GunModdingProvider gun={gun} mods={relevantMods}>
      <GunModding />
    </GunModdingProvider>
  );
}

export const revalidate = 86400;
