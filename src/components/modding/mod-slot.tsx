import { Slot, SlotSelectionNode } from "@/types";
import { Badge, Flex } from "@radix-ui/themes";
import { ModSelector } from "@/components/modding/mod-selector";
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
        className="w-[155px]"
      >
        <Badge variant="soft" color="gray" highContrast size={"1"}>
          {slot.name}:
        </Badge>
        <ModSelector slot={slot} selectedMod={selectedMod} path={path} />
      </Flex>
      {!!selectedMod?.slots.length && (
        <>
          {selectedMod.slots.map((childSlot) => {
            const childSelection = selection.slots.find(
              (s) => s.slotNameId === childSlot.nameId,
            );
            return (
              childSelection && (
                <div key={childSlot.nameId} className="ml-8">
                  <ModSlot
                    slot={childSlot}
                    selection={childSelection}
                    path={[...path, childSlot.nameId]}
                  />
                </div>
              )
            );
          })}
        </>
      )}
    </Flex>
  );
}
