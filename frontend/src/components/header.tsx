import HeaderNav from "@/components/header-nav";
import { Container, Flex, Heading, Separator } from "@radix-ui/themes";
import Link from "next/link";

export default function Header() {
  return (
    <Container size={"2"} flexGrow={"0"} px="4" mb={"7"} mt={"5"} asChild>
      <header>
        <Link
          href={"/"}
          className="inline-block outline-none outline-2 outline-offset-2 focus-visible:outline-accent-8"
        >
          <Heading
            as="h1"
            weight="bold"
            size="7"
            className="text-accent-11 hover:text-accent-12"
          >
            Tarkov Directory
          </Heading>
        </Link>
        <Separator orientation={"horizontal"} size={"4"} mt={"3"} />
        {/* <HeaderNav /> */}
      </header>
    </Container>
  );
}
