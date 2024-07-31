"use client";

import { useState } from "react";
import { FullGun, ModSelectionState } from "@/types";
import { Box, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { ModIcon } from "@/components/modding/mod-icon";
import { toTitleCase } from "@/lib/utils";
import GunStats from "@/components/modding/gun-stats";
import { ModSelectionModal } from "@/components/modding/mod-selection-modal";

// eventually should be able to load a preset and have it populate the state
function initializeState(gun: FullGun): ModSelectionState {
  return Object.fromEntries(
    gun.slots.map((slot) => [slot.id, { modId: null, slots: null }]),
  );
}

export default function GunModding({ gun }: { gun: FullGun }) {
  const [selections, setSelections] = useState<ModSelectionState>(
    initializeState(gun),
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleCloseModal = () => {
    setSelectedSlot(null);
  };

  const handleSelectMod = (modId: string | null) => {
    if (selectedSlot) {
      setSelections((prev) => ({
        ...prev,
        [selectedSlot]: { ...prev[selectedSlot], modId },
      }));
    }
    handleCloseModal();
  };

  return (
    <div>
      <Heading as="h3" size={"5"} mb={"4"} className="text-balance">
        {toTitleCase(gun.name)}
      </Heading>
      <Box mb={"8"}>
        <GunStats
          ergonomics={gun.ergonomics}
          recoilVertical={gun.recoilVertical}
          recoilHorizontal={gun.recoilHorizontal}
        />
      </Box>
      <div>
        <Heading size="3">Modding Slots</Heading>
        <Separator mt={"2"} mb={"4"} size={"4"} />
        <Flex direction={"column"} gap={"4"}>
          {gun.slots.map((slot) => (
            <Flex key={slot.id} align="center" gap="4">
              <Text>{slot.name}:</Text>
              <div onClick={() => handleSlotClick(slot.id)}>
                <ModIcon
                  iconImageUrl={null}
                  shortName={selections[slot.id].modId ? "Mod" : "Empty"}
                />
              </div>
            </Flex>
          ))}
        </Flex>
      </div>
      {selectedSlot && (
        <ModSelectionModal
          isOpen={!!selectedSlot}
          onClose={handleCloseModal}
          slotName={gun.slots.find((s) => s.id === selectedSlot)?.name || ""}
          availableMods={
            gun.slots.find((s) => s.id === selectedSlot)?.allowedMods || []
          }
          onSelectMod={handleSelectMod}
          selections={selections}
          currentSlotId={selectedSlot}
        />
      )}
    </div>
  );
}
