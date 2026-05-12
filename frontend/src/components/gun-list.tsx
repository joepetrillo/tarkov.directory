"use client";

import Image from "next/image";
import { toTitleCase } from "@/lib/utils";
import Link from "next/link";
import {
  Box,
  Text,
  Flex,
  Grid,
  Heading,
  Section,
  Card,
  Select,
} from "@radix-ui/themes";
import type { CategorizedGunListData } from "@/types";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import SearchInput from "@/components/ui/search-input";
import { useMemo } from "react";
import {
  filterCategorizedGunList,
  getGunCaliberOptions,
  getGunListCount,
} from "@/lib/gun-list-filters";

const ALL_CALIBERS_VALUE = "all";

export default function GunList({
  categorizedGunList,
}: {
  categorizedGunList: CategorizedGunListData;
}) {
  return <GunListContent categorizedGunList={categorizedGunList} />;
}

function GunListContent({
  categorizedGunList,
}: {
  categorizedGunList: CategorizedGunListData;
}) {
  const caliberOptions = useMemo(
    () => getGunCaliberOptions(categorizedGunList),
    [categorizedGunList],
  );
  const gunCount = useMemo(
    () => getGunListCount(categorizedGunList),
    [categorizedGunList],
  );
  const caliberValues = useMemo(
    () => caliberOptions.map(({ caliber }) => caliber),
    [caliberOptions],
  );
  const filterParsers = useMemo(
    () => ({
      search: parseAsString.withDefault(""),
      caliber: parseAsStringLiteral(caliberValues).withDefault(""),
    }),
    [caliberValues],
  );
  const [filters, setFilters] = useQueryStates(filterParsers);

  const filteredList = filterCategorizedGunList(categorizedGunList, filters);

  return (
    <div>
      <Flex direction="row" gap="3" align="center">
        <Box width="100%" className="min-w-0 flex-1">
          <SearchInput
            searchInput={filters.search}
            setSearchInput={(search) => setFilters({ search })}
            placeholder="Search by name"
          />
        </Box>
        <Select.Root
          size="2"
          value={filters.caliber || ALL_CALIBERS_VALUE}
          onValueChange={(caliber) =>
            setFilters({
              caliber: caliber === ALL_CALIBERS_VALUE ? "" : caliber,
            })
          }
        >
          <Select.Trigger
            aria-label="Filter by caliber"
            placeholder="All calibers"
            className="h-10 w-44 font-mono [&_.caliber-option-count]:hidden"
          />
          <Select.Content className="min-w-44 font-mono">
            <Select.Item
              value={ALL_CALIBERS_VALUE}
              textValue="All calibers"
              className="[&>span:last-child]:w-full"
            >
              <Flex align="center" justify="between" gap="4">
                <Text as="span">All calibers</Text>
                <Text
                  as="span"
                  color="gray"
                  className="caliber-option-count tabular-nums"
                >
                  {gunCount}
                </Text>
              </Flex>
            </Select.Item>
            {caliberOptions.map(({ caliber, count }) => (
              <Select.Item
                key={caliber}
                value={caliber}
                textValue={caliber}
                className="[&>span:last-child]:w-full"
              >
                <Flex align="center" justify="between" gap="4">
                  <Text as="span">{caliber}</Text>
                  <Text
                    as="span"
                    color="gray"
                    className="caliber-option-count tabular-nums"
                  >
                    {count}
                  </Text>
                </Flex>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>
      {filteredList.length === 0 && (
        <Flex align={"center"} justify={"center"} mt={"7"}>
          <Text weight={"bold"} align={"center"}>
            No guns found matching filters
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
