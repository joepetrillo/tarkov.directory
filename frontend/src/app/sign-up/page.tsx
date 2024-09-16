"use client";

import { signUp } from "@/app/sign-up/actions";
import Link from "@/components/ui/link";
import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";

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
