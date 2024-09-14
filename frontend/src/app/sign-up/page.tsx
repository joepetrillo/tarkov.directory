import Link from "@/components/ui/link";
import { db } from "@/lib/db-client";
import { lucia } from "@/lib/lucia";
import { userTable } from "@/schema";
import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id } from "oslo/password";

export default function Page() {
  return (
    <Flex direction="column" gap="4" maxWidth={"300px"} className="mx-auto">
      <Heading size="5">Create Account</Heading>
      <form action={signUp} id="signup">
        <Flex direction="column" gap="2">
          <label htmlFor="username">
            <Text size="2" weight="bold">
              Username
            </Text>
          </label>
          <TextField.Root
            size="3"
            placeholder="Enter username"
            name="username"
            id="username"
          />
          <label htmlFor="password">
            <Text size="2" weight="bold">
              Password
            </Text>
          </label>
          <TextField.Root
            size="3"
            placeholder="Enter password"
            type="password"
            name="password"
            id="password"
          />
        </Flex>
      </form>
      <Button variant="classic" type="submit" form="signup">
        Sign Up
      </Button>
      <Text>
        Already have an account? <Link href="/sign-in">Sign In</Link>
      </Text>
    </Flex>
  );
}

interface ActionResult {
  error: string;
}

async function signUp(formData: FormData): Promise<ActionResult> {
  "use server";

  const username = formData.get("username");
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error: "Invalid username",
    };
  }

  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const argon2id = new Argon2id();
  const passwordHash = await argon2id.hash(password);
  const userId = generateIdFromEntropySize(10); // 16 characters long

  // Insert new user
  await db.insert(userTable).values({
    id: userId,
    username: username,
    passwordHash: passwordHash,
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}
