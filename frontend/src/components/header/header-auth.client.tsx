"use client";

import { signOutAction } from "@/app/(auth)/actions";
import { User } from "@/schema";
import { Flex, Text, Button } from "@radix-ui/themes";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";

export default function HeaderAuthClient({ user }: { user: User }) {
  const { isPending, execute, hasErrored, result } = useAction(signOutAction);
  const router = useRouter();

  if (hasErrored && result.serverError === "Session not found") {
    return router.refresh();
  }

  return (
    <Flex align={"center"} gap={"2"}>
      <Text>{user.username}</Text>
      <form action={() => execute()}>
        <Button
          variant="soft"
          className="whitespace-nowrap"
          type="submit"
          loading={isPending}
        >
          Sign Out
        </Button>
      </form>
    </Flex>
  );
}
