import "server-only";

import type { App } from "@tarkov.directory/backend";
import { treaty } from "@elysiajs/eden";
import { env } from "@/env";

const API_URL = env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export const api = treaty<App>(API_URL, {
  headers() {
    return {
      "API-Key": env.API_KEY,
    };
  },
});
