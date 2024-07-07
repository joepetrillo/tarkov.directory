import type { CodegenConfig } from "@graphql-codegen/cli";
import { __typename } from "graphql-request/alpha/schema";

const config: CodegenConfig = {
  schema: "https://api.tarkov.dev/graphql",
  documents: ["src/**/*"],
  generates: {
    "src/gql/": {
      preset: "client",
    },
  },
};

export default config;
