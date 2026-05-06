import { GitHubLogoIcon, GlobeIcon } from "@radix-ui/react-icons";
import { Container, Flex, Text } from "@radix-ui/themes";

const COPYRIGHT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <Container size={"2"} flexGrow={"0"} px="4" mb="5" mt="7" asChild>
      <footer className="text-accent-11">
        <Flex justify={"between"} align={"center"}>
          <Text size={"2"}>{COPYRIGHT_YEAR} - tarkov.directory</Text>
          <Flex gap={"2"} justify={"center"} align={"center"}>
            <a href="https://github.com/joepetrillo" target="_blank">
              <span className="sr-only">Go to Joe&apos;s GitHub</span>
              <GitHubLogoIcon width={20} height={20} />
            </a>
            <a href="https://tarkov.dev/api" target="_blank">
              <span className="sr-only">Go to Tarkov Dev API</span>
              <GlobeIcon width={20} height={20} />
            </a>
          </Flex>
        </Flex>
      </footer>
    </Container>
  );
}
