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

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
