import HeaderAuthClient from "@/components/header/header-auth.client";
import { validateRequest } from "@/data/auth";
import { Button } from "@radix-ui/themes";
import Link from "next/link";

export default async function HeaderAuthAsync() {
  const { session, user } = await validateRequest();

  if (!session) {
    return (
      <Button variant="soft" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  }

  return <HeaderAuthClient user={user} />;
}
