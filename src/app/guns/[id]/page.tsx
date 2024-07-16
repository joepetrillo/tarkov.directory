import ModdingControls from "@/components/modding-controls";
import { getGunInfoQuery } from "@/graphql/queries";
import { TARKOV_API_URL } from "@/lib/constants";
import { mapToFullGunInfo } from "@/lib/data-mapping";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@radix-ui/themes";
import request from "graphql-request";

export const revalidate = 3600; // revalidate the data at most every hour

export default async function Page({ params }: { params: { id: string } }) {
  const data = await request(TARKOV_API_URL, getGunInfoQuery, {
    id: params.id,
  });
  const gun = mapToFullGunInfo(data);

  return (
    <div>
      <h2 className="text-2xl mb-4 font-bold">{toTitleCase(gun.name)}</h2>
      <Button variant="classic">Test Button</Button>
      <ModdingControls gun={gun} />
    </div>
  );
}
