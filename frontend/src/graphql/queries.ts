// This file contains all the GraphQL queries that are used in the application.
import { graphql } from "gql.tada";

export const BuyForFragment = graphql(`
  fragment BuyFor on ItemPrice {
    vendor {
      __typename
      name
      normalizedName
      ... on TraderOffer {
        minTraderLevel
      }
    }
    priceRUB
    price
    currency
  }
`);

export const SlotFragment = graphql(`
  fragment Slot on ItemSlot {
    id
    required
    name
    nameId
    filters {
      allowedItems {
        id
      }
    }
  }
`);

export const GetAllGuns = graphql(
  `
    query GetAllGuns {
      items(
        handbookCategoryNames: [
          AssaultCarbines
          AssaultRifles
          BoltActionRifles
          GrenadeLaunchers
          MachineGuns
          MarksmanRifles
          Pistols
          SMGs
          Shotguns
        ]
        type: gun
      ) {
        id
        name
        normalizedName
        shortName
        handbookCategories {
          name
          normalizedName
        }
        buyFor {
          ...BuyFor
        }
        properties {
          __typename
          ... on ItemPropertiesWeapon {
            caliber
            recoilHorizontal
            recoilVertical
            ergonomics
            defaultPreset {
              baseImageLink
            }
            slots {
              ...Slot
            }
          }
        }
      }
    }
  `,
  [BuyForFragment, SlotFragment],
);

export const GetAllMods = graphql(
  `
    query GetAllMods {
      items(types: [mods]) {
        id
        name
        normalizedName
        shortName
        iconLink
        recoilModifier
        ergonomicsModifier
        conflictingSlotIds
        conflictingItems {
          id
        }
        buyFor {
          ...BuyFor
        }
        properties {
          __typename
          ... on ItemPropertiesWeaponMod {
            slots {
              ...Slot
            }
          }
          ... on ItemPropertiesBarrel {
            slots {
              ...Slot
            }
          }
          ... on ItemPropertiesMagazine {
            slots {
              ...Slot
            }
          }
          ... on ItemPropertiesScope {
            slots {
              ...Slot
            }
          }
        }
      }
    }
  `,
  [BuyForFragment, SlotFragment],
);
