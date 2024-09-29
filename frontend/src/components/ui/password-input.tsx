"use client";

import { EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { IconButton, TextField } from "@radix-ui/themes";
import { RefAttributes, useState } from "react";

export default function PasswordInput(
  props: TextField.RootProps & RefAttributes<HTMLInputElement>,
) {
  const [inputType, setInputType] = useState<"password" | "text">("password");

  return (
    <TextField.Root {...props} size="3" type={inputType}>
      <TextField.Slot side="right" pr={"1"}>
        <IconButton
          variant="soft"
          className="cursor-pointer"
          type="button"
          onClick={() => {
            setInputType((prev) => (prev === "text" ? "password" : "text"));
          }}
        >
          {inputType === "text" ? (
            <EyeOpenIcon height="18" width="18" />
          ) : (
            <EyeNoneIcon height="18" width="18" />
          )}
        </IconButton>
      </TextField.Slot>
    </TextField.Root>
  );
}
