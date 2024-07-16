import { Box, Text } from "@radix-ui/themes";

export default function Footer() {
  return (
    <Box p="5" pt="7" mt="auto" asChild>
      <footer>
        <Text as="div" align="center" className="text-accent-10">
          <span>Joe Petrillo - {new Date().getFullYear()}</span>
        </Text>
      </footer>
    </Box>
  );
}
