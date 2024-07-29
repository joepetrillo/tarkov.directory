import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://api.tarkov.dev/graphql",
  documents: ["src/**/*"],
  generates: {
    "src/gql/": {
      preset: "client",
      config: {
        nonOptionalTypename: true,
        avoidOptionals: true,
      },
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: "getFragmentData" },
      },
    },
  },
};

export default config;
