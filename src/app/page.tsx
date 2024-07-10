import Link from "next/link";
import { Suspense } from "react";
import { GunList } from "@/components/gun-list";
import Spinner from "@/components/spinner";

export default async function Home() {
  return (
    <>
      <Link href="/cool" className="mb-10 inline-block underline">
        Go to cool page
      </Link>
      <Suspense fallback={<Spinner />}>
        <GunList />
      </Suspense>
    </>
  );
}
