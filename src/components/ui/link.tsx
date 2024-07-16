import { Link as RadixLink } from "@radix-ui/themes";
import NextLink, { LinkProps } from "next/link";

type CustomLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

export default function Link({ children, ...props }: CustomLinkProps) {
  return (
    <RadixLink asChild>
      <NextLink {...props}>{children}</NextLink>
    </RadixLink>
  );
}
