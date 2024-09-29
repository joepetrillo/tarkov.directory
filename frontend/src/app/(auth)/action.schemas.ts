import { z } from "zod";
import { zfd } from "zod-form-data";

const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(/^[A-Za-z0-9_-]+$/, {
    message:
      "Username can only contain letters, numbers, underscores, and hyphens",
  });
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(225);

export const signInSchema = zfd.formData({
  username: zfd.text(usernameSchema),
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
