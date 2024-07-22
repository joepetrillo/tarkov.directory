import React from "react";
import { request } from "graphql-request";
import { TARKOV_API_URL } from "@/lib/constants";
import { getAllGunsQuery } from "@/graphql/queries";
import { mapAllGunsToCategories } from "@/lib/data-mapping";
import GunList from "@/components/gun-list";
import { unstable_cache } from "next/cache";

const getGunList = unstable_cache(
  async () => {
    const data = await request(TARKOV_API_URL, getAllGunsQuery);
    return mapAllGunsToCategories(data);
  },
  ["gunList"],
  {
    revalidate: 3600,
  },
);

export default async function Page() {
  const categorizedData = await getGunList();

  return <GunList categorizedGuns={categorizedData} />;
}
