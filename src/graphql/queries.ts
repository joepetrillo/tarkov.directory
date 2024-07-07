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
        }
      }
    }
  }
`);

export const initialGunInfoQuery = graphql(`
  query GetInitialGunInfo {
    items(name: "ak-74n", type: gun, categoryNames: Weapon) {
      id
      name
      normalizedName
      shortName
      properties {
        __typename
        ... on ItemPropertiesWeapon {
          recoilHorizontal
          recoilVertical
          ergonomics
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
