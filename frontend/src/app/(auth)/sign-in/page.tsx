"use client";

import Link from "@/components/ui/link";
import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useAction } from "next-safe-action/hooks";
import { signInAction } from "@/app/(auth)/actions";

export default function Page() {
  const { execute, isPending, result } = useAction(signInAction);

  return (
    <Flex direction="column" gap="4" maxWidth={"300px"} className="mx-auto">
      <Heading size="5">Welcome Back</Heading>
      <form action={execute} id="signin">
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
      <Button
        variant="classic"
        type="submit"
        loading={isPending}
        className="w-full"
        form="signin"
      >
        Sign In
      </Button>
      {result?.serverError && <Text color="tomato">{result.serverError}</Text>}
      <Text>
        Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
      </Text>
    </Flex>
  );
}
