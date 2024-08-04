"use client";

import { Gun, ItemId, Mod, SlotSelectionNode } from "@/types";
import { Box, Button, Flex, Heading, Separator } from "@radix-ui/themes";
import { toTitleCase } from "@/lib/utils";
import GunStats from "@/components/modding/gun-stats";
import ModSlot from "@/components/modding/mod-slot";
import { useGunModding } from "@/hooks/use-gun-modding";

type GunModdingProps = {
  gun: Gun;
  mods: Record<ItemId, Mod>;
  preset?: SlotSelectionNode[];
};

export default function GunModding({ gun, mods, preset }: GunModdingProps) {
  const { selections, dispatch } = useGunModding(gun, mods, preset);

  // console.log(selections);

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
        <Button
          mb={"4"}
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: "reset", slots: gun.slots });
          }}
        >
          Reset
        </Button>
        <Flex direction="column" gap="4">
          {gun.slots.map((slot) => {
            const selection = selections.find(
              (s) => s.slotNameId === slot.nameId,
            );
            return (
              selection && (
                <ModSlot
                  key={slot.nameId}
                  mods={mods}
                  slot={slot}
                  selection={selection}
                  path={[slot.nameId]}
                  updateSelection={(path, modId) =>
                    dispatch({ type: "updated_selection", path, modId })
                  }
                />
              )
            );
          })}
        </Flex>
      </div>
    </div>
  );
}
