import { CategorizedGunListData } from "@/types";
import { Card, Flex, Box, Text } from "@radix-ui/themes";
import Image from "next/image";
import Link from "next/link";

export default function GunListItem({
  gun,
}: {
  gun: CategorizedGunListData[number]["guns"][number];
}) {
  return (
    <Card variant="classic" asChild className="p-0" key={gun.id}>
      <Link href={`/guns/${gun.id}`}>
        <Flex
          height={"120px"}
          direction={"column"}
          align={"center"}
          justify={"center"}
          gap={"2"}
          p={"2"}
          className="group border-accent-6 bg-accent-1 bg-gradient-to-b from-accent-2 hover:from-accent-3"
        >
          <Text align={"center"} size={"2"}>
            {gun.shortName}
          </Text>
          {gun.defaultPresetImageUrl && (
            <Box
              height={"50px"}
              width={"100%"}
              position={"relative"}
              maxWidth={"150px"}
            >
              <Image
                src={gun.defaultPresetImageUrl}
                alt={gun.name}
                sizes="150px"
                className="object-contain"
                fill={true}
                unoptimized={true}
              />
            </Box>
          )}
          <Text size={"1"} className="block text-gray-11">
            {gun.caliber}
          </Text>
        </Flex>
      </Link>
    </Card>
  );
}
