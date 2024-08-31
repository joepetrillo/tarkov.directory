import "server-only";

import { App } from "backend";
import { treaty } from "@elysiajs/eden";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const client = treaty<App>(API_URL, {
  headers() {
    return {
      "API-Key": process.env.API_KEY || "",
    };
  },
});
