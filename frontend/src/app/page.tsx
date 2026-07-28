import GunList from "@/components/gun-list";
import { getCategorizedGunList } from "@/data/guns";
import { cacheLife, cacheTag } from "next/cache";

export default async function Page() {
  // One shared result for all users — default "use cache" (static-shell friendly) is enough.
  "use cache";
  cacheLife("tarkovHourly");
  cacheTag("tarkov:guns");

  const { categorizedGunList } = await getCategorizedGunList();

  return <GunList categorizedGunList={categorizedGunList} />;
}
