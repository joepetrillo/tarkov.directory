"use client";

import { verifyEmailAction } from "@/app/(auth)/actions";
import VerificationCodeEmail from "@/app/(auth)/verify-email/email";
import ServerError from "@/components/forms/server-error";
import ValidationError from "@/components/forms/validation-error";
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

export default function VerifyEmailForm() {
  const { isPending, result, execute } = useAction(verifyEmailAction);

  return (
    <Box maxWidth={{ xs: "400px" }} className="mx-auto">
      <Card size={"4"}>
        <Flex direction="column" gap="5">
          <Flex direction={"column"} gap={"2"}>
            <Heading size="5" className="font-mono">
              Verify Email
            </Heading>
            <Text className="block max-w-[400px] text-balance">
              Please check your email for a verification code. Enter the code
              below to proceed.
            </Text>
          </Flex>
          {result?.serverError && !isPending && (
            <ServerError error={result.serverError} />
          )}
          <form action={execute} id="verify-email">
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <label htmlFor="code">
                  <Text size="2" weight="bold">
                    Code
                  </Text>
                </label>
                <TextField.Root
                  size="3"
                  name="code"
                  id="code"
                  disabled={isPending}
                  autoFocus
                  required
                />
                {result?.validationErrors?.code && !isPending && (
                  <ValidationError errors={result.validationErrors.code} />
                )}
              </Flex>
            </Flex>
          </form>
          <Button
            variant="classic"
            type="submit"
            loading={isPending}
            className="w-full"
            form="verify-email"
          >
            Verify
          </Button>
          <Text className="font-mono" size={"2"}>
            {/* TODO RESEND - loading state and timer countdown when appropriate */}
            Need another code?{" "}
            <Button variant="ghost" ml={"1"}>
              Resend
            </Button>
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}
