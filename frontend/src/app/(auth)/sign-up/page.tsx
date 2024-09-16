"use client";

import { signUpAction } from "@/app/(auth)/actions";
import Link from "@/components/ui/link";
import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useAction } from "next-safe-action/hooks";

export default function Page() {
  const { execute, isPending, result } = useAction(signUpAction);

  return (
    <Flex direction="column" gap="4" maxWidth={"300px"} className="mx-auto">
      <Heading size="5">Create Account</Heading>
      <form action={execute} id="signup">
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
            disabled={isPending}
          />
          {result?.validationErrors?.username && (
            <Text color="tomato" size={"2"}>
              {result.validationErrors.username._errors?.[0] ??
                "Invalid Username"}
            </Text>
          )}
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
            disabled={isPending}
          />
          {result?.validationErrors?.password && (
            <Text color="tomato" size={"2"}>
              {result.validationErrors.password._errors?.[0] ??
                "Invalid Password"}
            </Text>
          )}
        </Flex>
      </form>
      <Button variant="classic" type="submit" form="signup" loading={isPending}>
        Sign Up
      </Button>
      {result?.serverError && <Text color="tomato">{result.serverError}</Text>}
      <Text>
        Already have an account? <Link href="/sign-in">Sign In</Link>
      </Text>
    </Flex>
  );
}
