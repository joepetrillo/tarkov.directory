import { Slot, SlotSelectionNode } from "@/types";
import { Flex, Text } from "@radix-ui/themes";
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

  if (slot.allowedModIds.length === 0) {
    return null;
  }

  return (
    <Flex direction="column" gap="4">
      <Flex gap="2" align="center" justify="between" width="160px">
        <Text>{slot.name}:</Text>
        <ModSelector slot={slot} selection={selection} path={path} />
      </Flex>
      {!!selectedMod?.slots.length && (
        <>
          {selectedMod.slots.map((subSlot) => {
            const subSelection = selection.slots.find(
              (s) => s.slotNameId === subSlot.nameId,
            );

            return subSelection ? (
              <div key={subSlot.nameId} className="ml-10">
                <ModSlot
                  slot={subSlot}
                  selection={subSelection}
                  path={[...path, subSlot.nameId]}
                />
              </div>
            ) : null;
          })}
        </>
      )}
    </Flex>
  );
}
