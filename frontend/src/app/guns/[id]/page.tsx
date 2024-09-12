import Link from "next/link";
import { Box, Button, Flex, Heading, Separator } from "@radix-ui/themes";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div>
      <Flex gap={"4"} align={"center"} mb={"8"}>
        <Button variant="soft" color="gray" asChild>
          <Link href={`/presets?gun=${params.id}`}>View All Presets</Link>
        </Button>
        <Button variant="classic" asChild>
          <Link href={`/guns/${params.id}/modding`}>New Preset</Link>
        </Button>
      </Flex>
      <Box mb={"8"}>
        <Heading size="3">Meta Presets</Heading>
        <Separator mt="2" mb="4" size="4" />
        <p className="text-center">Coming Soon</p>
        {/* <PresetList presets={presets} /> */}
      </Box>
      <Box>
        <Heading size="3">Popular Community Presets</Heading>
        <Separator mt="2" mb="4" size="4" />
        <p className="text-center">Coming Soon</p>
        {/* <PresetList presets={presets} /> */}
      </Box>
    </div>
  );
}
