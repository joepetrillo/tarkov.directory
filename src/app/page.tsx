import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense } from "react";
import { getQueryClient } from "@/utils/get-query-client";
import { getAllGuns } from "@/utils/query-options";
import { GunList } from "@/components/gun-list";

export const revalidate = 3600; // revalidate at most every hour

export default function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(getAllGuns);

  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <GunList />
        </HydrationBoundary>
      </Suspense>
      <Link href="/cool">Go to cool page</Link>
    </>
  );
}
