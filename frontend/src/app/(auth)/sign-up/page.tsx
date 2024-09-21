"use client";

import { signUpAction } from "@/app/(auth)/actions";
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

export default function Page() {
  const { execute, isPending, result } = useAction(signUpAction);

  return (
    <Box maxWidth={{ xs: "400px" }} className="mx-auto">
      <Card size={"4"}>
        <Flex direction="column" gap="5">
          <Heading size="5" className="font-mono">
            Create Account
          </Heading>
          <form action={execute} id="signup">
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
                  autoFocus
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
          {result?.serverError && (
            <Text color="tomato" className="text-balance">
              {result.serverError}
            </Text>
          )}
          <Button
            variant="classic"
            type="submit"
            loading={isPending}
            className="w-full"
            form="signup"
          >
            Sign Up
          </Button>
          <Text className="font-mono" size={"2"}>
            Already have an account? <Link href="/sign-in">Sign In</Link>
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}
