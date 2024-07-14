import ModdingControls from "@/components/modding-controls";
import { getGunInfoQuery } from "@/graphql/queries";
import { TARKOV_API_URL } from "@/lib/constants";
import { mapToFullGunInfo } from "@/lib/data-mapping";
import { toTitleCase } from "@/lib/utils";
import request from "graphql-request";

export default async function Page({ params }: { params: { id: string } }) {
  const data = await request(TARKOV_API_URL, getGunInfoQuery, {
    id: params.id,
  });
  const gun = mapToFullGunInfo(data);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">{toTitleCase(gun.name)}</h2>
      <ModdingControls gun={gun} />
    </div>
  );
}
