import "server-only";

import type { App } from "backend";
import { treaty } from "@elysiajs/eden";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export const api = treaty<App>(API_URL, {
  headers() {
    return {
      "API-Key": process.env.API_KEY || "",
    };
  },
});
