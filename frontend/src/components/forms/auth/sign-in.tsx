"use client";

import { signInAction } from "@/app/(auth)/actions";
import ServerError from "@/components/forms/server-error";
import ValidationError from "@/components/forms/validation-error";
import Link from "@/components/ui/link";
import PasswordInput from "@/components/ui/password-input";
import { env } from "@/env";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import {
  Box,
  Card,
  Flex,
  TextField,
  Text,
  Heading,
  Button,
} from "@radix-ui/themes";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";

export default function SignIn() {
  const { isPending, result, executeAsync } = useAction(signInAction);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [turnstileStatus, setTurnstileStatus] = useState<
    "success" | "error" | "expired" | "required"
  >("required");

  return (
    <Box maxWidth={{ xs: "400px" }} className="mx-auto">
      <Card size={"4"} className="contain-none">
        <Flex direction="column" gap="5">
          <Heading size="5" className="font-mono">
            Welcome Back
          </Heading>
          {result?.serverError && !isPending && (
            <ServerError error={result.serverError} />
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (turnstileStatus !== "success") return;
              await executeAsync(new FormData(e.currentTarget));
              turnstileRef.current?.reset();
              setTurnstileStatus("required");
            }}
            id="signin"
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
                  <ValidationError errors={result.validationErrors.email} />
                )}
              </Flex>
              <Flex direction="column" gap="2">
                <label htmlFor="password">
                  <Text size="2" weight="bold">
                    Password
                  </Text>
                </label>
                <PasswordInput
                  disabled={isPending}
                  required
                  name="password"
                  id="password"
                />
                {result?.validationErrors?.password && !isPending && (
                  <ValidationError errors={result.validationErrors.password} />
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
          <Button
            variant="classic"
            type="submit"
            loading={isPending}
            className="w-full"
            form="signin"
            disabled={isPending || turnstileStatus !== "success"}
          >
            Sign In
          </Button>
          <Text className="font-mono" size={"2"}>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" replace={true}>
              Sign Up
            </Link>
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}
