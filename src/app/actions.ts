"use server";

import {
  assertAdmin,
  clearAdminSession,
  passwordMatches,
  setAdminSession,
  setStoredAdminPassword,
} from "@/lib/admin";
import {
  addVote,
  createSuggestion,
  publishSuggestionById,
  rejectSuggestionById,
  verifySuggestionById,
} from "@/lib/repository";
import type { ActionState } from "@/lib/types";
import {
  adminLoginSchema,
  adminPasswordChangeSchema,
  formDataToObject,
  suggestionSchema,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const voterCookieName = "vaexil_voter";
const FAILED_LOGIN_DELAY_MS = 500;

function delayFailedLogin() {
  return new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
}

function getSuggestionId(formData: FormData) {
  const value = formData.get("suggestionId");
  return typeof value === "string" ? value : "";
}

async function getVoterKey() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(voterCookieName)?.value;

  if (existing) {
    return existing;
  }

  const voterKey = crypto.randomUUID();
  cookieStore.set(voterCookieName, voterKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return voterKey;
}

export async function submitSuggestion(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = suggestionSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createSuggestion(parsed.data);
  revalidatePath("/suggestions");
  revalidatePath("/admin");

  return {
    ok: true,
    message:
      "Suggestion submitted. It is pending community votes and admin review.",
  };
}

export async function voteForSuggestion(formData: FormData) {
  const suggestionId = getSuggestionId(formData);
  if (!suggestionId) {
    return;
  }

  await addVote(suggestionId, await getVoterKey());
  revalidatePath("/suggestions");
  revalidatePath("/admin");
}

export async function loginAdmin(formData: FormData) {
  const parsed = adminLoginSchema.safeParse(formDataToObject(formData));
  if (!parsed.success || !(await passwordMatches(parsed.data.password))) {
    await delayFailedLogin();
    redirect("/admin?error=invalid");
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin");
}

export async function changeAdminPassword(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();

  const parsed = adminPasswordChangeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!(await passwordMatches(parsed.data.currentPassword))) {
    return {
      ok: false,
      message: "Current password is incorrect.",
      fieldErrors: {
        currentPassword: ["Current password is incorrect."],
      },
    };
  }

  await setStoredAdminPassword(parsed.data.newPassword);
  await setAdminSession();
  revalidatePath("/admin");

  return {
    ok: true,
    message: "Admin password changed.",
  };
}

export async function rejectSuggestion(formData: FormData) {
  await assertAdmin();
  const suggestionId = getSuggestionId(formData);
  if (suggestionId) {
    await rejectSuggestionById(suggestionId);
  }

  revalidatePath("/admin");
  revalidatePath("/suggestions");
}

export async function verifySuggestion(formData: FormData) {
  await assertAdmin();
  const suggestionId = getSuggestionId(formData);
  if (suggestionId) {
    await verifySuggestionById(suggestionId);
  }

  revalidatePath("/admin");
  revalidatePath("/suggestions");
}

export async function publishSuggestion(formData: FormData) {
  await assertAdmin();
  const suggestionId = getSuggestionId(formData);
  if (suggestionId) {
    await publishSuggestionById(suggestionId);
  }

  revalidatePath("/admin");
  revalidatePath("/suggestions");
  revalidatePath("/guides/freelancer-free-items");
}
