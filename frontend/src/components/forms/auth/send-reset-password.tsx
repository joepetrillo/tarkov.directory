"use client";

import ServerError from "@/components/forms/server-error";
import ValidationError from "@/components/forms/validation-error";
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useAction } from "next-safe-action/hooks";
import { sendResetPasswordAction } from "@/app/(auth)/actions";

export default function SendResetPassword() {
  const { isPending, result, execute, hasSucceeded } = useAction(
    sendResetPasswordAction,
  );

  return (
    <Box maxWidth={{ xs: "400px" }} className="mx-auto">
      <Card size={"4"}>
        <Flex direction="column" gap="5">
          <Flex direction={"column"} gap={"2"}>
            <Heading size="5" className="font-mono">
              Reset Password
            </Heading>
            <Text className="text-balance">
              Please enter the email address associated with your account.
            </Text>
          </Flex>
          {result?.serverError && !isPending && (
            <ServerError error={result.serverError} />
          )}
          <form action={execute} id="reset-password">
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
            </Flex>
          </form>
          <Button
            variant="classic"
            type="submit"
            loading={isPending}
            className="w-full"
            form="reset-password"
          >
            Send Link
          </Button>
          {hasSucceeded && (
            <Callout.Root variant="soft" color="jade" size={"1"}>
              <Callout.Icon>
                <CheckCircledIcon />
              </Callout.Icon>
              <Callout.Text className="text-balance font-mono">
                Sent! It may take a moment to arrive in your inbox.
              </Callout.Text>
            </Callout.Root>
          )}
        </Flex>
      </Card>
    </Box>
  );
}
