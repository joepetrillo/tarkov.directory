import "server-only";

import type { App } from "@tarkov.directory/backend";
import { treaty } from "@elysiajs/eden";
import { env } from "@/env";

export const api = treaty<App>(env.NEXT_PUBLIC_API_URL, {
  headers() {
    return {
      "API-Key": env.API_KEY,
    };
  },
});
