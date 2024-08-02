import { ItemId, Mod, Slot, SlotSelectionNode } from "@/types";
import { Flex, Text } from "@radix-ui/themes";
import { ModSelector } from "@/components/modding/mod-selector";

type ModSlotProps = {
  slot: Slot;
  mods: Record<ItemId, Mod>;
  selection: SlotSelectionNode;
  updateSelection: (path: string[], modId: ItemId | null) => void;
  path: string[];
};

export default function ModSlot({
  slot,
  mods,
  selection,
  updateSelection,
  path,
}: ModSlotProps) {
  const selectedMod = selection.selectedModId
    ? mods[selection.selectedModId]
    : null;

  return (
    <Flex direction="column" gap="4">
      <Flex gap="2" align="center" justify="between" width="160px">
        <Text>{slot.name}:</Text>
        <ModSelector
          slot={slot}
          mods={mods}
          selection={selection}
          updateSelection={updateSelection}
          path={path}
        />
      </Flex>
      {selectedMod?.slots && selectedMod.slots.length > 0 && (
        <>
          {selectedMod.slots.map((subSlot) => {
            const subSelection = selection.slots
              ? selection.slots.find((s) => s.nameId === subSlot.nameId)
              : undefined;
            return subSelection ? (
              <div key={subSlot.nameId} className="ml-10">
                <ModSlot
                  slot={subSlot}
                  mods={mods}
                  selection={subSelection}
                  updateSelection={updateSelection}
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
