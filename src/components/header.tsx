import HeaderAuth from "@/components/header-auth";
import { Container, Flex, Heading } from "@radix-ui/themes";
import Link from "next/link";

export default function Header() {
  return (
    <Container size={"2"} flexGrow={"0"} px="4">
      <Flex
        mt="5"
        mb="7"
        justify={"between"}
        align={"center"}
        gap={"4"}
        asChild
      >
        <header className="min-h-11">
          <Link
            href={"/"}
            className="outline-none outline-2 outline-offset-2 focus-visible:outline-accent-8"
          >
            <Heading as="h1" weight="bold" size="7" className="text-accent-11">
              Tarkov Directory
            </Heading>
          </Link>
          <HeaderAuth />
        </header>
      </Flex>
    </Container>
  );
}
