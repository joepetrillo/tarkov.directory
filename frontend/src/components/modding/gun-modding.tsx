"use client";

import {
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import GunStats from "@/components/modding/gun-stats";
import ModSlot from "@/components/modding/mod-slot";
import { useGunModding } from "@/contexts/gun-modding.context";
import { ResetIcon } from "@radix-ui/react-icons";

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
      <Flex direction="row" justify="between" align="end" gap="4">
        <Heading size="3">Modding Slots</Heading>
        <Flex gap="3" wrap="wrap">
          <Dialog.Root>
            <Dialog.Trigger>
              <Button variant="soft">
                <ResetIcon />
                Reset
              </Button>
            </Dialog.Trigger>
            <Dialog.Content aria-describedby={undefined} maxWidth="420px">
              <Dialog.Title>Reset Selections</Dialog.Title>
              <Text as="p" size="2" className="text-gray-11">
                Are you sure? All slots will be reset.
              </Text>
              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button
                    variant="classic"
                    onClick={() => dispatch({ type: "reset" })}
                  >
                    Proceed
                  </Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
      </Flex>
      <Separator mt="2" mb="4" size="4" />
      <Flex direction="column" gap="4">
        {gun.slots.map((slot) => {
          const selection = selections.find(
            (selection) => selection.slotId === slot.id,
          );
          return (
            selection && (
              <ModSlot
                key={slot.id}
                slot={slot}
                selection={selection}
                path={[slot.id]}
              />
            )
          );
        })}
      </Flex>
    </>
  );
}
