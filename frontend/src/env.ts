import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    DATABASE_URL: z.string().url(),
    VPS_API_KEY: z.string().min(1),
    TURNSTILE_SECRET_KEY: z.string().min(1),
    ZEPTO_MAIL_API_KEY: z.string().min(1),
    UNKEY_API_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_VPS_API_URL: z.string().min(1),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    VPS_API_KEY: process.env.VPS_API_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    ZEPTO_MAIL_API_KEY: process.env.ZEPTO_MAIL_API_KEY,
    UNKEY_API_KEY: process.env.UNKEY_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_VPS_API_URL: process.env.NEXT_PUBLIC_VPS_API_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  },
});
