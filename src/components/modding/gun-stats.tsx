import { useGunModding } from "@/contexts/gun-modding.context";
import { formatDiff } from "@/lib/utils";
import { Card, Flex, Heading, Text } from "@radix-ui/themes";

export default function GunStats() {
  const {
    state: { selections },
    gun,
    moddingUtils,
  } = useGunModding();

  // calculate updated stats based on selected mods
  const { ergonomics, recoilVertical, recoilHorizontal } =
    moddingUtils.calculateStats(selections);

  // format the diff between the base gun stats and the stats with the selected mods applied
  const ergonomicsDiff = formatDiff(ergonomics, gun.ergonomics);
  const verticalDiff = formatDiff(recoilVertical, gun.recoilVertical);
  const horizontalDiff = formatDiff(recoilHorizontal, gun.recoilHorizontal);

  return (
    <Card variant="classic" size={"3"} className="max-w-max">
      <div className="overflow-x-auto">
        <Heading size="3" mb={"4"} as="h4">
          Gun Stats
        </Heading>
        <Flex direction={"column"} gap={"4"}>
          <Flex gap={"4"}>
            <Text className="min-w-[110px] text-gray-11" size={"2"}>
              Ergonomics
            </Text>
            <Flex align="center" gap="2" className="font-mono">
              <Text size={"2"}>{ergonomics}</Text>
              {ergonomicsDiff !== null && (
                <Text
                  size={"2"}
                  className={
                    ergonomics > gun.ergonomics
                      ? "text-jade-11"
                      : "text-tomato-11"
                  }
                >
                  ({ergonomicsDiff})
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex gap={"4"}>
            <Text className="min-w-[110px] text-gray-11" size={"2"}>
              Vertical Recoil
            </Text>
            <Flex align={"center"} gap={"2"} className="font-mono">
              <Text size={"2"}>{recoilVertical}</Text>
              {verticalDiff !== null && (
                <Text
                  size={"2"}
                  className={
                    recoilVertical < gun.recoilVertical
                      ? "text-jade-11"
                      : "text-tomato-11"
                  }
                >
                  ({verticalDiff})
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex gap={"4"}>
            <Text className="min-w-[110px] text-gray-11" size={"2"}>
              Horizontal Recoil
            </Text>
            <Flex align={"center"} gap={"2"} className="font-mono">
              <Text size={"2"}>{recoilHorizontal}</Text>
              {horizontalDiff !== null && (
                <Text
                  size={"2"}
                  className={
                    recoilHorizontal < gun.recoilHorizontal
                      ? "text-jade-11"
                      : "text-tomato-11"
                  }
                >
                  ({horizontalDiff})
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
      </div>
    </Card>
  );
}
