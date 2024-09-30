// This file contains utility functions that are used throughout the application
import prapor from "@/components/modding/images/prapor.webp";
import therapist from "@/components/modding/images/therapist.webp";
import skier from "@/components/modding/images/skier.webp";
import peacekeeper from "@/components/modding/images/peacekeeper.webp";
import mechanic from "@/components/modding/images/mechanic.webp";
import ragman from "@/components/modding/images/ragman.webp";
import jaeger from "@/components/modding/images/jaeger.webp";
import fence from "@/components/modding/images/fence.webp";
import lightkeeper from "@/components/modding/images/lightkeeper.webp";
import unknown from "@/components/modding/images/unknown-trader.webp";
import { StaticImageData } from "next/image";
import {
  GunModdingContextType,
  GunModdingState,
  SlotSelectionNode,
} from "@/types";
import { Gun, Mod, Slot } from "@tarkov.directory/shared-types";

// Function to easily check if the device is a mobile device
export function isMobileDevice() {
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|Tablet|Kindle|Windows Phone|Silk|UCBrowser|Nokia|SymbianOS|SonyEricsson|LG|SAMSUNG|Samsung|Meizu|Huawei|Xiaomi|OPPO/i;
  return (
    mobileRegex.test(navigator.userAgent) ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

// Function to get the trader image for a given normalized name
export function getTraderImage(normalizedName: string) {
  const traderImages: Record<string, StaticImageData> = {
    prapor,
    therapist,
    skier,
    peacekeeper,
    mechanic,
    ragman,
    jaeger,
    fence,
    lightkeeper,
  };

  return traderImages[normalizedName] || unknown;
}

// Function to format a difference between two numbers
export function formatDiff(calculated: number, base: number) {
  const diff = calculated - base;
  if (diff === 0) return null;
  return diff > 0 ? `+${diff}` : `${diff}`;
}

// Function to round gun stats like BSG does
export function customRound(number: number) {
  const fractionalPart = number % 1;
  if (fractionalPart <= 0.5) {
    return Math.floor(number);
  } else {
    return Math.ceil(number);
  }
}

// Function to convert a string to title case
export function toTitleCase(str: string) {
  return str.replace(/(?:^|\s)\w/g, function (match) {
    return match.toUpperCase();
  });
}

// Function that will sleep for the specified number of milliseconds
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to normalize a string by removing spaces and hyphens and converting to lowercase
export function normalizeShortNameSearch(input: string) {
  return input.replace(/-/g, "").replace(/\s+/g, "").toLowerCase();
}

export function createModdingUtils(
  gun: Gun,
  mods: Record<string, Mod>,
): GunModdingContextType["moddingUtils"] {
  // calculate gun stats based on selected mods
  function calculateStats(selections: SlotSelectionNode[]) {
    let ergonomics = gun.ergonomics;
    let totalRecoilModifier = 0;

    function calculateSelectionStats(selection: SlotSelectionNode) {
      if (selection.modId !== null) {
        const selectedMod = mods[selection.modId];
        if (!selectedMod) {
          console.warn(`Mod with id ${selection.modId} not found`);
        } else {
          ergonomics += selectedMod.ergonomicsModifier;
          totalRecoilModifier += selectedMod.recoilModifier;
        }
      }

      for (const nestedSelection of selection.slots) {
        calculateSelectionStats(nestedSelection);
      }
    }

    selections.forEach(calculateSelectionStats);

    const recoilMultiplier = 1 + totalRecoilModifier / 100;

    return {
      ergonomics: Math.max(0, ergonomics),
      recoilVertical: Math.max(
        0,
        customRound(gun.recoilVertical * recoilMultiplier),
      ),
      recoilHorizontal: Math.max(
        0,
        customRound(gun.recoilHorizontal * recoilMultiplier),
      ),
    };
  }

  // gets us slots with at least one valid mod that can go in it, according to the mods object we have
  function getValidNodeSlots(slots: Slot[]): SlotSelectionNode[] {
    return slots
      .map((slot) => {
        return {
          ...slot,
          allowedModIds: slot.allowedModIds.filter((modId) => mods[modId]),
        };
      })
      .filter((slot) => slot.allowedModIds.length > 0)
      .map((slot) => ({
        slotNameId: slot.nameId,
        modId: null,
        slots: [],
      }));
  }

  // gets us the initial empty selections for the gun we are modding (when no mods are selected)
  function getEmptySelections(): GunModdingState["selections"] {
    return getValidNodeSlots(gun.slots);
  }

  // updates the selections state based on the path and modId we are targeting
  function getUpdatedSelections(
    selections: SlotSelectionNode[],
    fullPath: string[],
    modId: string | null,
  ): SlotSelectionNode[] {
    function updateSelection(
      node: SlotSelectionNode,
      remainingPath: string[],
    ): SlotSelectionNode {
      // if the current node is the one we are targeting in the path, continue down the path
      if (node.slotNameId === remainingPath[0]) {
        // we are at the end of the path
        if (remainingPath.length === 1) {
          // if modId is null, this means we are removing the mod from the selection
          if (modId === null) {
            return { ...node, modId, slots: [] };
          }

          // if modId is not null, this means we are adding a mod to the selection
          const mod = mods[modId];

          // if the mod does not exist, throw an error (this should never happen in practice)
          if (!mod) {
            throw new Error(`Mod with id ${modId} not found`);
          }

          // return the node with the modId and valid slots for the mod (if any)
          return {
            ...node,
            modId,
            slots: getValidNodeSlots(mod.slots),
          };
        }

        // we are not yet at length one, so we need to continue searching for the next node in the path (recursive step)
        return {
          ...node,
          slots: node.slots.map((childNode) =>
            updateSelection(childNode, remainingPath.slice(1)),
          ),
        };
      }
      // if the current node is not the one we are targeting in the path, return it as is
      return node;
    }

    return selections.map((node) => {
      return updateSelection(node, fullPath);
    });
  }

  // checks if the modId passed conflicts with any of the already selected mods (in selections)
  function isConflicting(
    selections: SlotSelectionNode[],
    fullPathString: string,
    modId: string,
  ) {
    const mod = mods[modId];
    let conflicting = false;

    function isConflictingNode(pathString: string, node: SlotSelectionNode) {
      if (node.modId !== null) {
        const selectedMod = mods[node.modId];
        // Ensure the mod exists in our mods object
        if (mod === undefined) {
          throw new Error(`Mod with id ${modId} not found`);
        }
        if (selectedMod === undefined) {
          throw new Error(`Mod with id ${node.modId} not found`);
        }
        // Skip checking for conflicts if we're at the target path
        if (fullPathString === pathString) {
          return;
        } else if (
          mod.conflictingModIds.includes(node.modId) ||
          selectedMod.conflictingModIds.includes(modId)
        ) {
          // Set conflicting to true if there's a conflict
          conflicting = true;
          return;
        }
      }
      // Recursively check for conflicts in nested slots
      node.slots.forEach((selection) => {
        isConflictingNode(`${pathString}-${selection.slotNameId}`, selection);
      });
    }

    // Start the conflict check from the top-level selections
    selections.forEach((selection) => {
      isConflictingNode(selection.slotNameId, selection);
    });

    return conflicting;
  }

  return {
    calculateStats,
    getEmptySelections,
    getUpdatedSelections,
    isConflicting,
  };
}
