"use client";

import { useEffect, useState } from "react";
import { Gun, ItemId, Mod, SlotSelectionNode } from "@/types";
import { Box, Flex, Heading, Separator, Text } from "@radix-ui/themes";
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

  useEffect(() => {
    console.log("Selections updated:", selections);
  }, [selections]);

  return (
    <div>
      <Heading as="h3" size={"5"} mb={"4"} className="text-balance">
        {toTitleCase(gun.name)}
      </Heading>
      <Box mb={"8"}>
        <GunStats gun={gun} mods={mods} selections={selections} />
      </Box>
      <div>
        <Heading size="3">Modding Slots</Heading>
        <Separator mt={"2"} mb={"4"} size={"4"} />
        <Flex direction={"column"} gap={"4"}>
          {gun.slots.map((slot) => (
            <ModSlot
              key={slot.nameId}
              slot={slot}
              mods={mods}
              selections={selections}
              setSelections={setSelections}
              path={[]}
            />
          ))}
        </Flex>
      </div>
    </div>
  );
}
