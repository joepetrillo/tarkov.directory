import GunList from "@/components/gun-list";
import Spinner from "@/components/ui/spinner";
import { getCategorizedGunList } from "@/data/guns";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";

async function CachedHomePage() {
  "use cache";
  cacheLife("tarkovHourly");
  cacheTag("tarkov:guns");

  const { categorizedGunList } = await getCategorizedGunList();

  return <GunList categorizedGunList={categorizedGunList} />;
}

async function RuntimeHomePage() {
  await connection();

  return <CachedHomePage />;
}

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <RuntimeHomePage />
    </Suspense>
  );
}
