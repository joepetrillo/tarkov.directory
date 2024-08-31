import {
  Dialog,
  Flex,
  Button,
  Table,
  Text,
  Inset,
  ScrollArea,
  Card,
  Box,
  Checkbox,
} from "@radix-ui/themes";
import { Mod, Slot } from "@/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import ModIcon from "@/components/modding/mod-icon";
import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { useGunModding } from "@/contexts/gun-modding.context";
import SearchInput from "@/components/ui/search-input";
import {
  getTraderImage,
  isMobileDevice,
  normalizeShortNameSearch,
} from "@/lib/utils";
import Image from "next/image";

type ModSelectorProps = {
  slot: Slot;
  selectedMod: Mod | null;
  path: string[];
};

type ModWithConflicting = Mod & {
  isConflicting: boolean;
};

const columnHelper = createColumnHelper<ModWithConflicting>();

export default function ModSelector({
  slot,
  selectedMod,
  path,
}: ModSelectorProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [hideConflicting, setHideConflicting] = useState(false);
  const {
    state: { selections },
    dispatch,
    mods,
    moddingUtils,
  } = useGunModding();

  const columns = useMemo(
    () => [
      columnHelper.accessor("shortName", {
        header: "Mod",
        cell: (info) => (
          <Flex align="center" gap="4" className="min-w-[250px]">
            <ModIcon
              iconImageUrl={info.row.original.iconImageUrl}
              shortName={info.getValue()}
              showShortName={false}
              size={46}
            />
            <Flex direction="column">
              <Text size="2" weight="bold">
                {info.getValue()}{" "}
                {info.row.original.id === selectedMod?.id
                  ? "(Selected)"
                  : info.row.original.isConflicting
                    ? "(Conflicting)"
                    : ""}
              </Text>
              <Text size="1" className="line-clamp-1 text-balance text-gray-11">
                {info.row.original.name}
              </Text>
            </Flex>
          </Flex>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("ergonomicsModifier", {
        header: "Ergo",
        size: 100,
        cell: (info) => {
          const value = info.getValue();
          const formattedValue = value > 0 ? `+${value}` : value;
          const textColorClass =
            value < 0 ? "text-tomato-11" : value > 0 ? "text-jade-11" : "";
          return (
            <Text
              weight={"bold"}
              className={`block font-mono ${textColorClass} whitespace-nowrap`}
            >
              {formattedValue}
            </Text>
          );
        },
      }),
      columnHelper.accessor("recoilModifier", {
        header: "Recoil",
        size: 100,
        invertSorting: true,
        cell: (info) => {
          const value = info.getValue();
          const formattedValue = value > 0 ? `+${value}` : value;
          const textColorClass =
            value < 0 ? "text-jade-11" : value > 0 ? "text-tomato-11" : "";
          return (
            <Text
              weight={"bold"}
              className={`block font-mono ${textColorClass} whitespace-nowrap`}
            >
              {formattedValue}
            </Text>
          );
        },
      }),
      columnHelper.accessor("avgFleaMarketRUBPrice", {
        header: "Avg Flea Price",
        size: 145,
        sortUndefined: "last",
        cell: (info) => {
          const value = info.getValue();
          return value ? (
            <Flex gap="1" align={"center"} wrap={"nowrap"}>
              <Text size={"3"} className="text-gray-11">
                ₽
              </Text>
              <Text weight={"bold"} className="font-mono">
                {value.toLocaleString()}
              </Text>
            </Flex>
          ) : (
            <Text>No Flea Price</Text>
          );
        },
      }),
      columnHelper.accessor("traderOffers", {
        header: "Best Trader Price",
        size: 180,
        sortUndefined: "last",
        sortingFn: (a, b) => {
          const aPrice = a.original.traderOffers?.[0]?.priceRUB ?? -Infinity;
          const bPrice = b.original.traderOffers?.[0]?.priceRUB ?? -Infinity;
          return aPrice - bPrice;
        },
        cell: (info) => {
          const bestOffer = info.getValue()?.[0];
          const traderImage = bestOffer
            ? getTraderImage(bestOffer.normalizedName)
            : null;
          return bestOffer ? (
            <Flex direction="column" justify={"center"} className="relative">
              <Flex justify={"between"} align={"center"} gap={"1"}>
                <Flex direction="column">
                  <Flex gap="1" align="center" wrap="nowrap">
                    <Text size={"3"} className="text-gray-11">
                      {bestOffer.currency === "RUB"
                        ? "₽"
                        : bestOffer.currency === "USD"
                          ? "$"
                          : bestOffer.currency === "EUR"
                            ? "€"
                            : bestOffer.currency}
                    </Text>
                    <Text
                      weight={"bold"}
                      className="whitespace-nowrap font-mono"
                    >
                      {bestOffer.price.toLocaleString()}
                    </Text>
                  </Flex>
                  <Text size="1" className="whitespace-nowrap text-gray-11">
                    {bestOffer.name} {bestOffer.minTraderLevel}
                  </Text>
                </Flex>
                {traderImage !== null && (
                  <Image
                    src={traderImage}
                    alt={bestOffer.name}
                    width={24}
                    height={24}
                    unoptimized={true}
                  />
                )}
              </Flex>
            </Flex>
          ) : (
            <Text>No Trader Price</Text>
          );
        },
      }),
    ],
    [selectedMod?.id],
  );

  const tableData: ModWithConflicting[] = useMemo(() => {
    const sortedMods = slot.allowedModIds
      .map((modId) => {
        if (!mods[modId]) {
          throw new Error(`Mod with id ${modId} not found`);
        }
        return {
          ...mods[modId],
          isConflicting: moddingUtils.isConflicting(
            selections,
            path.join("-"),
            modId,
          ),
        };
      })
      .sort((a, b) => a.shortName.localeCompare(b.shortName));

    if (selectedMod?.id) {
      const selectedIndex = sortedMods.findIndex(
        (mod) => mod.id === selectedMod?.id,
      );
      if (selectedIndex !== -1) {
        const [selectedMod] = sortedMods.splice(selectedIndex, 1);
        if (selectedMod) {
          sortedMods.unshift(selectedMod);
        }
      }
    }
    return sortedMods;
  }, [
    slot.allowedModIds,
    selectedMod?.id,
    mods,
    moddingUtils,
    selections,
    path,
  ]);

  const filteredTableData = useMemo(() => {
    return tableData.filter((mod) => {
      const normalizedSearchInput = normalizeShortNameSearch(searchInput);
      const nameMatch =
        normalizeShortNameSearch(mod.shortName).includes(
          normalizedSearchInput,
        ) || normalizeShortNameSearch(mod.name).includes(normalizedSearchInput);
      const conflictingFilter = hideConflicting ? !mod.isConflicting : true;
      return nameMatch && conflictingFilter;
    });
  }, [tableData, searchInput, hideConflicting]);

  const table = useReactTable({
    data: filteredTableData,
    columns,
    enableMultiSort: true,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSelectMod = (mod: ModWithConflicting | null) => {
    // We are selecting or removing a valid mod and it is not conflicting
    if (!mod?.isConflicting) {
      dispatch({ type: "updated_selection", path, modId: mod?.id ?? null });
      setIsOpen(false);
      setSearchInput("");
      setSorting([]);
    }
  };

  return (
    <>
      <Card variant="classic" asChild className="p-0">
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer select-none"
        >
          <ModIcon
            iconImageUrl={selectedMod?.iconImageUrl ?? null}
            shortName={selectedMod?.shortName ?? "Empty"}
          />
        </button>
      </Card>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content
          aria-describedby={undefined}
          className="max-w-screen-md"
          onOpenAutoFocus={(event) => {
            if (isMobileDevice()) {
              event.preventDefault();
            }
          }}
        >
          <Dialog.Title className="text-balance" mb={"4"}>
            {slot.name} Mods
          </Dialog.Title>
          <Box mb={"4"}>
            <SearchInput
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              placeholder="Search by name"
            />
          </Box>
          <Flex align="center" mb="4">
            <Checkbox
              size={"3"}
              checked={hideConflicting}
              onCheckedChange={(checked) =>
                setHideConflicting(checked as boolean)
              }
              id="hide-conflicting"
            />
            <Text as="label" htmlFor="hide-conflicting" ml="2" size="2">
              Hide Conflicting
            </Text>
          </Flex>
          <Inset side="x">
            <ScrollArea
              size="2"
              type="auto"
              style={{
                height: "max(calc(100dvh - 355px), 350px)",
                width: "min(calc(100dvw - 32px), 1024px)",
              }}
            >
              {filteredTableData.length === 0 && (
                <Flex align={"center"} justify={"center"} mt={"5"}>
                  <Text weight={"bold"} align={"center"}>
                    No mods found matching search
                  </Text>
                </Flex>
              )}
              {filteredTableData.length > 0 && (
                <Table.Root variant="surface">
                  <Table.Header>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Table.Row key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <Table.ColumnHeaderCell
                            key={header.id}
                            onClick={
                              header.column.getCanSort()
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                            style={{
                              width:
                                header.id === "shortName"
                                  ? "100%"
                                  : header.column.getSize(),
                              minWidth:
                                header.id === "shortName"
                                  ? ""
                                  : header.column.getSize(),
                            }}
                            className={`select-none ${header.column.getCanSort() ? "cursor-pointer hover:bg-accent-1" : ""} `}
                          >
                            <Flex
                              align="center"
                              gap="2"
                              className="whitespace-nowrap"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {{
                                asc: <ArrowUpIcon />,
                                desc: <ArrowDownIcon />,
                              }[header.column.getIsSorted() as string] ??
                                (header.column.getCanSort() && (
                                  <CaretSortIcon />
                                ))}
                            </Flex>
                          </Table.ColumnHeaderCell>
                        ))}
                      </Table.Row>
                    ))}
                  </Table.Header>
                  <Table.Body>
                    {table.getRowModel().rows.map((row) => (
                      <Table.Row
                        key={row.id}
                        onClick={() => handleSelectMod(row.original)}
                        className={`hover:bg-accent-1 ${
                          row.original.id === selectedMod?.id
                            ? "slanted-line-bg cursor-pointer bg-accent-1"
                            : row.original.isConflicting
                              ? "slanted-line-bg cursor-not-allowed select-none bg-tomato-2 hover:bg-tomato-2"
                              : "cursor-pointer"
                        }`}
                        align="center"
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <Table.Cell
                            key={cell.id}
                            className={`relative ${
                              row.original.id === selectedMod?.id && index === 0
                                ? "before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:bg-accent-10"
                                : ""
                            }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              )}
            </ScrollArea>
          </Inset>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button variant={"classic"} onClick={() => handleSelectMod(null)}>
                Remove Mod
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
