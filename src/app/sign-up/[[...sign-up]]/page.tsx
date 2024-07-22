"use client";

import Spinner from "@/components/ui/spinner";
import { SignUp, useAuth } from "@clerk/nextjs";
import { Flex } from "@radix-ui/themes";

export default function Page() {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return <Spinner />;
  }

  return (
    <Flex align={"center"} justify={"center"}>
      <SignUp />
    </Flex>
  );
}
