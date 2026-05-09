import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || "")
  .pipe(z.union([z.literal(""), z.string().url("Enter a valid URL.")]));

export const suggestionSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(2, "Item name must be at least 2 characters.")
    .max(120, "Item name must be 120 characters or less."),
  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters.")
    .max(80, "Category must be 80 characters or less."),
  mapName: z
    .string()
    .trim()
    .min(2, "Map name must be at least 2 characters.")
    .max(120, "Map name must be 120 characters or less."),
  locationDescription: z
    .string()
    .trim()
    .min(8, "Location description needs a little more detail.")
    .max(700, "Location description must be 700 characters or less."),
  notes: z
    .string()
    .trim()
    .min(4, "Notes must be at least 4 characters.")
    .max(700, "Notes must be 700 characters or less."),
  sourceUrl: optionalUrl,
});

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or less."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(160, "Email must be 160 characters or less."),
  organization: z
    .string()
    .trim()
    .max(120, "Organization must be 120 characters or less.")
    .optional()
    .transform((value) => value || ""),
  inquiryType: z
    .string()
    .trim()
    .min(2, "Choose an inquiry type.")
    .max(80, "Inquiry type must be 80 characters or less."),
  message: z
    .string()
    .trim()
    .min(12, "Message must be at least 12 characters.")
    .max(1400, "Message must be 1400 characters or less."),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export const adminPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters.")
      .max(128, "New password must be 128 characters or less."),
    confirmPassword: z.string().min(1, "Confirm the new password."),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }

    if (value.currentPassword === value.newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a password that is different from the current one.",
        path: ["newPassword"],
      });
    }
  });

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
