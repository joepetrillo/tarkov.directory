// app/guns/[id]/page.tsx
import { getFullGunData } from "@/lib/data-layer";
import { notFound } from "next/navigation";
import GunModding from "@/components/modding/gun-modding";

export default async function Page({ params }: { params: { id: string } }) {
  const fullGunData = await getFullGunData(params.id);

  if (!fullGunData) {
    notFound();
  }

  return <GunModding gun={fullGunData} />;
}
