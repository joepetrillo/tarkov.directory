"use client";

import Link from "@/components/ui/link";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useAction } from "next-safe-action/hooks";
import { signInAction } from "@/app/(auth)/actions";

export default function Page() {
  const { execute, isPending, result } = useAction(signInAction);

  return (
    <Box maxWidth={"350px"} className="mx-auto">
      <Card size={"4"}>
        <Flex direction="column" gap="5">
          <Heading size="5">Welcome Back</Heading>
          <form action={execute} id="signin">
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <label htmlFor="username">
                  <Text size="2" weight="bold">
                    Username
                  </Text>
                </label>
                <TextField.Root
                  size="3"
                  name="username"
                  id="username"
                  disabled={isPending}
                />
                {result?.validationErrors?.username && (
                  <Text color="tomato" size={"2"} className="text-balance">
                    {result.validationErrors.username._errors?.[0] ??
                      "Invalid Username"}
                  </Text>
                )}
              </Flex>
              <Flex direction="column" gap="2">
                <label htmlFor="password">
                  <Text size="2" weight="bold">
                    Password
                  </Text>
                </label>
                <TextField.Root
                  size="3"
                  type="password"
                  name="password"
                  id="password"
                  disabled={isPending}
                />
                {result?.validationErrors?.password && (
                  <Text color="tomato" size={"2"} className="text-balance">
                    {result.validationErrors.password._errors?.[0] ??
                      "Invalid Password"}
                  </Text>
                )}
              </Flex>
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
          {result?.serverError && (
            <Text color="tomato" className="text-balance">
              {result.serverError}
            </Text>
          )}
          <Text>
            Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}
