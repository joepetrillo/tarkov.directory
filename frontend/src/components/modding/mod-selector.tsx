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
import type {
  OnChangeFn,
  Row,
  SortingState,
  Table as ReactTable,
  Updater,
} from "@tanstack/react-table";
import ModIcon from "@/components/modding/mod-icon";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { CSSProperties, RefObject } from "react";
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

const emptySorting: SortingState = [];
const tableHeaderHeightTolerance = 1;

type ModSelectorState = {
  sorting: SortingState;
  isOpen: boolean;
  searchInput: string;
  hideConflicting: boolean;
  hideLocked: boolean;
  tableHeaderHeight: number;
};

type ModSelectorAction =
  | { type: "set_sorting"; updater: Updater<SortingState> }
  | { type: "set_open"; isOpen: boolean }
  | { type: "set_search_input"; searchInput: string }
  | { type: "set_hide_conflicting"; hideConflicting: boolean }
  | { type: "set_hide_locked"; hideLocked: boolean }
  | { type: "set_table_header_height"; tableHeaderHeight: number }
  | { type: "reset_after_selection" };

const initialModSelectorState: ModSelectorState = {
  sorting: emptySorting,
  isOpen: false,
  searchInput: "",
  hideConflicting: false,
  hideLocked: false,
  tableHeaderHeight: 0,
};

const modSelectorScrollAreaStyle = {
  height: "max(calc(100dvh - 355px), 350px)",
  width: "min(calc(100dvw - 32px), 1024px)",
};

const stickyHeaderCellBoxShadow =
  "inset 0 1px var(--gray-a5), inset 0 -1px var(--gray-a5)";

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

function areSortingStatesEqual(a: SortingState, b: SortingState) {
  return (
    a.length === b.length &&
    a.every(
      (columnSort, index) =>
        columnSort.id === b[index]?.id && columnSort.desc === b[index]?.desc,
    )
  );
}

function modSelectorReducer(
  state: ModSelectorState,
  action: ModSelectorAction,
): ModSelectorState {
  switch (action.type) {
    case "set_sorting": {
      const sorting = getNextModSelectorSorting(action.updater, state.sorting);
      return areSortingStatesEqual(state.sorting, sorting)
        ? state
        : { ...state, sorting };
    }
    case "set_open":
      return state.isOpen === action.isOpen
        ? state
        : { ...state, isOpen: action.isOpen };
    case "set_search_input":
      return state.searchInput === action.searchInput
        ? state
        : { ...state, searchInput: action.searchInput };
    case "set_hide_conflicting":
      return state.hideConflicting === action.hideConflicting
        ? state
        : { ...state, hideConflicting: action.hideConflicting };
    case "set_hide_locked":
      return state.hideLocked === action.hideLocked
        ? state
        : { ...state, hideLocked: action.hideLocked };
    case "set_table_header_height":
      return Math.abs(state.tableHeaderHeight - action.tableHeaderHeight) <=
        tableHeaderHeightTolerance
        ? state
        : { ...state, tableHeaderHeight: action.tableHeaderHeight };
    case "reset_after_selection":
      return {
        ...state,
        isOpen: false,
        searchInput: "",
        sorting: emptySorting,
      };
    default:
      return state;
  }
}

