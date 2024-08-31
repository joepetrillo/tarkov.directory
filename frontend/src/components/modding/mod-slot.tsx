import { Slot, SlotSelectionNode } from "@/types";
import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import ModSelector from "@/components/modding/mod-selector";
import { useGunModding } from "@/contexts/gun-modding.context";

type ModSlotProps = {
  slot: Slot;
  selection: SlotSelectionNode;
  path: string[];
};

export default function ModSlot({ slot, selection, path }: ModSlotProps) {
  const { mods } = useGunModding();

  const selectedMod = selection.modId ? mods[selection.modId] : null;

  if (selectedMod === undefined) {
    throw new Error(`Mod with id ${selection.modId} not found`);
  }

  return (
    <Flex direction="column" gap="4">
      <Flex
        align="center"
        direction={"row"}
        justify={"between"}
        className={`w-[155px]`}
      >
        <Flex direction={"column"} gap={"1"}>
          <Badge variant="soft" highContrast size={"2"}>
            {slot.name}
          </Badge>
          {slot.required && (
            <Text size={"1"} className="pl-[8px]">
              Required
            </Text>
          )}
        </Flex>
        <Box
          className={`p-1 ${slot.required && !selectedMod ? "border border-tomato-8" : ""}`}
        >
          <ModSelector slot={slot} selectedMod={selectedMod} path={path} />
        </Box>
      </Flex>
      {!!selectedMod?.slots.length &&
        selectedMod.slots.map((childSlot) => {
          const childSelection = selection.slots.find(
            (s) => s.slotNameId === childSlot.nameId,
          );
          return (
            childSelection && (
              <div key={childSlot.nameId} className="ml-[30px]">
                <ModSlot
                  slot={childSlot}
                  selection={childSelection}
                  path={[...path, childSlot.nameId]}
                />
              </div>
            )
          );
        })}
    </Flex>
  );
}
