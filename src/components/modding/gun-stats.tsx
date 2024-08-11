import { useGunModding } from "@/contexts/gun-modding.context";
import { customRound } from "@/lib/utils";
import { Gun, Mod, SlotSelectionNode } from "@/types";
import { Card, Flex, Heading, Text } from "@radix-ui/themes";

function calculateUpdatedStats(
  gun: Gun,
  mods: Record<string, Mod>,
  selections: SlotSelectionNode[],
) {
  let ergonomics = gun.ergonomics;
  let totalRecoilModifier = 0;

  function calculateStats(selection: SlotSelectionNode) {
    if (selection.modId !== null) {
      const selectedMod = mods[selection.modId];
      if (!selectedMod) {
        console.warn(`Mod with id ${selection.modId} not found`);
      } else {
        ergonomics += selectedMod.ergonomicsModifier;
        totalRecoilModifier += selectedMod.recoilModifier;
      }
    }

    if (selection.slots !== null) {
      for (const nestedSelection of selection.slots) {
        calculateStats(nestedSelection);
      }
    }
  }

  selections.forEach(calculateStats);

  const recoilMultiplier = 1 + totalRecoilModifier / 100;

  return {
    ergonomics: Math.max(0, ergonomics),
    recoilVertical: Math.max(
      0,
      customRound(gun.recoilVertical * recoilMultiplier),
    ),
    recoilHorizontal: Math.max(
      0,
      customRound(gun.recoilHorizontal * recoilMultiplier),
    ),
  };
}

const formatDifference = (current: number, base: number) => {
  const diff = current - base;
  if (diff === 0) return null;
  return diff > 0 ? `+${diff}` : diff;
};

export default function GunStats() {
  const {
    state: { selections },
    gun,
    mods,
  } = useGunModding();

  const { ergonomics, recoilVertical, recoilHorizontal } =
    calculateUpdatedStats(gun, mods, selections);

  const ergonomicsDiff = formatDifference(ergonomics, gun.ergonomics);
  const recoilVerticalDiff = formatDifference(
    recoilVertical,
    gun.recoilVertical,
  );
  const recoilHorizontalDiff = formatDifference(
    recoilHorizontal,
    gun.recoilHorizontal,
  );

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
            <Flex align="baseline" gap="2" className="font-mono">
              <Text size={"2"}>{recoilVertical}</Text>
              {recoilVerticalDiff !== null && (
                <Text
                  size={"2"}
                  className={
                    recoilVertical < gun.recoilVertical
                      ? "text-jade-11"
                      : "text-tomato-11"
                  }
                >
                  ({recoilVerticalDiff})
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex gap={"4"}>
            <Text className="min-w-[110px] text-gray-11" size={"2"}>
              Horizontal Recoil
            </Text>
            <Flex align="baseline" gap="2" className="font-mono">
              <Text size={"2"}>{recoilHorizontal}</Text>
              {recoilHorizontalDiff !== null && (
                <Text
                  size={"2"}
                  className={
                    recoilHorizontal < gun.recoilHorizontal
                      ? "text-jade-11"
                      : "text-tomato-11"
                  }
                >
                  ({recoilHorizontalDiff})
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
      </div>
    </Card>
  );
}
