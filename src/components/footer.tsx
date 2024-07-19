import { Container, Flex, Text } from "@radix-ui/themes";

export default function Footer() {
  return (
    <Container size={"2"} flexGrow={"0"} px="4">
      <Flex pb="5" pt="7" justify={"between"} align={"center"} asChild>
        <footer className="text-accent-11">
          <Text>Joe Petrillo</Text>
          <Text>{new Date().getFullYear()}</Text>
        </footer>
      </Flex>
    </Container>
  );
}
