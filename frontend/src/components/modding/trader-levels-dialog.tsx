"use client";

import {
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Inset,
  Select,
  Text,
} from "@radix-ui/themes";
import { GearIcon, ResetIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useGunModding } from "@/contexts/gun-modding.context";
import {
  getTraderLevel,
  KNOWN_TRADERS,
  TRADER_LEVEL_OPTIONS,
  type TraderLevel,
} from "@/lib/trader-levels";
import { getTraderImage } from "@/lib/utils";

export default function TraderLevelsDialog() {
  const { traderLevels, setTraderLevel, resetTraderLevels } = useGunModding();

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="soft">
          <GearIcon />
          Trader Levels
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="420px" aria-describedby={undefined}>
        <Dialog.Title mb="4">Trader Levels</Dialog.Title>
        <Inset side="x">
          <Box px="4">
            <Grid columns="1" gap="3">
              {KNOWN_TRADERS.map((trader) => {
                const traderImage = getTraderImage(trader.normalizedName);

                return (
                  <Flex
                    key={trader.normalizedName}
                    align="center"
                    justify="between"
                    gap="4"
                  >
                    <Flex align="center" gap="3">
                      <Image
                        src={traderImage}
                        alt={trader.name}
                        width={32}
                        height={32}
                        unoptimized={true}
                      />
                      <Text size="2" weight="bold">
                        {trader.name}
                      </Text>
                    </Flex>
                    <Select.Root
                      value={String(
                        getTraderLevel(traderLevels, trader.normalizedName),
                      )}
                      onValueChange={(value) =>
                        setTraderLevel(
                          trader.normalizedName,
                          Number(value) as TraderLevel,
                        )
                      }
                    >
                      <Select.Trigger aria-label={`${trader.name} level`} />
                      <Select.Content>
                        {TRADER_LEVEL_OPTIONS.map((level) => (
                          <Select.Item key={level} value={String(level)}>
                            LL{level}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                );
              })}
            </Grid>
          </Box>
        </Inset>
        <Flex gap="3" mt="5" justify="end">
          <Button variant="soft" color="gray" onClick={resetTraderLevels}>
            <ResetIcon />
            Reset
          </Button>
          <Dialog.Close>
            <Button variant="classic">Done</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
