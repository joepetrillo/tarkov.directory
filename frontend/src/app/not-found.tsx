import Link from "@/components/ui/link";
import { Card, Flex } from "@radix-ui/themes";

export default function Error() {
  return (
    <Flex
      minHeight={"100dvh"}
      justify={"center"}
      align={"center"}
      className="font-mono"
    >
      <Flex
        direction={"column"}
        align={"center"}
        justify={"center"}
        gap={"4"}
        className="text-balance text-center"
      >
        <p>404 - Page Not Found</p>
        <Link href="/">Go Home</Link>
      </Flex>
    </Flex>
  );
}
