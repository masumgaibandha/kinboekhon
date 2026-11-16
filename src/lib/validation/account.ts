import { z } from "zod";

import { ADMIN_MAX_PASSWORD_LENGTH, ADMIN_MIN_PASSWORD_LENGTH } from "@/lib/auth-rules";

const currentPassword = z.string().min(1, "Enter your current password.").max(ADMIN_MAX_PASSWORD_LENGTH);

export const changeEmailSchema = z.object({
  newEmail: z.string().trim().toLowerCase().max(254).pipe(z.email("Enter a valid email address.")),
  currentPassword,
});

export const changePasswordSchema = z
  .object({
    currentPassword,
    newPassword: z
      .string()
      .min(ADMIN_MIN_PASSWORD_LENGTH, `Use at least ${ADMIN_MIN_PASSWORD_LENGTH} characters.`)
      .max(ADMIN_MAX_PASSWORD_LENGTH, `Use at most ${ADMIN_MAX_PASSWORD_LENGTH} characters.`),
    confirmPassword: z.string().max(ADMIN_MAX_PASSWORD_LENGTH),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "The two new passwords do not match.",
  });
