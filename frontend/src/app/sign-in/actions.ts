"use server";

import { cookies } from "next/headers";
import { lucia } from "@/lib/lucia";
import { redirect } from "next/navigation";
import { verify } from "@node-rs/argon2";
import { db } from "@/lib/db-client";
import { userTable } from "@/schema";
import { eq } from "drizzle-orm";
import { sleep } from "@/lib/utils";

interface ActionResult {
  error: string;
}

export async function signIn(
  prevState: unknown,
  formData: FormData,
): Promise<ActionResult> {
  const username = formData.get("username");
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error: "Invalid username",
    };
  }

  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const existingUser = await db.query.userTable.findFirst({
    where: eq(userTable.username, username),
  });

  if (!existingUser) {
    return {
      error: "Username not found",
    };
  }

  const validPassword = await verify(existingUser.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!validPassword) {
    return {
      error: "Incorrect password",
    };
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
  return redirect("/");
}
