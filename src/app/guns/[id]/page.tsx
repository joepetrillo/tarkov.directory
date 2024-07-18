import ModdingControls from "@/components/modding-controls";
import Link from "@/components/ui/link";
import { getGunInfoQuery } from "@/graphql/queries";
import { TARKOV_API_URL } from "@/lib/constants";
import { mapToFullGunInfo } from "@/lib/data-mapping";
import { toTitleCase } from "@/lib/utils";
import request from "graphql-request";
import { unstable_cache } from "next/cache";

const getGunInfo = unstable_cache(
  async (id: string) => {
    const data = await request(TARKOV_API_URL, getGunInfoQuery, {
      id,
    });
    return mapToFullGunInfo(data);
  },
  ["gunInfo"],
  {
    revalidate: 3600,
  },
);

export default async function Page({ params }: { params: { id: string } }) {
  const gun = await getGunInfo(params.id);

  return (
    <div>
      <Link href="/guns" className="mb-4">
        Go Back
      </Link>
      <h2 className="text-2xl mb-4 font-bold">{toTitleCase(gun.name)}</h2>
      <ModdingControls gun={gun} />
    </div>
  );
}
