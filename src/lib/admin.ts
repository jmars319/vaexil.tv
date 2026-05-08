import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const adminCookieName = "vaexil_admin";
const maxAgeSeconds = 60 * 60 * 24 * 7;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function adminPasswordIsConfigured() {
  return getAdminPassword().length > 0;
}

export async function isAdminAuthenticated() {
  const secret = getSessionSecret();
  if (!secret) {
    return false;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(adminCookieName)?.value;
  if (!value) {
    return false;
  }

  const [issuedAt, signature] = value.split(".");
  if (!issuedAt || !signature) {
    return false;
  }

  const issuedAtMs = Number(issuedAt);
  if (!Number.isFinite(issuedAtMs)) {
    return false;
  }

  if (Date.now() - issuedAtMs > maxAgeSeconds * 1000) {
    return false;
  }

  return safeCompare(sign(issuedAt), signature);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const issuedAt = String(Date.now());

  cookieStore.set(adminCookieName, `${issuedAt}.${sign(issuedAt)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
}

export async function assertAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Admin session required.");
  }
}

export function passwordMatches(value: string) {
  const configuredPassword = getAdminPassword();
  if (!configuredPassword) {
    return false;
  }

  return safeCompare(value, configuredPassword);
}
