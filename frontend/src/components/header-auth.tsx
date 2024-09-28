import { signOutAction } from "@/app/(auth)/actions";
import { validateRequest } from "@/data/auth";
import { Button, Flex, Text } from "@radix-ui/themes";
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

  return (
    <Flex align={"center"} gap={"2"}>
      <Text>{user.username}</Text>
      <form
        action={async () => {
          "use server";
          await signOutAction();
        }}
      >
        <Button variant="soft" className="whitespace-nowrap" type="submit">
          Sign Out
        </Button>
      </form>
    </Flex>
  );
}
