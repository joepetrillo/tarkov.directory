"use client";

import { signOutAction } from "@/app/(auth)/actions";
import { User } from "@/schema";
import { Flex, Text, Button } from "@radix-ui/themes";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function HeaderAuthClient({ user }: { user: User }) {
  const {
    executeAsync,
    isPending: isActionPending,
    hasErrored,
    result,
  } = useAction(signOutAction);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (hasErrored && result.serverError === "Session not found") {
    router.refresh();
    return null;
  }

  return (
    <Flex align={"center"} gap={"2"}>
      <Text>{user.username}</Text>
      <Button
        onClick={async () => {
          await executeAsync();
          startTransition(() => {
            router.refresh();
          });
        }}
        variant="soft"
        className="whitespace-nowrap"
        type="submit"
        loading={isActionPending || isPending}
      >
        Sign Out
      </Button>
    </Flex>
  );
}
