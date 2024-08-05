"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { TabNav } from "@radix-ui/themes";

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav>
      <TabNav.Root size={"2"} className="font-bold">
        <TabNav.Link active={pathname === "/"} asChild>
          <Link href="/">Home</Link>
        </TabNav.Link>
        <TabNav.Link active={pathname === "/guns"} asChild>
          <Link href="/guns">Guns</Link>
        </TabNav.Link>
        <TabNav.Link active={pathname === "/presets"} asChild>
          <Link href="/presets">Presets</Link>
        </TabNav.Link>
      </TabNav.Root>
    </nav>
  );
}
