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

  // calculate diffs
  const ergonomicsDiff = formatDiff(ergonomics, gun.ergonomics);
  const verticalDiff = formatDiff(recoilVertical, gun.recoilVertical);
  const horizontalDiff = formatDiff(recoilHorizontal, gun.recoilHorizontal);

  // check if any diffs are shown
  const showDiffs =
    ergonomicsDiff !== null || verticalDiff !== null || horizontalDiff !== null;

  return (
    <Card variant="classic" size="3" className="max-w-max">
      <div className="overflow-x-auto">
        <Heading size="3" mb="4" as="h4">
          Gun Stats
        </Heading>
        <Flex direction="column" gap="4">
          <StatRow
            label="Ergonomics"
            value={ergonomics}
            diff={ergonomicsDiff}
            showDiffs={showDiffs}
            isPositive={ergonomics > gun.ergonomics}
          />
          <StatRow
            label="Vertical Recoil"
            value={recoilVertical}
            diff={verticalDiff}
            showDiffs={showDiffs}
            isPositive={recoilVertical < gun.recoilVertical}
          />
          <StatRow
            label="Horizontal Recoil"
            value={recoilHorizontal}
            diff={horizontalDiff}
            showDiffs={showDiffs}
            isPositive={recoilHorizontal < gun.recoilHorizontal}
          />
        </Flex>
      </div>
    </Card>
  );
}

type StatRowProps = {
  label: string;
  value: number;
  diff: string | null;
  showDiffs: boolean;
  isPositive: boolean;
};

function StatRow({ label, value, diff, showDiffs, isPositive }: StatRowProps) {
  return (
    <Flex gap="4">
      <Text className="min-w-[110px] text-gray-11" size="2">
        {label}
      </Text>
      <Flex align="center" gap="2" className="font-mono">
        <Text size="2" className={showDiffs ? "min-w-[45px]" : ""}>
          {value}
        </Text>
        {diff && (
          <Text
            size="2"
            className={isPositive ? "text-jade-11" : "text-tomato-11"}
          >
            ({diff})
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
