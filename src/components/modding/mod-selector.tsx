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
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from "@radix-ui/react-icons";

type ModSelectionProps = {
  slot: Slot;
  mods: Record<ItemId, Mod>;
  selection: SlotSelectionNode;
  setSelections: Dispatch<SetStateAction<SlotSelectionNode[]>>;
  path: string[];
};

const columnHelper = createColumnHelper<Mod>();

const columns = [
  columnHelper.accessor("shortName", {
    header: "Mod",
    cell: (info) => (
      <Flex align="center" gap="2" className="min-w-[125px]">
        <ModIcon
          iconImageUrl={info.row.original.iconImageUrl}
          shortName={info.getValue()}
        />
        <Flex direction="column">
          <Text size="2" weight="bold">
            {info.getValue()}
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
];

export function ModSelector({
  slot,
  mods,
  selection,
  setSelections,
  path,
}: ModSelectionProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isOpen, setIsOpen] = useState(false);

  const tableData = useMemo(() => {
    return slot.allowedModIds.map((modId) => mods[modId]);
  }, [mods, slot.allowedModIds]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSelectMod = (slotId: string, modId: string | null) => {
    setSelections((prevSelections) => {
      const updateSlotRecursive = (
        slots: SlotSelectionNode[],
        currentPath: string[],
      ): SlotSelectionNode[] => {
        if (currentPath.length === 0) {
          return slots.map((slot) => {
            if (slot.nameId === slotId) {
              const selectedMod = modId ? mods[modId] : null;
              return {
                ...slot,
                selectedModId: modId,
                slots: selectedMod
                  ? selectedMod.slots.map((s) => ({
                      ...s,
                      selectedModId: null,
                      slots: null,
                    }))
                  : null,
              };
            }
            return slot;
          });
        }

        return slots.map((slot) => {
          if (slot.nameId === currentPath[0]) {
            return {
              ...slot,
              slots: slot.slots
                ? updateSlotRecursive(slot.slots, currentPath.slice(1))
                : null,
            };
          }
          return slot;
        });
      };

      return updateSlotRecursive(prevSelections, path);
    });
    setIsOpen(false);
  };

  const getSelectedMod = () => {
    const modId = selection.selectedModId;
    if (!modId) return null;
    return mods[modId];
  };

  const selectedMod = getSelectedMod();

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
      <Dialog.Root open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
        <Dialog.Content
          aria-describedby={undefined}
          className="max-w-screen-md"
        >
          <Dialog.Title className="text-balance">{slot.name} Mods</Dialog.Title>
          <Inset side={"x"}>
            <ScrollArea
              size={"2"}
              style={{
                height: "max(calc(100dvh - 300px), 450px)",
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
                      onClick={() =>
                        handleSelectMod(selection.nameId, row.original.id)
                      }
                      className={`cursor-pointer hover:bg-accent-1 ${row.original.id === selection.selectedModId ? "bg-accent-1" : ""}`}
                      align={"center"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Table.Cell key={cell.id}>
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
              <Button onClick={() => handleSelectMod(selection.nameId, null)}>
                Remove Mod
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
