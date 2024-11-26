"use client";

import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      className="fixed left-4 top-4 cursor-pointer"
      variant="soft"
      onClick={() => {
        router.back();
      }}
    >
      <ArrowLeftIcon />
      Go Back
    </Button>
  );
}
