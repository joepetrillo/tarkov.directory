import { Link as RadixLink } from "@radix-ui/themes";
import NextLink from "next/link";

// We use this component to wrap the NextLink component with Radix UI styles
export default function Link(props: React.ComponentProps<typeof NextLink>) {
  return (
    <RadixLink asChild>
      <NextLink {...props}>Go to all guns page</NextLink>
    </RadixLink>
  );
}
