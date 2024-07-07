/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query GetAllGuns {\n    items(\n      handbookCategoryNames: [\n        AssaultCarbines\n        AssaultRifles\n        BoltActionRifles\n        GrenadeLaunchers\n        MachineGuns\n        MarksmanRifles\n        Pistols\n        SMGs\n        Shotguns\n      ]\n      type: gun\n    ) {\n      id\n      name\n      normalizedName\n      shortName\n      handbookCategories {\n        name\n        normalizedName\n      }\n      properties {\n        __typename\n        ... on ItemPropertiesWeapon {\n          defaultPreset {\n            baseImageLink\n          }\n        }\n      }\n    }\n  }\n": types.GetAllGunsDocument,
    "\n  query GetInitialGunInfo {\n    items(name: \"ak-74n\", type: gun, categoryNames: Weapon) {\n      id\n      name\n      normalizedName\n      shortName\n      properties {\n        __typename\n        ... on ItemPropertiesWeapon {\n          recoilHorizontal\n          recoilVertical\n          ergonomics\n          slots {\n            id\n            required\n            name\n            nameId\n            filters {\n              allowedItems {\n                id\n                name\n                shortName\n                iconLink\n                recoilModifier\n                ergonomicsModifier\n                conflictingSlotIds\n                conflictingItems {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetInitialGunInfoDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetAllGuns {\n    items(\n      handbookCategoryNames: [\n        AssaultCarbines\n        AssaultRifles\n        BoltActionRifles\n        GrenadeLaunchers\n        MachineGuns\n        MarksmanRifles\n        Pistols\n        SMGs\n        Shotguns\n      ]\n      type: gun\n    ) {\n      id\n      name\n      normalizedName\n      shortName\n      handbookCategories {\n        name\n        normalizedName\n      }\n      properties {\n        __typename\n        ... on ItemPropertiesWeapon {\n          defaultPreset {\n            baseImageLink\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetAllGuns {\n    items(\n      handbookCategoryNames: [\n        AssaultCarbines\n        AssaultRifles\n        BoltActionRifles\n        GrenadeLaunchers\n        MachineGuns\n        MarksmanRifles\n        Pistols\n        SMGs\n        Shotguns\n      ]\n      type: gun\n    ) {\n      id\n      name\n      normalizedName\n      shortName\n      handbookCategories {\n        name\n        normalizedName\n      }\n      properties {\n        __typename\n        ... on ItemPropertiesWeapon {\n          defaultPreset {\n            baseImageLink\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetInitialGunInfo {\n    items(name: \"ak-74n\", type: gun, categoryNames: Weapon) {\n      id\n      name\n      normalizedName\n      shortName\n      properties {\n        __typename\n        ... on ItemPropertiesWeapon {\n          recoilHorizontal\n          recoilVertical\n          ergonomics\n          slots {\n            id\n            required\n            name\n            nameId\n            filters {\n              allowedItems {\n                id\n                name\n                shortName\n                iconLink\n                recoilModifier\n                ergonomicsModifier\n                conflictingSlotIds\n                conflictingItems {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetInitialGunInfo {\n    items(name: \"ak-74n\", type: gun, categoryNames: Weapon) {\n      id\n      name\n      normalizedName\n      shortName\n      properties {\n        __typename\n        ... on ItemPropertiesWeapon {\n          recoilHorizontal\n          recoilVertical\n          ergonomics\n          slots {\n            id\n            required\n            name\n            nameId\n            filters {\n              allowedItems {\n                id\n                name\n                shortName\n                iconLink\n                recoilModifier\n                ergonomicsModifier\n                conflictingSlotIds\n                conflictingItems {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;