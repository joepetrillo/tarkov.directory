import { ExitIcon, GearIcon, PersonIcon } from "@radix-ui/react-icons";
import { Container, DropdownMenu, Flex, Text, Heading } from "@radix-ui/themes";
import Link from "next/link";

export default function Header() {
  return (
    <Container size={"2"} flexGrow={"0"} px="4">
      <Flex pt="5" pb="7" justify={"between"} align={"center"} asChild>
        <header>
          <Link
            href={"/"}
            className="outline-none outline-2 outline-offset-2 focus-visible:outline-accent-8"
          >
            <Heading as="h1" weight="bold" size="7" className="text-accent-11">
              Tarkov Directory
            </Heading>
          </Link>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button className="overflow-hidden rounded-full outline-none outline-2 outline-offset-2 focus-visible:outline-accent-8">
                <div className="h-11 w-11 bg-accent-4"></div>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item asChild>
                <Link href={"/profile"} className="hover:cursor-pointer">
                  <Flex gap={"3"} align={"center"}>
                    <PersonIcon />
                    <Text weight={"bold"}>Profile</Text>
                  </Flex>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href={"/settings"} className="hover:cursor-pointer">
                  <Flex gap={"3"} align={"center"}>
                    <GearIcon />
                    <Text weight={"bold"}>Settings</Text>
                  </Flex>
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>
                <Flex gap={"3"} align={"center"}>
                  <ExitIcon />
                  <Text weight={"bold"}>Sign Out</Text>
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </header>
      </Flex>
    </Container>
  );
}
