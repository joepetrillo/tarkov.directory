import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";

export default function ServerError({ error }: { error: string }) {
  return (
    <Callout.Root variant="soft" color="tomato" size={"1"}>
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text className="text-balance font-mono">{error}</Callout.Text>
    </Callout.Root>
  );
}
