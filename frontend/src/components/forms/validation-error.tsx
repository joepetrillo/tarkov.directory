import { Text } from "@radix-ui/themes";
import { ValidationErrors } from "next-safe-action";
import { Schema } from "next-safe-action/adapters/types";

export default function ValidationError({
  errors,
}: {
  errors: ValidationErrors<Schema>;
}) {
  return (
    <Text color="tomato" size={"2"} className="text-balance font-mono">
      {errors._errors?.[0] ?? "Invalid"}
    </Text>
  );
}
