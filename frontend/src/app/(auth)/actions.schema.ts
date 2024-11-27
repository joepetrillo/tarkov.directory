import { z } from "zod";
import { zfd } from "zod-form-data";
import OpenAI from "openai";
import { env } from "@/env";

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

export const signInSchema = zfd.formData({
  email: zfd.text(emailSchema),
  password: zfd.text(passwordSchema),
  "cf-turnstile-response": z.string(),
});

export const signUpSchema = zfd
  .formData({
    email: zfd.text(emailSchema),
    username: zfd.text(usernameSchema),
    password: zfd.text(passwordSchema),
    confirmPassword: zfd.text(passwordSchema),
    "cf-turnstile-response": z.string(),
  })
  .refine(
    ({ password, confirmPassword }) => {
      return password === confirmPassword;
    },
    {
      path: ["confirmPassword"],
      message: "Passwords must match",
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
