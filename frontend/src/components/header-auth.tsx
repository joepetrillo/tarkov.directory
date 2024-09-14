import { validateRequest } from "@/data/auth";
import { lucia } from "@/lib/lucia";
import { Button, Flex, Text } from "@radix-ui/themes";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HeaderAuth() {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <Button variant="soft" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  }

  return (
    <Flex align={"center"} gap={"2"}>
      <Text>{user.username}</Text>
      <form action={signOut}>
        <Button variant="soft" className="whitespace-nowrap" type="submit">
          Sign Out
        </Button>
      </form>
    </Flex>
  );
}

interface ActionResult {
  error: string;
}

async function signOut(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "No session found",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return {
    error: "",
  };
}
