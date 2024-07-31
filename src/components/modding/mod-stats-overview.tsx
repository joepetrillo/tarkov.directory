// app/guns/[id]/ModEffectsSummary.tsx
"use client";

import { ModPreset, FullGun } from "@/types";

type ModEffectsSummaryProps = {
  gun: FullGun;
  modSelections: ModPreset["selections"];
};

export function ModStatsOverview({
  gun,
  modSelections,
}: ModEffectsSummaryProps) {
  const calculateEffects = () => {
    let totalRecoilMod = 0;
    let totalErgoMod = 0;

    modSelections.forEach((selection) => {
      const slot = gun.slots.find((s) => s.id === selection.slotId);
      const mod = slot?.allowedMods.find((m) => m.id === selection.modId);
      if (mod) {
        totalRecoilMod += mod.recoilModifier;
        totalErgoMod += mod.ergonomicsModifier;
      }
    });

    return {
      recoil: {
        vertical: Math.max(gun.recoilVertical + totalRecoilMod, 0),
        horizontal: Math.max(gun.recoilHorizontal + totalRecoilMod, 0),
      },
      ergonomics: Math.max(gun.ergonomics + totalErgoMod, 0),
    };
  };

  const effects = calculateEffects();

  return (
    <div className="bg-gray-100 rounded mt-4 p-4">
      <h3 className="font-semibold mb-2">Modding Effects</h3>
      <p>
        Recoil: {effects.recoil.vertical.toFixed(2)} (vertical) /{" "}
        {effects.recoil.horizontal.toFixed(2)} (horizontal)
      </p>
      <p>Ergonomics: {effects.ergonomics.toFixed(2)}</p>
    </div>
  );
}
