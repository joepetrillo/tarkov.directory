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
  Badge,
} from "@radix-ui/themes";
import type { Mod, Slot } from "@tarkov.directory/shared-types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import ModIcon from "@/components/modding/mod-icon";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { useGunModding } from "@/contexts/gun-modding.context";
import { useTraderLevels } from "@/contexts/trader-levels.context";
import SearchInput from "@/components/ui/search-input";
import {
  getTraderImage,
  isMobileDevice,
  normalizeShortNameSearch,
} from "@/lib/utils";
import Image from "next/image";
import {
  getCurrencySymbol,
  getTraderPriceStatus,
  type TraderPriceStatus,
} from "@/lib/trader-pricing";
import {
  getNextModSelectorSorting,
  getVisibleSortIndex,
  getVisibleSorting,
  TRADER_AVAILABILITY_RANK_COLUMN_ID,
  TRADER_PRICE_COLUMN_ID,
} from "@/lib/mod-selector-sorting";

type ModSelectorProps = {
  slot: Slot;
  selectedMod: Mod | null;
  path: string[];
};

type ModSelectorTableRow = Mod & {
  isSelected: boolean;
  isConflicting: boolean;
  traderPrice: TraderPriceStatus;
  traderAvailabilityRank: number;
};

type ScrollEdges = {
  canScrollUp: boolean;
  canScrollDown: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

type ModSelectorScrollAreaStyle = CSSProperties & {
  "--scrollarea-scrollbar-vertical-margin-top"?: string;
  "--scrollarea-scrollbar-vertical-margin-bottom"?: string;
};

const columnHelper = createColumnHelper<ModSelectorTableRow>();

const traderPriceStatusSortRank: Record<TraderPriceStatus["status"], number> = {
  available: 0,
  locked: 1,
  none: 2,
};

const modSelectorColumnVisibility = {
  [TRADER_AVAILABILITY_RANK_COLUMN_ID]: false,
};

const scrollEdgeTolerance = 1;

const emptyScrollEdges: ScrollEdges = {
  canScrollUp: false,
  canScrollDown: false,
  canScrollLeft: false,
  canScrollRight: false,
};

const topScrollFadeStyle = {
  background: "linear-gradient(to bottom, var(--color-panel), transparent)",
};

const bottomScrollFadeStyle = {
  background: "linear-gradient(to top, var(--color-panel), transparent)",
};

const leftScrollFadeStyle = {
  background: "linear-gradient(to right, var(--color-panel), transparent)",
};

const rightScrollFadeStyle = {
  background: "linear-gradient(to left, var(--color-panel), transparent)",
};

const modSelectorScrollAreaStyle = {
  height: "max(calc(100dvh - 355px), 350px)",
  width: "min(calc(100dvw - 32px), 1024px)",
};

const stickyHeaderCellBoxShadow =
  "inset 0 1px var(--gray-a5), inset 0 -1px var(--gray-a5)";
const tableBorderInset = 1;

const modSelectorColumns = [
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
            {info.row.original.isSelected
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
    sortDescFirst: false,
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
  columnHelper.accessor("traderAvailabilityRank", {
    id: TRADER_AVAILABILITY_RANK_COLUMN_ID,
    header: "Trader Availability",
  }),
  columnHelper.accessor((mod) => mod.traderPrice.sortPriceRUB, {
    id: TRADER_PRICE_COLUMN_ID,
    header: "Best Trader Price",
    size: 230,
    sortDescFirst: false,
    sortUndefined: "last",
    cell: (info) => {
      return <TraderPriceCell traderPrice={info.row.original.traderPrice} />;
    },
  }),
];

function getModSelectorRowId(row: ModSelectorTableRow) {
  return row.id;
}

function getScrollEdges(element: HTMLDivElement): ScrollEdges {
  return {
    canScrollUp: element.scrollTop > scrollEdgeTolerance,
    canScrollDown:
      element.scrollHeight - element.clientHeight - element.scrollTop >
      scrollEdgeTolerance,
    canScrollLeft: element.scrollLeft > scrollEdgeTolerance,
    canScrollRight:
      element.scrollWidth - element.clientWidth - element.scrollLeft >
      scrollEdgeTolerance,
  };
}

function areScrollEdgesEqual(a: ScrollEdges, b: ScrollEdges) {
  return (
    a.canScrollUp === b.canScrollUp &&
    a.canScrollDown === b.canScrollDown &&
    a.canScrollLeft === b.canScrollLeft &&
    a.canScrollRight === b.canScrollRight
  );
}

function areSortingStatesEqual(a: SortingState, b: SortingState) {
  return (
    a.length === b.length &&
    a.every(
      (columnSort, index) =>
        columnSort.id === b[index]?.id && columnSort.desc === b[index]?.desc,
    )
  );
}

export default function ModSelector({
  slot,
  selectedMod,
  path,
}: ModSelectorProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [hideConflicting, setHideConflicting] = useState(false);
  const [hideLocked, setHideLocked] = useState(false);
  const [scrollEdges, setScrollEdges] = useState<ScrollEdges>(emptyScrollEdges);
  const [tableHeaderHeight, setTableHeaderHeight] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const tableHeaderRef = useRef<HTMLTableSectionElement | null>(null);
  const previousSortingRef = useRef<SortingState>(sorting);
  const {
    state: { selections },
    dispatch,
    mods,
    moddingUtils,
  } = useGunModding();
  const { traderLevels } = useTraderLevels();

  const tableData: ModSelectorTableRow[] = useMemo(() => {
    const sortedMods = slot.allowedModIds
      .map((modId) => {
        if (!mods[modId]) {
          throw new Error(`Mod with id ${modId} not found`);
        }
        const traderPrice = getTraderPriceStatus(
          mods[modId].traderOffers,
          traderLevels,
        );
        return {
          ...mods[modId],
          isSelected: modId === selectedMod?.id,
          traderPrice,
          traderAvailabilityRank: traderPriceStatusSortRank[traderPrice.status],
          isConflicting: moddingUtils.isConflicting(selections, path, modId),
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
    traderLevels,
  ]);

  const filteredTableData = useMemo(() => {
    const normalizedSearchInput = normalizeShortNameSearch(searchInput);

    return tableData.filter((mod) => {
      const nameMatch =
        normalizeShortNameSearch(mod.shortName).includes(
          normalizedSearchInput,
        ) || normalizeShortNameSearch(mod.name).includes(normalizedSearchInput);
      const conflictingFilter = hideConflicting ? !mod.isConflicting : true;
      const lockedFilter = hideLocked
        ? mod.traderPrice.status !== "locked"
        : true;
      return nameMatch && conflictingFilter && lockedFilter;
    });
  }, [tableData, searchInput, hideConflicting, hideLocked]);

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      setSorting((currentSorting) =>
        getNextModSelectorSorting(updater, currentSorting),
      );
    },
    [],
  );

  const tableState = useMemo(
    () => ({
      sorting,
      columnVisibility: modSelectorColumnVisibility,
    }),
    [sorting],
  );

  const table = useReactTable({
    data: filteredTableData,
    columns: modSelectorColumns,
    enableMultiSort: true,
    state: tableState,
    onSortingChange: handleSortingChange,
    getRowId: getModSelectorRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const tableRows = table.getRowModel().rows;
  const visibleSortingCount = getVisibleSorting(sorting).length;
  const scrollAreaScrollbarStyle = useMemo<ModSelectorScrollAreaStyle>(
    () => ({
      "--scrollarea-scrollbar-vertical-margin-top":
        tableHeaderHeight > 0
          ? `calc(${tableHeaderHeight}px + var(--space-1))`
          : undefined,
      "--scrollarea-scrollbar-vertical-margin-bottom": "var(--space-1)",
    }),
    [tableHeaderHeight],
  );

  const updateScrollEdges = useCallback(() => {
    const scrollElement = scrollAreaRef.current;
    const nextScrollEdges = scrollElement
      ? getScrollEdges(scrollElement)
      : emptyScrollEdges;

    setScrollEdges((currentScrollEdges) =>
      areScrollEdgesEqual(currentScrollEdges, nextScrollEdges)
        ? currentScrollEdges
        : nextScrollEdges,
    );
  }, []);

  const updateTableHeaderHeight = useCallback(() => {
    const nextTableHeaderHeight =
      tableHeaderRef.current?.getBoundingClientRect().height ?? 0;

    setTableHeaderHeight((currentTableHeaderHeight) =>
      Math.abs(currentTableHeaderHeight - nextTableHeaderHeight) <=
      scrollEdgeTolerance
        ? currentTableHeaderHeight
        : nextTableHeaderHeight,
    );
  }, []);

  const updateScrollMeasurements = useCallback(() => {
    updateScrollEdges();
    updateTableHeaderHeight();
  }, [updateScrollEdges, updateTableHeaderHeight]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setScrollEdges((currentScrollEdges) =>
        areScrollEdgesEqual(currentScrollEdges, emptyScrollEdges)
          ? currentScrollEdges
          : emptyScrollEdges,
      );
      setTableHeaderHeight(0);
      return;
    }

    const scrollElement = scrollAreaRef.current;
    updateScrollMeasurements();
    const animationFrameId = window.requestAnimationFrame(
      updateScrollMeasurements,
    );

    if (!scrollElement) {
      return () => window.cancelAnimationFrame(animationFrameId);
    }

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateScrollMeasurements);
    const contentElement = scrollElement.firstElementChild;
    const tableHeaderElement = tableHeaderRef.current;

    resizeObserver?.observe(scrollElement);
    if (contentElement instanceof HTMLElement) {
      resizeObserver?.observe(contentElement);
    }
    if (tableHeaderElement) {
      resizeObserver?.observe(tableHeaderElement);
    }
    window.addEventListener("resize", updateScrollMeasurements);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScrollMeasurements);
    };
  }, [filteredTableData.length, isOpen, sorting, updateScrollMeasurements]);

  useLayoutEffect(() => {
    const previousSorting = previousSortingRef.current;
    previousSortingRef.current = sorting;

    if (!isOpen || areSortingStatesEqual(previousSorting, sorting)) {
      return;
    }

    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    updateScrollEdges();
  }, [isOpen, sorting, updateScrollEdges]);

  const handleSelectMod = (mod: ModSelectorTableRow | null) => {
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
          translate="no"
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
          <Flex align="center" gap="4" mb="4" wrap="wrap">
            <Flex align="center">
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
            <Flex align="center">
              <Checkbox
                size={"3"}
                checked={hideLocked}
                onCheckedChange={(checked) => setHideLocked(checked as boolean)}
                id="hide-locked"
              />
              <Text as="label" htmlFor="hide-locked" ml="2" size="2">
                Hide Locked
              </Text>
            </Flex>
          </Flex>
          <Inset side="x">
            <Box className="relative" style={modSelectorScrollAreaStyle}>
              <ScrollArea
                ref={scrollAreaRef}
                onScroll={updateScrollEdges}
                className="[&_.rt-ScrollAreaCorner]:relative [&_.rt-ScrollAreaCorner]:z-30 [&_.rt-ScrollAreaScrollbar]:relative [&_.rt-ScrollAreaScrollbar]:z-30 [&_.rt-ScrollAreaViewport]:overscroll-none"
                style={scrollAreaScrollbarStyle}
                size="2"
                type="auto"
              >
                {filteredTableData.length === 0 && (
                  <Flex align={"center"} justify={"center"} mt={"5"}>
                    <Text weight={"bold"} align={"center"}>
                      No mods found matching filters
                    </Text>
                  </Flex>
                )}
                {filteredTableData.length > 0 && (
                  <Table.Root
                    variant="surface"
                    className="!border-t-0 [&_.rt-ScrollAreaRoot]:!overflow-visible [&_.rt-ScrollAreaViewport]:!overflow-visible [&_.rt-TableRootTable]:!table [&_.rt-TableRootTable]:!overflow-visible"
                  >
                    <Table.Header ref={tableHeaderRef}>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <Table.Row key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            const canSort = header.column.getCanSort();
                            const sortDirection = header.column.getIsSorted();
                            const visibleSortIndex =
                              header.column.getSortIndex() === -1
                                ? -1
                                : getVisibleSortIndex(
                                    sorting,
                                    header.column.id,
                                  );

                            return (
                              <Table.ColumnHeaderCell
                                key={header.id}
                                translate="no"
                                onClick={
                                  canSort
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
                                  boxShadow: stickyHeaderCellBoxShadow,
                                }}
                                className={`sticky top-0 z-20 select-none !bg-gray-3 ${canSort ? "cursor-pointer hover:!bg-accent-2" : ""}`}
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
                                  {sortDirection === "asc" ? (
                                    <ArrowUpIcon />
                                  ) : sortDirection === "desc" ? (
                                    <ArrowDownIcon />
                                  ) : (
                                    canSort && <CaretSortIcon />
                                  )}
                                  {visibleSortingCount > 1 &&
                                    visibleSortIndex !== -1 && (
                                      <Badge
                                        color="gray"
                                        variant="soft"
                                        size="1"
                                        className="font-mono"
                                      >
                                        {visibleSortIndex + 1}
                                      </Badge>
                                    )}
                                </Flex>
                              </Table.ColumnHeaderCell>
                            );
                          })}
                        </Table.Row>
                      ))}
                    </Table.Header>
                    <Table.Body>
                      {tableRows.map((row) => (
                        <Table.Row
                          key={row.id}
                          onClick={() => handleSelectMod(row.original)}
                          className={`hover:bg-accent-1 ${
                            row.original.isSelected
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
                                row.original.isSelected && index === 0
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
              {scrollEdges.canScrollUp && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-10 h-8"
                  style={{
                    ...topScrollFadeStyle,
                    left: tableBorderInset,
                    right: tableBorderInset,
                    top: tableHeaderHeight,
                  }}
                />
              )}
              {scrollEdges.canScrollDown && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-10 h-8"
                  style={{
                    ...bottomScrollFadeStyle,
                    bottom: 0,
                    left: tableBorderInset,
                    right: tableBorderInset,
                  }}
                />
              )}
              {scrollEdges.canScrollLeft && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-10 w-8"
                  style={{
                    ...leftScrollFadeStyle,
                    bottom: tableBorderInset,
                    left: tableBorderInset,
                    top: tableHeaderHeight,
                  }}
                />
              )}
              {scrollEdges.canScrollRight && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-10 w-8"
                  style={{
                    ...rightScrollFadeStyle,
                    bottom: tableBorderInset,
                    right: tableBorderInset,
                    top: tableHeaderHeight,
                  }}
                />
              )}
            </Box>
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

function TraderPriceCell({ traderPrice }: { traderPrice: TraderPriceStatus }) {
  if (traderPrice.status === "none") {
    return <Text>No Trader Price</Text>;
  }

  const { offer } = traderPrice;
  const traderImage = getTraderImage(offer.normalizedName);
  const isLocked = traderPrice.status === "locked";

  return (
    <Flex
      direction="column"
      justify={"center"}
      className={isLocked ? "text-gray-11" : ""}
    >
      <Flex justify={"start"} align={"center"} gap={"2"}>
        <Image
          src={traderImage}
          alt={offer.name}
          width={24}
          height={24}
          unoptimized={true}
        />
        <Flex direction="column">
          <Flex gap="1" align="center" wrap="nowrap">
            <Text size={"3"} className="text-gray-11">
              {getCurrencySymbol(offer.currency)}
            </Text>
            <Text weight={"bold"} className="whitespace-nowrap font-mono">
              {offer.price.toLocaleString()}
            </Text>
            {isLocked && (
              <Badge color="tomato" variant="surface" size={"1"}>
                Locked
              </Badge>
            )}
          </Flex>
          <Text size="1" className="whitespace-nowrap text-gray-11">
            {isLocked ? "Requires " : ""}
            {offer.name} {offer.minTraderLevel}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