export default function ModSelector(props: ModSelectorProps) {
  const {
    isOpen,
    searchInput,
    hideConflicting,
    hideLocked,
    sorting,
    table,
    tableRows,
    filteredTableDataLength,
    scrollAreaRef,
    tableHeaderRef,
    scrollAreaScrollbarStyle,
    handleSelectMod,
    handleOpenChange,
    handleSearchInputChange,
    handleHideConflictingChange,
    handleHideLockedChange,
    handleOpenSelector,
  } = useModSelectorModel(props);

  return (
    <>
      <ModSelectorTrigger
        selectedMod={props.selectedMod}
        onOpen={handleOpenSelector}
      />
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
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
            {props.slot.name} Mods
          </Dialog.Title>
          <ModSelectorFilters
            searchInput={searchInput}
            setSearchInput={handleSearchInputChange}
            hideConflicting={hideConflicting}
            hideLocked={hideLocked}
            onHideConflictingChange={handleHideConflictingChange}
            onHideLockedChange={handleHideLockedChange}
          />
          <ModSelectorTableView
            table={table}
            tableRows={tableRows}
            sorting={sorting}
            filteredTableDataLength={filteredTableDataLength}
            scrollAreaRef={scrollAreaRef}
            tableHeaderRef={tableHeaderRef}
            scrollAreaScrollbarStyle={scrollAreaScrollbarStyle}
            onSelectMod={handleSelectMod}
          />
          <ModSelectorActions onRemoveMod={() => handleSelectMod(null)} />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

function useModSelectorModel({ slot, selectedMod, path }: ModSelectorProps) {
  const [modSelectorState, modSelectorDispatch] = useReducer(
    modSelectorReducer,
    initialModSelectorState,
  );
  const {
    sorting,
    isOpen,
    searchInput,
    hideConflicting,
    hideLocked,
    tableHeaderHeight,
  } = modSelectorState;
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const tableHeaderRef = useRef<HTMLTableSectionElement | null>(null);
  const previousSortingRef = useRef<SortingState>(sorting);
  const {
    state: { selections },
    dispatch: gunModdingDispatch,
    mods,
    moddingUtils,
  } = useGunModding();
  const { traderLevels } = useTraderLevels();

  const tableData: ModSelectorTableRow[] = useMemo(() => {
    const sortedMods: ModSelectorTableRow[] = [];

    for (const modId of slot.allowedModIds) {
      const mod = mods[modId];
      if (!mod) {
        throw new Error(`Mod with id ${modId} not found`);
      }

      const traderPrice = getTraderPriceStatus(mod.traderOffers, traderLevels);
      sortedMods.push({
        ...mod,
        isSelected: modId === selectedMod?.id,
        traderPrice,
        traderAvailabilityRank: traderPriceStatusSortRank[traderPrice.status],
        isConflicting: moddingUtils.isConflicting(selections, path, modId),
      });
    }

    sortedMods.sort((a, b) => a.shortName.localeCompare(b.shortName));

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
      modSelectorDispatch({ type: "set_sorting", updater });
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

  const updateTableHeaderHeight = useCallback(() => {
    const nextTableHeaderHeight =
      tableHeaderRef.current?.getBoundingClientRect().height ?? 0;

    modSelectorDispatch({
      type: "set_table_header_height",
      tableHeaderHeight: nextTableHeaderHeight,
    });
  }, []);
  const updateTableHeaderHeightRef = useRef(updateTableHeaderHeight);
  updateTableHeaderHeightRef.current = updateTableHeaderHeight;

  useLayoutEffect(() => {
    if (!isOpen) {
      modSelectorDispatch({
        type: "set_table_header_height",
        tableHeaderHeight: 0,
      });
      return;
    }

    const updateTableHeaderHeightFromRef = () => {
      updateTableHeaderHeightRef.current();
    };

    updateTableHeaderHeightFromRef();
    const animationFrameId = window.requestAnimationFrame(
      updateTableHeaderHeightFromRef,
    );
    const tableHeaderElement = tableHeaderRef.current;

    if (!tableHeaderElement) {
      return () => window.cancelAnimationFrame(animationFrameId);
    }

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateTableHeaderHeightFromRef);

    resizeObserver?.observe(tableHeaderElement);
    window.addEventListener("resize", updateTableHeaderHeightFromRef);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateTableHeaderHeightFromRef);
    };
  }, [filteredTableData.length, isOpen, sorting]);

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
  }, [isOpen, sorting]);

  const handleSelectMod = useCallback(
    (mod: ModSelectorTableRow | null) => {
      // We are selecting or removing a valid mod and it is not conflicting
      if (!mod?.isConflicting) {
        gunModdingDispatch({
          type: "updated_selection",
          path,
          modId: mod?.id ?? null,
        });
        modSelectorDispatch({ type: "reset_after_selection" });
      }
    },
    [gunModdingDispatch, path],
  );

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    modSelectorDispatch({ type: "set_open", isOpen: nextIsOpen });
  }, []);

  const handleSearchInputChange = useCallback((nextSearchInput: string) => {
    modSelectorDispatch({
      type: "set_search_input",
      searchInput: nextSearchInput,
    });
  }, []);

  const handleHideConflictingChange = useCallback(
    (checked: boolean | "indeterminate") => {
      modSelectorDispatch({
        type: "set_hide_conflicting",
        hideConflicting: checked === true,
      });
    },
    [],
  );

  const handleHideLockedChange = useCallback(
    (checked: boolean | "indeterminate") => {
      modSelectorDispatch({
        type: "set_hide_locked",
        hideLocked: checked === true,
      });
    },
    [],
  );

  const handleOpenSelector = useCallback(() => {
    modSelectorDispatch({ type: "set_open", isOpen: true });
  }, []);

  return {
    isOpen,
    searchInput,
    hideConflicting,
    hideLocked,
    sorting,
    table,
    tableRows,
    filteredTableDataLength: filteredTableData.length,
    scrollAreaRef,
    tableHeaderRef,
    scrollAreaScrollbarStyle,
    handleSelectMod,
    handleOpenChange,
    handleSearchInputChange,
    handleHideConflictingChange,
    handleHideLockedChange,
    handleOpenSelector,
  };
}

function ModSelectorTrigger({
  selectedMod,
  onOpen,
}: {
  selectedMod: Mod | null;
  onOpen: () => void;
}) {
  return (
    <Card variant="classic" asChild className="p-0">
      <button onClick={onOpen} className="cursor-pointer select-none">
        <ModIcon
          iconImageUrl={selectedMod?.iconImageUrl ?? null}
          shortName={selectedMod?.shortName ?? "Empty"}
        />
      </button>
    </Card>
  );
}

