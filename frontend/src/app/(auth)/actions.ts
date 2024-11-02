"use server";

import {
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "@/app/(auth)/actions.schema";
import { env } from "@/env";
import {
  actionClient,
  ActionError,
  authActionClient,
  rateLimit,
} from "@/lib/action-clients";
import { db } from "@/lib/db";
import { emailVerificationTable, userTable } from "@/schema";
import { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt, or } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { render } from "@react-email/render";
import VerificationCodeEmail from "@/emails/verification-code";
import React from "react";
import { returnValidationErrors } from "next-safe-action";
import { RateLimit } from "@/lib/rate-limit";
import { zeptoTransporter } from "@/lib/transporter";
import {
  createSession,
  deleteSessionTokenCookie,
  generateIdFromEntropySize,
  generateSessionToken,
  invalidateSession,
  setSessionTokenCookie,
} from "@/lib/session";

async function validateTurnstile(turnstileResponse: string) {
  const turnstileRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileResponse,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data: TurnstileServerValidationResponse = await turnstileRes.json();

  if (!data.success) {
    throw new ActionError(
      "Could not verify that you are human. Please try again.",
    );
  }
}

// Create a new user and send a verification email
export const signUpAction = actionClient
  .metadata({ actionName: "signUp" })
  .schema(signUpSchema)
  .use(rateLimit)
  .action(async ({ parsedInput }) => {
    await validateTurnstile(parsedInput["cf-turnstile-response"]);

    // check if email or username is already taken
    const existingUsers = await db.query.userTable.findMany({
      where: or(
        eq(userTable.email, parsedInput.email),
        eq(userTable.username, parsedInput.username),
      ),
      limit: 2,
    });

    // if any matching users exist, check for conflicts and return validation errors
    if (existingUsers.length > 0) {
      const errors: {
        email?: { _errors: string[] };
        username?: { _errors: string[] };
      } = {};

      for (const existingUser of existingUsers) {
        if (existingUser.email === parsedInput.email) {
          errors.email = { _errors: ["Email already in use"] };
        }
        if (existingUser.username === parsedInput.username) {
          errors.username = { _errors: ["Username already in use"] };
        }
      }

      if (Object.keys(errors).length > 0) {
        returnValidationErrors(signUpSchema, errors);
      } else {
        throw new ActionError("User already exists");
      }
    }

    // check if the user has made too many sign up attempts
    const ip = (await headers()).get("x-forwarded-for") ?? `no-ip`;
    const identifier = `${"signUp"}-${ip}`;

    const rateLimiter = new RateLimit({
      window: 86400,
      max: 5,
    });

    const rateLimitResult = await rateLimiter.limit(identifier);

    if (!rateLimitResult.success) {
      throw new ActionError(
        `Too many sign up attempts. Try again in ${rateLimitResult.timeRemaining}.`,
      );
    }

    // all checks have passed - proceed with creation
    // hash the password
    const passwordHash = await hash(parsedInput.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // generate a random user ID and code
    const userId = generateIdFromEntropySize(10);
    const generatedVerficationCode = Array.from(
      crypto.getRandomValues(new Uint8Array(6)),
    )
      .map((b) => "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[b % 36])
      .join("");

    // insert user and email verification code into database
    // send the email with the code
    await db.transaction(async (tx) => {
      await tx.insert(userTable).values({
        id: userId,
        email: parsedInput.email,
        username: parsedInput.username,
        passwordHash: passwordHash,
      });
      await tx.insert(emailVerificationTable).values({
        email: parsedInput.email,
        userId: userId,
        code: generatedVerficationCode,
      });

      const emailHtml = await render(
        React.createElement(VerificationCodeEmail, {
          code: generatedVerficationCode,
        }),
      );

      const options = {
        from: '"Tarkov Directory" <notifications@tarkov.directory>',
        to: parsedInput.email,
        subject: "Verify Your Email",
        html: emailHtml,
      };

      // send email with code
      await zeptoTransporter.sendMail(options);
    });

    // create the session and set the cookie
    const token = generateSessionToken();
    const session = await createSession(token, userId);
    await setSessionTokenCookie(token, session.expiresAt);

    redirect("/verify-email");
  });

// Sign in to existing account
export const signInAction = actionClient
  .metadata({ actionName: "signIn" })
  .schema(signInSchema)
  .use(rateLimit)
  .action(async ({ parsedInput }) => {
    await validateTurnstile(parsedInput["cf-turnstile-response"]);

    // check if the user exists (via email match)
    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.email, parsedInput.email),
    });

    if (!existingUser) {
      returnValidationErrors(signInSchema, {
        email: {
          _errors: ["Email not found"],
        },
      });
    }

    // check if the password is correct
    const validPassword = await verify(
      existingUser.passwordHash,
      parsedInput.password,
      {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      },
    );

    if (!validPassword) {
      returnValidationErrors(signInSchema, {
        password: {
          _errors: ["Incorrect password"],
        },
      });
    }

    // create the session and set the cookie
    const token = generateSessionToken();
    const session = await createSession(token, existingUser.id);
    await setSessionTokenCookie(token, session.expiresAt);

    redirect("/guns");
  });

// Sign out of current session
export const signOutAction = authActionClient
  .metadata({ actionName: "signOut" })
  .use(rateLimit)
  .action(async ({ ctx: { session } }) => {
    // invalidate the session and set a new blank session cookie
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
  });

// Verify email address with code
export const verifyEmailAction = authActionClient
  .metadata({ actionName: "verifyEmail" })
  .schema(verifyEmailSchema)
  .use(rateLimit)
  .action(async ({ parsedInput, ctx: { user } }) => {
    // check if the email is already verified
    if (user.emailVerified) {
      throw new ActionError("Email already verified");
    }

    // check if the user entered a valid code, needs to match and not be expired
    const verification = await db.query.emailVerificationTable.findFirst({
      where: and(
        eq(emailVerificationTable.email, user.email),
        and(
          eq(emailVerificationTable.code, parsedInput.code),
          gt(emailVerificationTable.expiresAt, new Date(Date.now())),
        ),
      ),
    });

    if (!verification) {
      returnValidationErrors(verifyEmailSchema, {
        code: {
          _errors: ["Invalid code"],
        },
      });
    }

    // update email verified field and delete the verification codes (any that are expired as well)
    await db.transaction(async (tx) => {
      await tx
        .update(userTable)
        .set({ emailVerified: true })
        .where(eq(userTable.id, verification.userId));
      await tx
        .delete(emailVerificationTable)
        .where(eq(emailVerificationTable.email, verification.email));
    });

    redirect("/");
  });
