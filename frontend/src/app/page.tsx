import GunList from "@/components/gun-list";
import { getCategorizedGunList } from "@/data/guns";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

export const metadata: Metadata = {
  title: "Tarkov Gun Directory",
  description:
    "Browse Escape from Tarkov guns by category and open detailed modding views.",
};

export default async function Page() {
  "use cache";
  cacheLife("tarkovHourly");
  cacheTag("tarkov:guns");

  const { categorizedGunList } = await getCategorizedGunList();

  return <GunList categorizedGunList={categorizedGunList} />;
}
