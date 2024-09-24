import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { headers } from "next/headers";
import { DatabaseError } from "pg";
import { z } from "zod";
import { Ratelimit } from "@unkey/ratelimit";
import { env } from "@/env";

export const unkeyAuth = new Ratelimit({
  rootKey: env.UNKEY_API_KEY,
  namespace: "tarkov-directory-auth",
  limit: 10,
  duration: "1h",
  async: false,
});

export class ActionError extends Error {}

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () =>
    z.object({
      actionName: z.string(),
    }),
  handleServerError: (error, utils) => {
    console.error(`${utils.metadata.actionName}: ${error.message}`);

    // handle custom error messages
    if (error instanceof ActionError) {
      return error.message;
    }

    // handle database errors
    if (error instanceof DatabaseError) {
      if (
        error.code === "23505" &&
        error.constraint === "user_username_unique"
      ) {
        return "Username unavailable";
      }
    }

    // handle all other errors
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const rateLimitedActionClient = actionClient.use(
  async ({ next, metadata }) => {
    // skip rate limiting in development
    if (process.env.NODE_ENV === "development") return next();

    // get ip address - x-forwarded-for comes from vercel
    const ip = headers().get("x-forwarded-for") ?? `no-ip-header`;

    // create a unique identifier for the rate limit, per action
    const identifier = `${metadata.actionName}-${ip}`;

    // limit requests to 10 per hour
    const rateLimitResult = await unkeyAuth.limit(identifier);

    // if rate limit exceeded, throw an error
    if (!rateLimitResult.success) {
      throw new ActionError("You are going too fast. Please try again later.");
    }

    // if rate limit not exceeded, continue to the next action
    return next();
  },
);
