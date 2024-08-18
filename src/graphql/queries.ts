// This file contains all the GraphQL queries that are used in the application.

import { graphql } from "@/gql";

export const GetAllGunsAndMods = graphql(`
  query GetAllGunsAndMods {
    gunData: items(
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
        }
      }
    }
    modData: items(types: [mods]) {
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
      properties {
        __typename
        ... on ItemPropertiesWeaponMod {
          slots {
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
        }
        ... on ItemPropertiesBarrel {
          slots {
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
        }
        ... on ItemPropertiesMagazine {
          slots {
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
        }
        ... on ItemPropertiesScope {
          slots {
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
        }
      }
    }
  }
`);
