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
import { ModIcon } from "@/components/modding/mod-icon";
import { useMemo, useState } from "react";
import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from "@radix-ui/react-icons";
import { useGunModding } from "@/contexts/gun-modding.context";
import SearchInput from "@/components/ui/search-input";
import { isMobileDevice, normalizeShortNameSearch } from "@/lib/utils";

type ModSelectorProps = {
  slot: Slot;
  selectedMod: Mod | null;
  path: string[];
};

type ModWithConflicting = Mod & { isConflicting: boolean };

const columnHelper = createColumnHelper<ModWithConflicting>();

export function ModSelector({ slot, selectedMod, path }: ModSelectorProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
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
      columnHelper.accessor("avgFleaMarketPrice", {
        header: "Price (RUB)",
        size: 150,
        cell: (info) => {
          const value = info.getValue();
          return value ? (
            <Flex gap="1" align={"center"} wrap={"nowrap"}>
              <Text size={"1"} className="text-gray-11">
                ₽
              </Text>
              <Text className="font-mono">{value.toLocaleString()}</Text>
            </Flex>
          ) : (
            <Text className="font-mono">N/A</Text>
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
      return (
        normalizeShortNameSearch(mod.shortName).includes(
          normalizedSearchInput,
        ) || normalizeShortNameSearch(mod.name).includes(normalizedSearchInput)
      );
    });
  }, [tableData, searchInput]);

  const table = useReactTable({
    data: filteredTableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSelectMod = (mod: ModWithConflicting | null) => {
    // We are selecting a valid mod and it is not conflicting
    if (mod && !mod.isConflicting) {
      dispatch({ type: "updated_selection", path, modId: mod.id });
      setIsOpen(false);
      setSearchInput("");
    }

    // We are requesting to remove the mod
    if (mod === null) {
      dispatch({ type: "updated_selection", path, modId: null });
      setIsOpen(false);
      setSearchInput("");
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
          <Inset side="x">
            <ScrollArea
              size="2"
              type="auto"
              style={{
                height: "max(calc(100dvh - 325px), 370px)",
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
                              {header.column.getCanSort() &&
                                (header.column.getIsSorted() ? (
                                  header.column.getIsSorted() === "asc" ? (
                                    <CaretUpIcon />
                                  ) : (
                                    <CaretDownIcon />
                                  )
                                ) : (
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
