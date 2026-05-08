import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { ensureDb, getDb } from "@/lib/db";

const adminCookieName = "vaexil_admin";
const maxAgeSeconds = 60 * 60 * 24 * 7;
const adminPasswordHashKey = "admin_password_hash";
const passwordHashPrefix = "scrypt";

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

async function getStoredAdminPasswordHash() {
  await ensureDb();

  const result = await getDb().execute({
    sql: "SELECT value FROM admin_settings WHERE key = ? LIMIT 1;",
    args: [adminPasswordHashKey],
  });

  const value = result.rows[0]?.value;
  return typeof value === "string" ? value : "";
}

export async function adminPasswordIsUsable() {
  return (
    getAdminPassword().length > 0 ||
    (await getStoredAdminPasswordHash()).length > 0
  );
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${passwordHashPrefix}$${salt}$${hash}`;
}

function verifyPasswordHash(password: string, storedHash: string) {
  const [prefix, salt, expectedHash] = storedHash.split("$");

  if (prefix !== passwordHashPrefix || !salt || !expectedHash) {
    return false;
  }

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export async function setStoredAdminPassword(password: string) {
  await ensureDb();

  await getDb().execute({
    sql: `
      INSERT INTO admin_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP;
    `,
    args: [adminPasswordHashKey, hashPassword(password)],
  });
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

export async function passwordMatches(value: string) {
  const storedHash = await getStoredAdminPasswordHash();
  if (storedHash && verifyPasswordHash(value, storedHash)) {
    return true;
  }

  const configuredPassword = getAdminPassword();
  if (!configuredPassword) {
    return false;
  }

  return safeCompare(value, configuredPassword);
}
