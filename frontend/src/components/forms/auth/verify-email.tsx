"use client";

import { verifyEmailAction } from "@/app/(auth)/actions";
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
import { ChangeEvent, useState } from "react";

export default function VerifyEmail() {
  const { isPending, result, execute } = useAction(verifyEmailAction);
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
                  onChange={handleCodeChange}
                  value={code}
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
            <Button variant="ghost" ml={"2"} size={"3"}>
              Resend
            </Button>
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}
