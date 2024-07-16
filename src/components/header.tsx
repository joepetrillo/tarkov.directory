import { Box, Heading } from "@radix-ui/themes";

export default function Header() {
  return (
    <Box p="5" pb="7" asChild>
      <header>
        <Heading
          as="h1"
          weight="bold"
          align="center"
          size="8"
          className="text-accent-10"
        >
          Tarkov Directory
        </Heading>
      </header>
    </Box>
  );
}
