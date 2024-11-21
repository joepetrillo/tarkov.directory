"use client";

import {
  sendEmailVerificationCodeAction,
  verifyEmailAction,
} from "@/app/(auth)/actions";
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
import { ChangeEvent, useState } from "react";

export default function VerifyEmail() {
  const {
    isPending: verifyPending,
    result: verifyResult,
    execute: executeVerify,
  } = useAction(verifyEmailAction);
  const {
    isPending: resendPending,
    result: resendResult,
    execute: executeResend,
    hasSucceeded: resendSucceeded,
  } = useAction(sendEmailVerificationCodeAction);
  const [code, setCode] = useState("");

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const sanitizedInput = input
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);
    setCode(sanitizedInput);
  };

  return (
    <Box maxWidth={{ xs: "400px" }} className="mx-auto">
      <Card size={"4"}>
        <Flex direction="column" gap="5">
          <Flex direction={"column"} gap={"2"}>
            <Heading size="5" className="font-mono">
              Verify Email
            </Heading>
            <Text className="text-balance">
              Please check your email for a verification code. Enter the code
              below to proceed.
            </Text>
          </Flex>
          {verifyResult?.serverError && !verifyPending && (
            <ServerError error={verifyResult.serverError} />
          )}
          <form action={executeVerify} id="verify-email">
            <Flex direction="column" gap="4">
              <Flex direction="column" gap="2">
                <label htmlFor="code">
                  <Text size="2" weight="bold">
                    Code
                  </Text>
                </label>
                <TextField.Root
                  onChange={handleCodeChange}
                  value={code}
                  size="3"
                  name="code"
                  id="code"
                  disabled={verifyPending}
                  autoFocus
                  required
                />
                {verifyResult?.validationErrors?.code && !verifyPending && (
                  <ValidationError
                    errors={verifyResult.validationErrors.code}
                  />
                )}
              </Flex>
            </Flex>
          </form>
          <Button
            variant="classic"
            type="submit"
            loading={verifyPending}
            className="w-full"
            form="verify-email"
          >
            Verify
          </Button>
          {!resendSucceeded ? (
            <Flex align={"center"} justify={"start"} wrap={"wrap"} gap={"2"}>
              <Text className="font-mono" size={"2"}>
                Need another code?
              </Text>
              <Button
                variant="soft"
                color="gray"
                size={"2"}
                onClick={() => executeResend()}
                loading={resendPending}
                className="relative"
              >
                Resend
              </Button>
            </Flex>
          ) : (
            <Callout.Root variant="soft" color="jade" size={"1"}>
              <Callout.Icon>
                <CheckCircledIcon />
              </Callout.Icon>
              <Callout.Text className="text-balance font-mono">
                Code sent! It may take a moment to arrive in your inbox.
              </Callout.Text>
            </Callout.Root>
          )}
          {resendResult?.serverError && !resendPending && (
            <ServerError error={resendResult.serverError} />
          )}
        </Flex>
      </Card>
    </Box>
  );
}
