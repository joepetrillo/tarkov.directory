import { Container, Flex } from "@radix-ui/themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Flex minHeight="100dvh" direction="column" justify={"center"}>
      <Container size="2" px="4" flexGrow={"0"}>
        <main>{children}</main>
      </Container>
    </Flex>
  );
}
