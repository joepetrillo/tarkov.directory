"use server";

import { validateRequest } from "@/data/auth";
import { ActionError, rateLimitedActionClient } from "@/lib/action.client";
import { db } from "@/lib/db";
import { lucia } from "@/lib/lucia";
import { emailVerificationTable, userTable } from "@/schema";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, or } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { zfd } from "zod-form-data";

const usernameSchema = z
  .string()
  .min(3)
  .max(31)
  .regex(/^[A-Za-z0-9_-]+$/, {
    message:
      "Username can only contain letters, numbers, underscores, and hyphens",
  });
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(225);

const signInSchema = zfd.formData({
  // email: zfd.text(emailSchema),
  username: zfd.text(usernameSchema),
  password: zfd.text(passwordSchema),
});

const signUpSchema = zfd
  .formData({
    email: zfd.text(emailSchema),
    username: zfd.text(usernameSchema),
    password: zfd.text(passwordSchema),
    confirmPassword: zfd.text(passwordSchema),
  })
  .refine(
    ({ password, confirmPassword }) => {
      return password === confirmPassword;
    },
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    },
  );

export const signInAction = rateLimitedActionClient
  .metadata({ actionName: "signIn" })
  .schema(signInSchema)
  .action(async ({ parsedInput }) => {
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

export const signUpAction = rateLimitedActionClient
  .metadata({ actionName: "signUp" })
  .schema(signUpSchema)
  .action(async ({ parsedInput }) => {
    // check if email is already taken and verified (meaning we cannot use it)
    // also check if username is already taken (enforced by database unique constraint)
    const existingUser = await db.query.userTable.findFirst({
      where: or(
        and(
          eq(userTable.email, parsedInput.email),
          eq(userTable.emailVerified, true),
        ),
        eq(userTable.username, parsedInput.username),
      ),
    });

    if (existingUser) {
      if (
        existingUser.email === parsedInput.email &&
        existingUser.emailVerified
      ) {
        throw new ActionError("Email already in use by another user");
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

    // generate a random user ID and TOTP code
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

    // TODO - send email with code

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    redirect("/");
  });

export const signOutAction = rateLimitedActionClient
  .metadata({ actionName: "signOut" })
  .action(async () => {
    const { session } = await validateRequest();

    if (!session) {
      throw new ActionError("No session found");
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  });
