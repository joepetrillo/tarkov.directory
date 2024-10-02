import SignOutButton from "@/components/header-auth.client";
import { validateRequest } from "@/data/auth";
import { sleep } from "@/lib/utils";
import { Button } from "@radix-ui/themes";
import Link from "next/link";

export default async function HeaderAuth() {
  const { session, user } = await validateRequest();

  if (!session) {
    return (
      <Button variant="soft" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  }

  return <SignOutButton user={user} />;
}
