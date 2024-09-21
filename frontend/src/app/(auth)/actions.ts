"use server";

import { validateRequest } from "@/data/auth";
import { ActionError, rateLimitedActionClient } from "@/lib/action.client";
import { db } from "@/lib/db";
import { lucia } from "@/lib/lucia";
import { userTable } from "@/schema";
import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  username: zfd.text(
    z
      .string()
      .min(3)
      .max(31)
      .regex(/^[A-Za-z0-9_-]+$/, {
        message:
          "Username can only contain letters, numbers, underscores, and hyphens",
      }),
  ),
  password: zfd.text(z.string().min(8).max(225)),
});

export const signInAction = rateLimitedActionClient
  .metadata({ actionName: "signIn" })
  .schema(schema)
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
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const passwordHash = await hash(parsedInput.password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10); // 16 characters long

    // Insert new user
    await db.insert(userTable).values({
      id: userId,
      username: parsedInput.username,
      passwordHash: passwordHash,
    });

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
