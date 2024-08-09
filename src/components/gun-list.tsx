"use client";

import { MagnifyingGlassIcon, TrashIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { normalizeShortNameSearch, toTitleCase } from "@/lib/utils";
import Link from "next/link";
import {
  Box,
  Text,
  Flex,
  Grid,
  Heading,
  Section,
  TextField,
  IconButton,
} from "@radix-ui/themes";
import { CategorizedGunListData } from "@/types";
import { useQueryState } from "nuqs";

export default function GunList({
  categorizedGunList,
}: {
  categorizedGunList: CategorizedGunListData;
}) {
  const [searchInput, setSearchInput] = useQueryState("search", {
    clearOnDefault: true,
    defaultValue: "",
  });

  categorizedGunList = categorizedGunList
    .map((category) => {
      return {
        categoryName: category.categoryName,
        guns: category.guns.filter((gun) => {
          return normalizeShortNameSearch(gun.shortName).includes(
            normalizeShortNameSearch(searchInput),
          );
        }),
      };
    })
    .filter((category) => category.guns.length > 0);

  return (
    <div>
      <TextField.Root
        size={"3"}
        placeholder="Search by name"
        value={searchInput}
        onChange={(e) => setSearchInput(e.currentTarget.value)}
      >
        <TextField.Slot side="left">
          <MagnifyingGlassIcon height="18" width="18" />
        </TextField.Slot>
        {searchInput && (
          <TextField.Slot side="right" pr={"1"}>
            <IconButton
              variant="soft"
              className="cursor-pointer"
              onClick={() => setSearchInput(null)}
            >
              <TrashIcon height="18" width="18" />
            </IconButton>
          </TextField.Slot>
        )}
      </TextField.Root>
      {categorizedGunList.length === 0 && (
        <Flex align={"center"} justify={"center"} mt={"7"}>
          <Text weight={"bold"} align={"center"}>
            No guns found
          </Text>
        </Flex>
      )}
      {categorizedGunList.map(({ categoryName, guns }) => {
        return (
          <Section key={categoryName} size={"1"}>
            <Box mb={"4"}>
              <Heading as="h3" size={"5"}>
                {toTitleCase(categoryName)} ({guns.length})
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
              {guns.map((gun) => {
                return (
                  <Link
                    key={gun.id}
                    href={`/guns/${gun.id}`}
                    className="outline-none outline-2 outline-offset-2 focus-visible:outline-accent-8"
                  >
                    <Flex
                      height={"120px"}
                      direction={"column"}
                      align={"center"}
                      justify={"center"}
                      gap={"2"}
                      p={"2"}
                      className="group border border-accent-6 bg-accent-1 bg-gradient-to-b from-accent-2 hover:from-accent-3"
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
                            unoptimized={true}
                          />
                        </Box>
                      )}
                      <Text size={"1"} className="block text-gray-11">
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
