"use client";

import {
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Heading,
  Select,
  Text,
} from "@radix-ui/themes";
import { DoubleArrowDownIcon, GearIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useTraderLevels } from "@/contexts/trader-levels.context";
import {
  getTraderLevel,
  KNOWN_TRADERS,
  TRADER_LEVEL_OPTIONS,
  type TraderLevel,
} from "@/lib/trader-levels";
import { getTraderImage } from "@/lib/utils";

export default function TraderLevelsDialog() {
  const { traderLevels, setTraderLevel, resetTraderLevels } = useTraderLevels();

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="soft" aria-label="Settings">
          <GearIcon />
          <span className="hidden min-[400px]:inline">Settings</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="420px" aria-describedby={undefined}>
        <Dialog.Title mb="4">Settings</Dialog.Title>
        <Box>
          <Heading as="h2" size="3" mb="3">
            Trader Levels
          </Heading>
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
                    <Select.Trigger
                      aria-label={`${trader.name} level`}
                      className="w-14 font-mono"
                    />
                    <Select.Content className="font-mono">
                      {TRADER_LEVEL_OPTIONS.map((level) => (
                        <Select.Item key={level} value={String(level)}>
                          {level}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              );
            })}
          </Grid>
        </Box>
        <Flex gap="3" mt="5" justify="end">
          <Button variant="soft" color="gray" onClick={resetTraderLevels}>
            <DoubleArrowDownIcon />
            Reset Levels
          </Button>
          <Dialog.Close>
            <Button variant="classic">Done</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
