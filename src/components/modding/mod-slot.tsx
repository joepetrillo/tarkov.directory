// components/modding/mod-slot.tsx
import { Dispatch, SetStateAction } from "react";
import { ItemId, Mod, Slot, SlotSelectionNode } from "@/types"; // Adjust the import path as needed
import { Flex, Text } from "@radix-ui/themes";
import { ModSelector } from "@/components/modding/mod-selector";

type ModSlotProps = {
  slot: Slot;
  mods: Record<ItemId, Mod>;
  selections: SlotSelectionNode[];
  setSelections: Dispatch<SetStateAction<SlotSelectionNode[]>>;
  path: string[];
};

export default function ModSlot({
  slot,
  mods,
  selections,
  setSelections,
  path,
}: ModSlotProps) {
  const selection = selections.find((s) => s.nameId === slot.nameId);

  if (!selection) {
    console.warn(`No selection state found for slot ${slot.nameId}`);
    return null;
  }

  const getSelectedMod = () => {
    const modId = selection.selectedModId;
    if (!modId) return null;
    return mods[modId];
  };

  const selectedMod = getSelectedMod();

  return (
    <Flex direction={"column"} gap={"4"}>
      <Flex gap={"2"} align="center" justify={"between"} width={"160px"}>
        <Text>{slot.name}:</Text>
        <ModSelector
          slot={slot}
          mods={mods}
          selection={selection}
          setSelections={setSelections}
          path={path}
        />
      </Flex>
      {selectedMod?.slots && (
        <>
          {selectedMod.slots.map((subSlot) => (
            <div key={subSlot.nameId} className="ml-10">
              <ModSlot
                slot={subSlot}
                mods={mods}
                selections={selection.slots || []}
                setSelections={setSelections}
                path={[...path, slot.nameId]}
              />
            </div>
          ))}
        </>
      )}
    </Flex>
  );
}
