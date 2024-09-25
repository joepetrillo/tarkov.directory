"use client";

import { signUpAction } from "@/app/(auth)/actions";
import Link from "@/components/ui/link";
import { env } from "@/env";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";

export default function Page() {
  const { isPending, result, executeAsync } = useAction(signUpAction);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [turnstileStatus, setTurnstileStatus] = useState<
    "success" | "error" | "expired" | "required"
  >("required");

  return (
    <Box maxWidth={{ xs: "400px" }} className="mx-auto">
      <Card size={"4"} className="contain-none">
        <Flex direction="column" gap="5">
          <Heading size="5" className="font-mono">
            Create Account
          </Heading>
          <form
            action={async (formData) => {
              if (turnstileStatus !== "success") return;
              await executeAsync(formData);
              turnstileRef.current?.reset();
              setTurnstileStatus("required");
            }}
            id="signup"
          >
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <label htmlFor="email">
                  <Text size="2" weight="bold">
                    Email Address
                  </Text>
                </label>
                <TextField.Root
                  size="3"
                  name="email"
                  id="email"
                  disabled={isPending}
                  autoFocus
                  required
                />
                {result?.validationErrors?.email && !isPending && (
                  <Text color="tomato" size={"2"} className="text-balance">
                    {result.validationErrors.email._errors?.[0] ??
                      "Invalid Email"}
                  </Text>
                )}
              </Flex>
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
                  required
                />
                {result?.validationErrors?.username && !isPending && (
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
                  required
                />
                {result?.validationErrors?.password && !isPending && (
                  <Text color="tomato" size={"2"} className="text-balance">
                    {result.validationErrors.password._errors?.[0] ??
                      "Invalid Password"}
                  </Text>
                )}
              </Flex>
              <Flex direction="column" gap="2">
                <label htmlFor="confirmPassword">
                  <Text size="2" weight="bold">
                    Confirm Password
                  </Text>
                </label>
                <TextField.Root
                  size="3"
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  disabled={isPending}
                  required
                />
                {result?.validationErrors?.confirmPassword && !isPending && (
                  <Text color="tomato" size={"2"} className="text-balance">
                    {result.validationErrors.confirmPassword._errors?.[0] ??
                      "Invalid Password"}
                  </Text>
                )}
              </Flex>
              <Turnstile
                ref={turnstileRef}
                siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                options={{
                  action: "signup",
                  theme: "dark",
                  size: "flexible",
                }}
                onError={() => {
                  setTurnstileStatus("error");
                }}
                onExpire={() => {
                  setTurnstileStatus("expired");
                  turnstileRef.current?.reset();
                }}
                onSuccess={() => {
                  setTurnstileStatus("success");
                }}
                className="mt-2"
              />
            </Flex>
          </form>
          {result?.serverError && !isPending && (
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
            disabled={isPending || turnstileStatus !== "success"}
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
