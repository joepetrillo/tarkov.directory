import React from "react";
import { request } from "graphql-request";
import { TARKOV_API_URL } from "@/lib/constants";
import { getAllGunsQuery } from "@/graphql/queries";
import { mapAllGunsToCategories } from "@/lib/data-mapping";
import GunList from "@/components/gun-list";

export default async function Page() {
  const data = await request(TARKOV_API_URL, getAllGunsQuery);
  const categorizedData = mapAllGunsToCategories(data);

  return <GunList categorizedGuns={categorizedData} />;
}
