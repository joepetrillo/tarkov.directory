"use client";

import { signIn } from "@/app/sign-in/actions";
import Link from "@/components/ui/link";
import { Button, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useFormState, useFormStatus } from "react-dom";

function SignInForm() {
  const { pending } = useFormStatus();

  return (
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
        disabled={pending}
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
        disabled={pending}
      />
      <Button
        variant="classic"
        type="submit"
        loading={pending}
        className="w-full"
      >
        Sign In
      </Button>
    </Flex>
  );
}

export default function Page() {
  const [state, formAction] = useFormState(signIn, undefined);

  return (
    <Flex direction="column" gap="4" maxWidth={"300px"} className="mx-auto">
      <Heading size="5">Welcome Back</Heading>
      <form action={formAction} id="signin">
        <SignInForm />
      </form>
      {state?.error && <Text color="tomato">{state.error}</Text>}
      <Text>
        Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
      </Text>
    </Flex>
  );
}
