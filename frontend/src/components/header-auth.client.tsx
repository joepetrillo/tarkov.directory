"use client";

import { signOutAction } from "@/app/(auth)/actions";
import { Flex, Text, Button } from "@radix-ui/themes";
import { User } from "lucia";
import { useAction } from "next-safe-action/hooks";

export default function SignOutButton({ user }: { user: User }) {
  const { isPending, execute } = useAction(signOutAction);

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
