import { ItemId, Mod, Slot, SlotSelectionNode } from "@/types";
import { Flex, Text } from "@radix-ui/themes";
import { ModSelector } from "@/components/modding/mod-selector";

type ModSlotProps = {
  slot: Slot;
  mods: Record<ItemId, Mod>;
  selection: SlotSelectionNode;
  path: string[];
  updateSelection: (path: string[], modId: ItemId | null) => void;
};

export default function ModSlot({
  slot,
  mods,
  selection,
  path,
  updateSelection,
}: ModSlotProps) {
  const selectedMod = selection.modId ? mods[selection.modId] : null;

  return (
    <Flex direction="column" gap="4">
      <Flex gap="2" align="center" justify="between" width="160px">
        <Text>{slot.name}:</Text>
        <ModSelector
          slot={slot}
          mods={mods}
          selection={selection}
          path={path}
          updateSelection={updateSelection}
        />
      </Flex>
      {selectedMod?.slots && selectedMod.slots.length > 0 && (
        <>
          {selectedMod.slots.map((subSlot) => {
            const subSelection = selection.slots.find(
              (s) => s.slotNameId === subSlot.nameId,
            );

            return subSelection ? (
              <div key={subSlot.nameId} className="ml-10">
                <ModSlot
                  slot={subSlot}
                  mods={mods}
                  selection={subSelection}
                  path={[...path, subSlot.nameId]}
                  updateSelection={updateSelection}
                />
              </div>
            ) : null;
          })}
        </>
      )}
    </Flex>
  );
}