function ModSelectorFilters({
  searchInput,
  setSearchInput,
  hideConflicting,
  hideLocked,
  onHideConflictingChange,
  onHideLockedChange,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
  hideConflicting: boolean;
  hideLocked: boolean;
  onHideConflictingChange: (checked: boolean | "indeterminate") => void;
  onHideLockedChange: (checked: boolean | "indeterminate") => void;
}) {
  return (
    <>
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
            onCheckedChange={onHideConflictingChange}
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
            onCheckedChange={onHideLockedChange}
            id="hide-locked"
          />
          <Text as="label" htmlFor="hide-locked" ml="2" size="2">
            Hide Locked
          </Text>
        </Flex>
      </Flex>
    </>
  );
}

function ModSelectorTableView({
  table,
  tableRows,
  sorting,
  filteredTableDataLength,
  scrollAreaRef,
  tableHeaderRef,
  scrollAreaScrollbarStyle,
  onSelectMod,
}: {
  table: ReactTable<ModSelectorTableRow>;
  tableRows: Row<ModSelectorTableRow>[];
  sorting: SortingState;
  filteredTableDataLength: number;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  tableHeaderRef: RefObject<HTMLTableSectionElement | null>;
  scrollAreaScrollbarStyle: ModSelectorScrollAreaStyle;
  onSelectMod: (mod: ModSelectorTableRow | null) => void;
}) {
  const visibleSortingCount = getVisibleSorting(sorting).length;

  return (
    <Inset side="x">
      <Box className="relative" style={modSelectorScrollAreaStyle}>
        <ScrollArea
          ref={scrollAreaRef}
          className="[&_.rt-ScrollAreaCorner]:relative [&_.rt-ScrollAreaCorner]:z-30 [&_.rt-ScrollAreaScrollbar]:relative [&_.rt-ScrollAreaScrollbar]:z-30 [&_.rt-ScrollAreaViewport]:overscroll-none"
          style={scrollAreaScrollbarStyle}
          size="2"
          type="auto"
        >
          {filteredTableDataLength === 0 && (
            <Flex align={"center"} justify={"center"} mt={"5"}>
              <Text weight={"bold"} align={"center"}>
                No mods found matching filters
              </Text>
            </Flex>
          )}
          {filteredTableDataLength > 0 && (
            <Table.Root
              variant="surface"
              className="!border-t-0 [&_.rt-ScrollAreaRoot]:!overflow-visible [&_.rt-ScrollAreaViewport]:!overflow-visible [&_.rt-TableRootTable]:!table [&_.rt-TableRootTable]:!overflow-visible"
            >
              <ModSelectorTableHeader
                table={table}
                sorting={sorting}
                visibleSortingCount={visibleSortingCount}
                tableHeaderRef={tableHeaderRef}
              />
              <ModSelectorTableBody
                tableRows={tableRows}
                onSelectMod={onSelectMod}
              />
            </Table.Root>
          )}
        </ScrollArea>
      </Box>
    </Inset>
  );
}

function ModSelectorTableHeader({
  table,
  sorting,
  visibleSortingCount,
  tableHeaderRef,
}: {
  table: ReactTable<ModSelectorTableRow>;
  sorting: SortingState;
  visibleSortingCount: number;
  tableHeaderRef: RefObject<HTMLTableSectionElement | null>;
}) {
  return (
    <Table.Header ref={tableHeaderRef}>
      {table.getHeaderGroups().map((headerGroup) => (
        <Table.Row key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sortDirection = header.column.getIsSorted();
            const visibleSortIndex =
              header.column.getSortIndex() === -1
                ? -1
                : getVisibleSortIndex(sorting, header.column.id);

            return (
              <Table.ColumnHeaderCell
                key={header.id}
                translate="no"
                onClick={
                  canSort ? header.column.getToggleSortingHandler() : undefined
                }
                style={{
                  width:
                    header.id === "shortName"
                      ? "100%"
                      : header.column.getSize(),
                  minWidth:
                    header.id === "shortName" ? "" : header.column.getSize(),
                  boxShadow: stickyHeaderCellBoxShadow,
                }}
                className={`sticky top-0 z-20 select-none !bg-gray-3 ${canSort ? "cursor-pointer hover:!bg-accent-2" : ""}`}
              >
                <Flex align="center" gap="2" className="whitespace-nowrap">
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
                  {visibleSortingCount > 1 && visibleSortIndex !== -1 && (
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
  );
}

function ModSelectorTableBody({
  tableRows,
  onSelectMod,
}: {
  tableRows: Row<ModSelectorTableRow>[];
  onSelectMod: (mod: ModSelectorTableRow | null) => void;
}) {
  return (
    <Table.Body>
      {tableRows.map((row) => (
        <Table.Row
          key={row.id}
          onClick={() => onSelectMod(row.original)}
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
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </Table.Body>
  );
}

function ModSelectorActions({ onRemoveMod }: { onRemoveMod: () => void }) {
  return (
    <Flex gap="3" mt="4" justify="end">
      <Dialog.Close>
        <Button variant="soft" color="gray">
          Cancel
        </Button>
      </Dialog.Close>
      <Dialog.Close>
        <Button variant={"classic"} onClick={onRemoveMod}>
          Remove Mod
        </Button>
      </Dialog.Close>
    </Flex>
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
