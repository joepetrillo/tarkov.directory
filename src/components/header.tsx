import {
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton,
  UserProfile,
} from "@clerk/nextjs";
import { ExitIcon, GearIcon, PersonIcon } from "@radix-ui/react-icons";
import {
  Container,
  DropdownMenu,
  Flex,
  Text,
  Heading,
  Button,
} from "@radix-ui/themes";
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
          <SignedOut>
            <Button variant="classic" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <div className="h-11 w-11">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: { height: "44px", width: "44px" },
                  },
                }}
              />
            </div>
          </SignedIn>
        </header>
      </Flex>
    </Container>
  );
}
