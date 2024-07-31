// app/guns/[id]/SelectedModsSummary.tsx
"use client";

import { ModPreset, FullSlot } from "@/types";

type SelectedModsSummaryProps = {
  modSelections: ModPreset["selections"];
  gunSlots: FullSlot[];
};

export function ModSelectionOverview({
  modSelections,
  gunSlots,
}: SelectedModsSummaryProps) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Selected Mods</h3>
      <ul>
        {modSelections.map((selection) => {
          const slot = gunSlots.find((s) => s.id === selection.slotId);
          const mod = slot?.allowedMods.find((m) => m.id === selection.modId);
          return mod ? (
            <li key={selection.slotId}>
              {slot?.name}: {mod.name}
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}
