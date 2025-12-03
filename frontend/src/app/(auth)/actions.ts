"use server";

import {
  sendResetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "@/app/(auth)/actions.schema";
import {
  actionClient,
  ActionError,
  authActionClient,
  rateLimit,
} from "@/lib/action-clients";
import { db } from "@/lib/db";
import { emailVerificationTable, sessionTable, userTable } from "@/schema";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt, ne, or } from "drizzle-orm";
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
  generateVerificationCode,
  invalidateSession,
  setSessionTokenCookie,
} from "@/lib/session";

// Create a new user and send a verification email with code
export const signUpAction = actionClient
  .metadata({ actionName: "signUp" })
  .schema(signUpSchema)
  .use(rateLimit)
  .action(async ({ parsedInput, metadata }) => {
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
    const identifier = `${metadata.actionName}-${ip}`;

    // limit to 5 sign ups per day (should be plenty for a single ip)
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
    const verificationCode = generateVerificationCode();

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
        code: verificationCode,
      });

      const emailHtml = await render(
        React.createElement(VerificationCodeEmail, {
          code: verificationCode,
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

    if (!existingUser.emailVerified) {
      redirect("/verify-email");
    }

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
  .action(async ({ parsedInput, ctx: { user, session } }) => {
    // check if the email is already verified
    if (user.emailVerified) {
      throw new ActionError("Email already verified");
    }

    // check if the code is valid (exists, matches, and is not expired)
    const validVerificationCodes = await db
      .select({ code: emailVerificationTable.code })
      .from(emailVerificationTable)
      .where(
        and(
          eq(emailVerificationTable.email, user.email),
          eq(emailVerificationTable.userId, user.id),
          gt(emailVerificationTable.expiresAt, new Date(Date.now())),
        ),
      );

    // if no valid codes exist, return validation error
    if (
      validVerificationCodes.filter((v) => v.code === parsedInput.code)
        .length === 0
    ) {
      returnValidationErrors(verifyEmailSchema, {
        code: {
          _errors: ["Invalid code"],
        },
      });
    }

    // update email verified field, delete existing verification codes (any that for email/user), invalidate other sessions
    await db.transaction(async (tx) => {
      await tx
        .update(userTable)
        .set({ emailVerified: true })
        .where(eq(userTable.id, user.id));
      await tx
        .delete(emailVerificationTable)
        .where(
          or(
            eq(emailVerificationTable.email, user.email),
            eq(emailVerificationTable.userId, user.id),
          ),
        );
      await tx
        .delete(sessionTable)
        .where(
          and(
            ne(sessionTable.id, session.id),
            eq(sessionTable.userId, user.id),
          ),
        );
    });

    redirect("/guns");
  });

// Send code to verify email address (used for re-sending verification code)
export const sendEmailVerificationCodeAction = authActionClient
  .metadata({ actionName: "sendEmailVerificationCode" })
  .use(rateLimit)
  .action(async ({ metadata, ctx: { user } }) => {
    // check if the email is already verified
    if (user.emailVerified) {
      throw new ActionError("Email already verified");
    }

    // check rate limit for sending verification codes
    const identifier = `${metadata.actionName}-${user.email}`;

    const rateLimiter = new RateLimit({
      window: 900,
      max: 1,
    });

    const rateLimitResult = await rateLimiter.limit(identifier);

    if (!rateLimitResult.success) {
      throw new ActionError(
        `You requested a code recently. Try again in ${rateLimitResult.timeRemaining}.`,
      );
    }

    // generate a new code and send the email
    const verificationCode = generateVerificationCode();

    // insert into db and send email
    await db.transaction(async (tx) => {
      await tx.insert(emailVerificationTable).values({
        email: user.email,
        userId: user.id,
        code: verificationCode,
      });

      const emailHtml = await render(
        React.createElement(VerificationCodeEmail, {
          code: verificationCode,
        }),
      );

      const options = {
        from: '"Tarkov Directory" <notifications@tarkov.directory>',
        to: user.email,
        subject: "Verify Your Email",
        html: emailHtml,
      };

      // send email with code
      await zeptoTransporter.sendMail(options);
    });
  });

// Send a reset password link to the email asscoiated with an account
export const sendResetPasswordAction = actionClient
  .metadata({ actionName: "sendResetPassword" })
  .schema(sendResetPasswordSchema)
  .use(rateLimit)
  .action(async ({ metadata, parsedInput }) => {
    const ip = (await headers()).get("x-forwarded-for") ?? `no-ip`;
    const identifier = `${metadata.actionName}-${ip}`;

    const rateLimiter = new RateLimit({
      window: 3600,
      max: 2,
    });

    const rateLimitResult = await rateLimiter.limit(identifier);

    if (!rateLimitResult.success) {
      throw new ActionError(
        `You have requested too many resets. Try again in ${rateLimitResult.timeRemaining}.`,
      );
    }

    // // generate a new code and send the email
    // const verificationCode = generateVerificationCode();

    // // insert into db and send email
    // await db.transaction(async (tx) => {
    //   await tx.insert(emailVerificationTable).values({
    //     email: user.email,
    //     userId: user.id,
    //     code: verificationCode,
    //   });

    //   const emailHtml = await render(
    //     React.createElement(VerificationCodeEmail, {
    //       code: verificationCode,
    //     }),
    //   );

    //   const options = {
    //     from: '"Tarkov Directory" <notifications@tarkov.directory>',
    //     to: user.email,
    //     subject: "Verify Your Email",
    //     html: emailHtml,
    //   };

    //   // send email with code
    //   await zeptoTransporter.sendMail(options);
    // });
  });
