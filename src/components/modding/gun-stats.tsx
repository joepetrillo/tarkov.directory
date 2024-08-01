import { Gun, ItemId, Mod, SlotSelectionNode } from "@/types";
import { Card, DataList, Flex, Heading, Text } from "@radix-ui/themes";

function calculateUpdatedStats(
  gun: Gun,
  mods: Record<ItemId, Mod>,
  selections: SlotSelectionNode[],
) {
  let ergonomics = gun.ergonomics;
  let recoilVertical = gun.recoilVertical;
  let recoilHorizontal = gun.recoilHorizontal;

  function calculateStats(selection: SlotSelectionNode) {
    if (selection.selectedModId !== null) {
      const selectedMod = mods[selection.selectedModId];
      if (!selectedMod) {
        console.warn(`Mod with id ${mods[selection.selectedModId]} not found`);
      } else {
        ergonomics += selectedMod.ergonomicsModifier;
        recoilVertical += selectedMod.recoilModifier;
        recoilHorizontal += selectedMod.recoilModifier;
      }
    }

    if (selection.slots !== null) {
      for (const nestedSelection of selection.slots) {
        calculateStats(nestedSelection);
      }
    }
  }

  for (const selection of selections) {
    calculateStats(selection);
  }

  return { ergonomics, recoilVertical, recoilHorizontal };
}

const formatDifference = (current: number, base: number) => {
  const diff = current - base;
  if (diff === 0) return null;
  return diff > 0 ? `+${diff}` : diff;
};

export default function GunStats({
  gun,
  mods,
  selections,
}: {
  gun: Gun;
  mods: Record<ItemId, Mod>;
  selections: SlotSelectionNode[];
}) {
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
    <Card variant="classic" className="max-w-max" size={"3"}>
      <Heading size="2" mb={"4"} as="h4">
        Gun Stats
      </Heading>
      <DataList.Root>
        <DataList.Item align="center">
          <DataList.Label minWidth="110px">Ergonomics</DataList.Label>
          <DataList.Value>
            <Flex align="baseline" gap="2" className="font-mono">
              <Text>{ergonomics}</Text>
              {ergonomicsDiff && (
                <Text
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
          </DataList.Value>
        </DataList.Item>
        <DataList.Item align="center">
          <DataList.Label minWidth="110px">Vertical Recoil</DataList.Label>
          <DataList.Value>
            <Flex align="baseline" gap="2" className="font-mono">
              <Text>{recoilVertical}</Text>
              {recoilVerticalDiff && (
                <Text
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
          </DataList.Value>
        </DataList.Item>
        <DataList.Item align="center">
          <DataList.Label minWidth="110px">Horizontal Recoil</DataList.Label>
          <DataList.Value>
            <Flex align="baseline" gap="2" className="font-mono">
              <Text>{recoilHorizontal}</Text>
              {recoilHorizontalDiff && (
                <Text
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
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </Card>
  );
}
