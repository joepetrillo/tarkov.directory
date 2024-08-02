"use client";

import { useState } from "react";
import { Gun, ItemId, Mod, SlotSelectionNode } from "@/types";
import { Box, Flex, Heading, Separator } from "@radix-ui/themes";
import { initializeEmptyState, toTitleCase } from "@/lib/utils";
import GunStats from "@/components/modding/gun-stats";
import ModSlot from "@/components/modding/mod-slot";

export default function GunModding({
  gun,
  mods,
  preset,
}: {
  gun: Gun;
  mods: Record<ItemId, Mod>;
  preset?: SlotSelectionNode[];
}) {
  const [selections, setSelections] = useState<SlotSelectionNode[]>(() => {
    if (preset) return preset;
    return initializeEmptyState(gun.slots);
  });

  const updateSelection = (path: string[], modId: ItemId | null) => {
    setSelections((prevSelections) => {
      const newSelections = [...prevSelections];
      let current: SlotSelectionNode[] | null = newSelections;
      let parent: SlotSelectionNode | null = null;
      let lastIndex = -1;

      for (let i = 0; i < path.length; i++) {
        if (!current) break;
        lastIndex = current.findIndex((s) => s.nameId === path[i]);
        if (lastIndex === -1) return prevSelections;
        parent = current[lastIndex];
        current = parent.slots;
      }

      if (!parent || lastIndex === -1) return prevSelections;

      if (modId === null) {
        parent.selectedModId = null;
        parent.slots = null;
      } else {
        const selectedMod = mods[modId];
        parent.selectedModId = modId;
        parent.slots =
          selectedMod.slots.length > 0
            ? selectedMod.slots.map((s) => ({
                nameId: s.nameId,
                selectedModId: null,
                slots: null,
              }))
            : null;
      }

      return newSelections;
    });
  };

  return (
    <div>
      <Heading as="h3" size="5" mb="4" className="text-balance">
        {toTitleCase(gun.name)}
      </Heading>
      <Box mb="8">
        <GunStats gun={gun} mods={mods} selections={selections} />
      </Box>
      <div>
        <Heading size="3">Modding Slots</Heading>
        <Separator mt="2" mb="4" size="4" />
        <Flex direction="column" gap="4">
          {gun.slots.map((slot) => {
            const selection = selections.find((s) => s.nameId === slot.nameId);
            return selection ? (
              <ModSlot
                key={slot.nameId}
                slot={slot}
                mods={mods}
                selection={selection}
                updateSelection={updateSelection}
                path={[slot.nameId]}
              />
            ) : null;
          })}
        </Flex>
      </div>
    </div>
  );
}
