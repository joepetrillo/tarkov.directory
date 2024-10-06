"use client";

import {
  AlertDialog,
  Box,
  Button,
  Flex,
  Heading,
  Separator,
} from "@radix-ui/themes";
import GunStats from "@/components/modding/gun-stats";
import ModSlot from "@/components/modding/mod-slot";
import { useGunModding } from "@/components/modding/gun-modding.context";

export default function GunModding() {
  const {
    state: { selections },
    dispatch,
    gun,
  } = useGunModding();

  return (
    <>
      <Box mb="8">
        <GunStats />
      </Box>
      <Heading size="3">Modding Slots</Heading>
      <Separator mt="2" mb="4" size="4" />
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="classic" mb={"4"}>
            Reset
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content maxWidth="425px">
          <AlertDialog.Title>Reset Selections</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure? All slots will become empty.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="classic"
                onClick={() => dispatch({ type: "reset" })}
              >
                Reset
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
      <Flex direction="column" gap="4">
        {gun.slots.map((slot) => {
          const selection = selections.find(
            (selection) => selection.slotNameId === slot.nameId,
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
    </>
  );
}
