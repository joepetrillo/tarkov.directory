"use client";

import { BasicGunInfo } from "@/types";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import Image from "next/image";
import { normalizeString, toTitleCase } from "@/lib/utils";
import Link from "next/link";
import {
  Box,
  Text,
  Flex,
  Grid,
  Heading,
  Section,
  TextField,
} from "@radix-ui/themes";

export default function GunList({
  categorizedGuns,
}: {
  categorizedGuns: {
    categoryName: string;
    items: BasicGunInfo[];
  }[];
}) {
  const [searchInput, setSearchInput] = useState("");

  categorizedGuns = categorizedGuns
    .map((category) => {
      return {
        categoryName: category.categoryName,
        items: category.items.filter((item) => {
          return normalizeString(item.shortName).includes(
            normalizeString(searchInput),
          );
        }),
      };
    })
    .filter((category) => category.items.length > 0);

  return (
    <div>
      <TextField.Root
        autoFocus
        placeholder="Search by name"
        value={searchInput}
        onChange={(e) => setSearchInput(e.currentTarget.value)}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      {categorizedGuns.map(({ categoryName, items }) => {
        return (
          <Section key={categoryName} size={"1"}>
            <Box pb={"4"}>
              <Heading as="h3" size={"5"}>
                {toTitleCase(categoryName)} ({items.length})
              </Heading>
            </Box>
            <Grid
              columns={{
                initial: "2",
                xs: "3",
                sm: "5",
              }}
              gap={"3"}
            >
              {items.map((gun) => {
                return (
                  <Link key={gun.id} href={`/guns/${gun.id}`}>
                    <Flex
                      height={"120px"}
                      direction={"column"}
                      align={"center"}
                      justify={"center"}
                      gap={"2"}
                      p={"2"}
                      className="group border border-gray-6 bg-gradient-to-b from-accent-2 hover:bg-accent-2"
                    >
                      <Text
                        className="group-hover:underline"
                        align={"center"}
                        size={"2"}
                      >
                        {gun.shortName}
                      </Text>
                      {gun.defaultPresetImageUrl && (
                        <Box
                          height={"50px"}
                          width={"100%"}
                          position={"relative"}
                          maxWidth={"150px"}
                        >
                          <Image
                            src={gun.defaultPresetImageUrl}
                            alt={gun.name}
                            sizes="150px"
                            className="object-contain"
                            fill={true}
                          />
                        </Box>
                      )}
                      <Text size={"1"} className="block text-accent-8">
                        {gun.caliber}
                      </Text>
                    </Flex>
                  </Link>
                );
              })}
            </Grid>
          </Section>
        );
      })}
    </div>
  );
}
