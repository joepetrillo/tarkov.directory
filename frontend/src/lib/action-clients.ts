import {
  createMiddleware,
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { headers } from "next/headers";
import { DatabaseError } from "pg";
import { z } from "zod";
import { env } from "@/env";
import { getCurrentSession } from "@/data/auth";
import { Ratelimit as unkeyRateLimit } from "@unkey/ratelimit";

export const unkeyRateLimiter = new unkeyRateLimit({
  rootKey: env.UNKEY_API_KEY,
  namespace: "tarkov-directory-actions",
  limit: 2,
  duration: "10s",
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

export const rateLimit = createMiddleware<{
  metadata: { actionName: string };
}>().define(async ({ next, metadata }) => {
  // skip rate limiting in development
  if (process.env.NODE_ENV === "development") return next();

  // get ip address - x-forwarded-for comes from vercel
  const ip = (await headers()).get("x-forwarded-for") ?? `no-ip`;

  // create a unique identifier for the rate limit, per action
  const identifier = `${metadata.actionName}-${ip}`;

  // limit requests
  const rateLimitResult = await unkeyRateLimiter.limit(identifier);

  // if rate limit exceeded, throw an error
  if (!rateLimitResult.success) {
    throw new ActionError("You are going too fast. Please try again in a bit.");
  }

  // if rate limit not exceeded, continue to the next action
  return next();
});

export const authActionClient = actionClient.use(async ({ next }) => {
  // validate the session and user
  const { session, user } = await getCurrentSession();

  // if session not found, throw an error
  if (!session) {
    throw new ActionError("Session not found");
  }

  // request is authenticated - continue to the next action
  return next({ ctx: { session, user } });
});
