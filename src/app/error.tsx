"use client";

import Link from "next/link";

export default function Error() {
  return (
    <div>
      <p>An error has occurred.</p>
      <Link href="/guns" className="inline-block py-4 underline">
        Go home
      </Link>
    </div>
  );
}
