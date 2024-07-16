import ModdingControls from "@/components/modding-controls";
import { GetGunInfoQuery } from "@/gql/graphql";
import { getGunInfoQuery } from "@/graphql/queries";
import { TARKOV_API_URL } from "@/lib/constants";
import { mapToFullGunInfo } from "@/lib/data-mapping";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@radix-ui/themes";
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
      <h2 className="text-2xl font-bol3d mb-4">{toTitleCase(gun.name)}</h2>
      <Button variant="classic">Test Button</Button>
      <ModdingControls gun={gun} />
    </div>
  );
}
