import Link from "@/components/ui/link";
import ModdingControls from "@/components/modding-controls";
import { toTitleCase } from "@/lib/utils";

// This page will probably be dynamic in the future and will need to fetch user specific data.
export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/guns">Go Back</Link>
      <Link href={`/guns/${params.id}/modding`}>Start Modding</Link>
      {/* <h2 className="text-2xl mb-4 font-bold">{toTitleCase(gun.name)}</h2> */}
      {/* <ModdingControls gun={gun} /> */}
    </div>
  );
}
