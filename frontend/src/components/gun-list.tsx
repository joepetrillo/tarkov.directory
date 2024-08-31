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
import type { CategorizedGunListData } from "backend";
import { useQueryState } from "nuqs";
import SearchInput from "@/components/ui/search-input";

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
                return (
                  <Card variant="classic" asChild className="p-0" key={gun.id}>
                    <Link href={`/guns/${gun.id}`}>
                      <Flex
                        height={"120px"}
                        direction={"column"}
                        align={"center"}
                        justify={"center"}
                        gap={"2"}
                        p={"2"}
                        className="group border-accent-6 bg-accent-1 bg-gradient-to-b from-accent-2 hover:from-accent-3"
                      >
                        <Text align={"center"} size={"2"}>
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
                  </Card>
                );
              })}
            </Grid>
          </Section>
        );
      })}
    </div>
  );
}
