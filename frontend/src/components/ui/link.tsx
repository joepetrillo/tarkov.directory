import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { Link as RadixLink } from "@radix-ui/themes";

type CustomLinkProps = NextLinkProps & {
  children: React.ReactNode;
  className?: string;
};

export default function Link({
  children,
  className,
  ...nextLinkProps
}: CustomLinkProps) {
  return (
    <span className={`inline-block ${className}`}>
      <RadixLink asChild>
        <NextLink {...nextLinkProps}>{children}</NextLink>
      </RadixLink>
    </span>
  );
}
