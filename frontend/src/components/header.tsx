import { Container, Flex, Heading, Separator } from "@radix-ui/themes";
import Link from "next/link";
import TraderLevelsDialog from "@/components/modding/trader-levels-dialog";

export default function Header() {
  return (
    <Container size={"2"} flexGrow={"0"} px="4" mb={"7"} mt={"5"} asChild>
      <header>
        <Flex align="center" justify="between" gap="4">
          <Link
            href={"/"}
            className="min-w-0 outline-none outline-2 outline-offset-2 focus-visible:outline-accent-8"
          >
            <Heading
              as="h1"
              weight="bold"
              size="7"
              className="text-balance text-accent-11 hover:text-accent-12"
            >
              Tarkov Directory
            </Heading>
          </Link>
          <TraderLevelsDialog />
        </Flex>
        <Separator orientation={"horizontal"} size={"4"} mt={"3"} />
      </header>
    </Container>
  );
}
