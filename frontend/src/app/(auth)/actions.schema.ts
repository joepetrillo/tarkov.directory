import { z } from "zod";
import { zfd } from "zod-form-data";
import OpenAI from "openai";
import { env } from "@/env";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import { ActionError } from "@/lib/action-clients";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const usernameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]+$/, {
    message:
      "Username can only contain letters, numbers, underscores, and hyphens",
  })
  .refine((username) => username.length >= 3 && username.length <= 32, {
    message: "Username must be between 3 and 32 characters",
  })
  .refine(
    async (username) => {
      const onlyLettersNumbersUsername = username.replace(/[_-]/g, "");
      const res = await openai.moderations.create({
        input: onlyLettersNumbersUsername,
        model: "omni-moderation-latest",
      });
      return !res.results[0]?.flagged;
    },
    {
      message: "Username contains inappropriate content",
    },
  )
  .transform((username) => username.toLowerCase());

const emailSchema = z
  .string()
  .email({ message: "Please enter a valid email address" });

const passwordSchema = z
  .string()
  .refine((password) => password.length >= 8 && password.length <= 64, {
    message: "Password must be between 8 and 64 characters",
  });

const turnstileResponseSchema = z.string().refine(async (turnstileResponse) => {
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

  return true;
});

export const signInSchema = zfd.formData({
  email: zfd.text(emailSchema),
  password: zfd.text(passwordSchema),
  "cf-turnstile-response": turnstileResponseSchema,
});

export const signUpSchema = zfd
  .formData({
    email: zfd.text(emailSchema),
    username: zfd.text(usernameSchema),
    password: zfd.text(passwordSchema),
    confirmPassword: zfd.text(passwordSchema),
    "cf-turnstile-response": turnstileResponseSchema,
  })
  .refine(
    ({ password, confirmPassword }) => {
      return password === confirmPassword;
    },
    {
      path: ["confirmPassword"],
      message: "Passwords must match",
    },
  )
  .refine(
    ({ password, username, email }) => {
      zxcvbnOptions.setOptions({
        dictionary: {
          ...zxcvbnCommonPackage.dictionary,
          ...zxcvbnEnPackage.dictionary,
        },
        graphs: zxcvbnCommonPackage.adjacencyGraphs,
        useLevenshteinDistance: true,
        translations: zxcvbnEnPackage.translations,
      });
      const result = zxcvbn(password, [username, email]);
      return result.score >= 3;
    },
    {
      path: ["password"],
      message: "Password is too weak",
    },
  );

export const verifyEmailSchema = zfd.formData({
  code: z
    .string()
    .length(6, { message: "Code must be 6 characters" })
    .regex(/^[A-Z0-9]+$/, {
      message: "Code can only contain numbers and uppercase letters",
    }),
});

export const sendResetPasswordSchema = zfd.formData({
  email: zfd.text(emailSchema),
  "cf-turnstile-response": turnstileResponseSchema,
});
