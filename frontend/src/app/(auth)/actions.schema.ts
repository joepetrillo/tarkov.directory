import { z } from "zod";
import { zfd } from "zod-form-data";

const usernameSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]+$/, {
    message:
      "Username can only contain letters, numbers, underscores, and hyphens",
  })
  .refine((data) => data.length >= 3 && data.length <= 32, {
    message: "Username must be between 3 and 32 characters",
  });

const emailSchema = z
  .string()
  .email({ message: "Please enter a valid email address" });

const passwordSchema = z
  .string()
  .refine((data) => data.length >= 8 && data.length <= 64, {
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
    .length(6)
    .regex(/^[A-Z0-9]+$/, {
      message: "Code can only contain numbers and uppercase letters",
    }),
});
