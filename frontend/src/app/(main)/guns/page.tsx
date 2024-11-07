import React from "react";
import GunList from "@/components/modding/gun-list";
import { getCategorizedGunList } from "@/data/guns";

export default async function Page() {
  const { categorizedGunList } = await getCategorizedGunList();

  return <GunList categorizedGunList={categorizedGunList} />;
}
