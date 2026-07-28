/**
 * Domain filters for mapping Tarkov items into app Gun/Mod models.
 * Kept here (not in tarkov-json/) so the HTTP client stays dump-agnostic.
 */

/** Leaf handbook categories we show — skips parent "weapons" and flare/signal "guns". */
export const WEAPON_HANDBOOK_CATEGORIES = new Set([
  "assault-carbines",
  "assault-rifles",
  "bolt-action-rifles",
  "grenade-launchers",
  "machine-guns",
  "marksman-rifles",
  "pistols",
  "submachine-guns",
  "shotguns",
]);

/** Property types the modding UI can attach; night-vision etc. are intentionally excluded. */
export const MOD_PROPERTY_TYPES = new Set([
  "ItemPropertiesWeaponMod",
  "ItemPropertiesBarrel",
  "ItemPropertiesMagazine",
  "ItemPropertiesScope",
]);

export const CALIBER_MAPPING: Record<string, string> = {
  Caliber556x45NATO: "5.56x45",
  Caliber9x18PM: "9x18",
  Caliber12g: "12g",
  Caliber762x54R: "7.62x54R",
  Caliber545x39: "5.45x39",
  Caliber9x19PARA: "9x19",
  Caliber762x25TT: "7.62x25",
  Caliber762x39: "7.62x39",
  Caliber762x51: "7.62x51",
  Caliber9x39: "9x39",
  Caliber366TKM: ".366 TKM",
  Caliber9x21: "9x21",
  Caliber1143x23ACP: ".45 ACP",
  Caliber40x46: "40x46",
  Caliber23x75: "23x75",
  Caliber46x30: "4.6x30",
  Caliber127x55: "12.7x55",
  Caliber57x28: "5.7x28",
  Caliber762x35: ".300 Blackout",
  Caliber86x70: ".338 Lapua",
  Caliber9x33R: ".357 Magnum",
  Caliber26x75: "26x75",
  Caliber68x51: "6.8x51",
  Caliber20x1mm: "Toy Disk",
};
