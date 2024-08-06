import {
  Dialog,
  Flex,
  Button,
  Table,
  Text,
  Inset,
  ScrollArea,
} from "@radix-ui/themes";
import { ItemId, Mod, Slot, SlotSelectionNode } from "@/types";
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

type ModSelectorProps = {
  slot: Slot;
  selection: SlotSelectionNode;
  path: string[];
};

type ModWithConflicting = Mod & { isConflicting: boolean };

const columnHelper = createColumnHelper<ModWithConflicting>();

function isConflicting(
  modId: ItemId,
  mods: Record<ItemId, Mod>,
  selections: SlotSelectionNode[],
) {
  const mod = mods[modId];
  let conflicting = false;

  function isConflictingNode(node: SlotSelectionNode): boolean {
    if (node.modId !== null) {
      const selectedMod = mods[node.modId];
      if (
        mod.conflictingModIds.includes(node.modId) ||
        selectedMod.conflictingModIds.includes(modId)
      ) {
        conflicting = true;
      }
    }
    return node.slots.some(isConflictingNode);
  }

  selections.forEach(isConflictingNode);

  return conflicting;
}

export function ModSelector({ slot, selection, path }: ModSelectorProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isOpen, setIsOpen] = useState(false);
  const {
    dispatch,
    mods,
    state: { selections },
  } = useGunModding();

  const columns = useMemo(
    () => [
      columnHelper.accessor("shortName", {
        header: "Mod",
        cell: (info) => (
          <Flex align="center" gap="2" className="min-w-[125px]">
            <ModIcon
              iconImageUrl={info.row.original.iconImageUrl}
              shortName={info.getValue()}
              showShortName={false}
            />
            <Flex direction="column">
              <Text size="2" weight="bold">
                {info.getValue()}{" "}
                {info.row.original.id === selection.modId
                  ? "(Selected)"
                  : info.row.original.isConflicting
                    ? "(Conflicting)"
                    : ""}
              </Text>
              <Text size="1" className="line-clamp-2 text-balance text-gray-11">
                {info.row.original.name}
              </Text>
            </Flex>
          </Flex>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("recoilModifier", {
        header: "Recoil",
        cell: (info) => {
          const value = info.getValue();
          const formattedValue = value > 0 ? `+${value}` : value;
          const textColorClass =
            value < 0 ? "text-jade-11" : value > 0 ? "text-tomato-11" : "";
          return (
            <Text weight={"bold"} className={`font-mono ${textColorClass}`}>
              {formattedValue}
            </Text>
          );
        },
      }),
      columnHelper.accessor("ergonomicsModifier", {
        header: "Ergo",
        cell: (info) => {
          const value = info.getValue();
          const formattedValue = value > 0 ? `+${value}` : value;
          const textColorClass =
            value < 0 ? "text-tomato-11" : value > 0 ? "text-jade-11" : "";
          return (
            <Text weight={"bold"} className={`font-mono ${textColorClass}`}>
              {formattedValue}
            </Text>
          );
        },
      }),
    ],
    [selection.modId],
  );

  const tableData: ModWithConflicting[] = useMemo(() => {
    const sortedMods = slot.allowedModIds
      .map((modId) => {
        return {
          ...mods[modId],
          isConflicting: isConflicting(modId, mods, selections),
        };
      })
      .sort((a, b) => a.shortName.localeCompare(b.shortName));

    if (selection.modId) {
      const selectedIndex = sortedMods.findIndex(
        (mod) => mod.id === selection.modId,
      );
      if (selectedIndex !== -1) {
        const [selectedMod] = sortedMods.splice(selectedIndex, 1);
        sortedMods.unshift(selectedMod);
      }
    }

    return sortedMods;
  }, [mods, selection.modId, selections, slot.allowedModIds]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSelectMod = (mod: ModWithConflicting | null) => {
    if (mod && !mod.isConflicting) {
      dispatch({ type: "updated_selection", path, modId: mod.id });
      setIsOpen(false);
    }
  };

  const selectedMod = selection.modId ? mods[selection.modId] : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer select-none"
      >
        <ModIcon
          iconImageUrl={selectedMod?.iconImageUrl ?? null}
          shortName={selectedMod?.shortName ?? "Empty"}
        />
      </button>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content
          aria-describedby={undefined}
          className="max-w-screen-md"
        >
          <Dialog.Title className="text-balance" mb={"4"}>
            {slot.name} Mods
          </Dialog.Title>
          <Inset side="x">
            <ScrollArea
              size="2"
              type="auto"
              style={{
                height: "max(calc(100dvh - 300px), 425px)",
                width: "min(calc(100dvw - 32px), 1024px)",
              }}
            >
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
                          className={`select-none ${header.column.getCanSort() ? "cursor-pointer hover:bg-accent-1" : ""} `}
                        >
                          <Flex align="center" gap="2">
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
                      className={`cursor-pointer hover:bg-accent-1 ${
                        row.original.id === selection.modId
                          ? "slanted-line-bg bg-accent-1"
                          : row.original.isConflicting
                            ? "cursor-not-allowed select-none bg-tomato-2 hover:bg-tomato-2"
                            : ""
                      }`}
                      align="center"
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <Table.Cell
                          key={cell.id}
                          className={`relative ${
                            row.original.id === selection.modId && index === 0
                              ? "before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:bg-accent-9"
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
