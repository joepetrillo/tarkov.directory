// app/guns/[id]/ModSlotList.tsx
"use client";

import { ModSelectionDialog } from "@/components/modding/mod-selection-dialog";
import { FullSlot, ModPreset } from "@/types";

type ModSlotListProps = {
  gunSlots: FullSlot[];
  modSelections: ModPreset["selections"];
  onModSelect: (slotId: string, modId: string | null) => void;
  isModConflicting: (
    modId: string,
    conflictingSlotIds: string[],
    conflictingModIds: string[],
  ) => boolean;
};

export function ModSlotList({
  gunSlots,
  modSelections,
  onModSelect,
  isModConflicting,
}: ModSlotListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {gunSlots.map((slot) => (
        <ModSelectionDialog
          key={slot.id}
          slot={slot}
          selectedModId={
            modSelections.find((s) => s.slotId === slot.id)?.modId || null
          }
          onSelectMod={onModSelect}
          isModConflicting={isModConflicting}
        />
      ))}
    </div>
  );
}
