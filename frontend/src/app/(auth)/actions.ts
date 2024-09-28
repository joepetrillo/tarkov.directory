"use server";

import {
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "@/app/(auth)/action.schemas";
import { env } from "@/env";
import {
  actionClient,
  ActionError,
  authActionClient,
  rateLimit,
} from "@/lib/action-clients";
import { db } from "@/lib/db";
import { lucia } from "@/lib/lucia";
import { emailVerificationTable, userTable } from "@/schema";
import { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt, or } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export const signUpAction = actionClient
  .use(rateLimit)
  .metadata({ actionName: "signUp" })
  .schema(signUpSchema)
  .action(async ({ parsedInput }) => {
    await validateTurnstile(parsedInput["cf-turnstile-response"]);

    // check if email or username is already taken
    const existingUser = await db.query.userTable.findFirst({
      where: or(
        eq(userTable.email, parsedInput.email),
        eq(userTable.username, parsedInput.username),
      ),
    });

    if (existingUser) {
      if (existingUser.email === parsedInput.email) {
        throw new ActionError("Email already in use");
      } else if (existingUser.username === parsedInput.username) {
        throw new ActionError("Username unavailable");
      } else {
        throw new ActionError("User already exists");
      }
    }

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
    db.transaction(async (tx) => {
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
    });

    // TODO - send email with code if rate limit checks pass

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    redirect("/verify-email");
  });

export const signInAction = actionClient
  .use(rateLimit)
  .metadata({ actionName: "signIn" })
  .schema(signInSchema)
  .action(async ({ parsedInput }) => {
    await validateTurnstile(parsedInput["cf-turnstile-response"]);

    // TODO - DECIDE IF I WANT TO KEEP USERNAME OR EMAIL LOGIN
    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.username, parsedInput.username),
    });

    if (!existingUser) {
      throw new ActionError("Username not found");
    }

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
      throw new ActionError("Incorrect password");
    }

    const session = await lucia.createSession(existingUser.id, {
      username: existingUser.username,
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    redirect("/");
  });

export const signOutAction = authActionClient
  .use(rateLimit)
  .metadata({ actionName: "signOut" })
  .action(async ({ ctx: { session } }) => {
    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  });

export const verifyEmailAction = authActionClient
  .use(rateLimit)
  .metadata({ actionName: "verifyEmail" })
  .schema(verifyEmailSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
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
      throw new ActionError("Invalid code");
    }

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
