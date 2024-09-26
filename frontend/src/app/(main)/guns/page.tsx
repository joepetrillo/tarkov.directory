import React from "react";
import GunList from "@/components/gun-list";
import { getCategorizedGunList } from "@/data/guns";

export default async function Page() {
  const { categorizedGunList } = await getCategorizedGunList();

  return <GunList categorizedGunList={categorizedGunList} />;
}

export const revalidate = 86400;
