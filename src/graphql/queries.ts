// This file contains all the GraphQL queries that are used in the application.

import { graphql } from "@/gql";

// Returns all guns in the game
export const getAllGunsQuery = graphql(`
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
      properties {
        __typename
        ... on ItemPropertiesWeapon {
          defaultPreset {
            baseImageLink
          }
          caliber
        }
      }
    }
  }
`);

export const getGunInfoQuery = graphql(`
  query GetGunInfo($id: [ID]) {
    items(type: gun, ids: $id) {
      id
      name
      normalizedName
      shortName
      handbookCategories {
        name
        normalizedName
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
                name
                shortName
                iconLink
                recoilModifier
                ergonomicsModifier
                conflictingSlotIds
                conflictingItems {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`);
