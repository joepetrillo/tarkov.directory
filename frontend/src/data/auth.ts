import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { SessionValidationResult, validateSessionToken } from "@/lib/session";

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    // get the token from the session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value ?? null;

    // if no token, request is not authenticated
    if (token === null) {
      return { session: null, user: null };
    }

    // validate the session token
    const result = await validateSessionToken(token);
    return result;
  },
);
