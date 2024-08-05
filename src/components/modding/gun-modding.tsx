"use client";

import { Box, Button, Flex, Heading, Separator } from "@radix-ui/themes";
import { toTitleCase } from "@/lib/utils";
import GunStats from "@/components/modding/gun-stats";
import ModSlot from "@/components/modding/mod-slot";
import { useGunModding } from "@/contexts/gun-modding-context";

export default function GunModding() {
  console.log("GunModding re-render");
  const {
    state: { selections },
    dispatch,
    gun,
  } = useGunModding();

  return (
    <div>
      <Heading as="h3" size="5" mb="4" className="text-balance">
        {toTitleCase(gun.name)}
      </Heading>
      <Box mb="8">
        <GunStats />
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
                  slot={slot}
                  selection={selection}
                  path={[slot.nameId]}
                />
              )
            );
          })}
        </Flex>
      </div>
    </div>
  );
}
