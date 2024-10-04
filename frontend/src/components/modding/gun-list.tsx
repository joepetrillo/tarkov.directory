"use client";

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
  Card,
} from "@radix-ui/themes";
import type { CategorizedGunListData } from "@/types";
import { useQueryState } from "nuqs";
import SearchInput from "@/components/ui/search-input";
import GunListItem from "@/components/modding/gun-list-item";

export default function GunList({
  categorizedGunList,
}: {
  categorizedGunList: CategorizedGunListData;
}) {
  const [searchInput, setSearchInput] = useQueryState("search", {
    clearOnDefault: true,
    defaultValue: "",
  });

  const filteredList = categorizedGunList
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
      <SearchInput
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        placeholder="Search by name"
        autofocus
      />
      {filteredList.length === 0 && (
        <Flex align={"center"} justify={"center"} mt={"7"}>
          <Text weight={"bold"} align={"center"}>
            No guns found matching search
          </Text>
        </Flex>
      )}
      {filteredList.map(({ categoryName, guns }) => {
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
                return <GunListItem key={gun.id} gun={gun} />;
              })}
            </Grid>
          </Section>
        );
      })}
    </div>
  );
}
