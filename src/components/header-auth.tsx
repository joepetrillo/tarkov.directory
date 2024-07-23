"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@radix-ui/themes";
import Link from "next/link";

export default function HeaderAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <Button variant="classic" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  }

  return (
    <div className="h-11 w-11">
      <UserButton
        appearance={{
          elements: {
            avatarBox: { height: "44px", width: "44px" },
          },
        }}
      />
    </div>
  );
}
