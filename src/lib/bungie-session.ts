import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const BUNGIE_SESSION_COOKIE = "vaexil-bungie-session";
export const BUNGIE_OAUTH_STATE_COOKIE = "vaexil-bungie-oauth-state";

const SESSION_VERSION = "v1";
const MINIMUM_SECRET_LENGTH = 32;

export type BungieSession = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
  bungieMembershipId: string;
};

function getSessionKey() {
  const secret = process.env.BUNGIE_OAUTH_SESSION_SECRET?.trim() ?? "";

  if (secret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error(
      `BUNGIE_OAUTH_SESSION_SECRET must contain at least ${MINIMUM_SECRET_LENGTH} characters.`,
    );
  }

  return createHash("sha256").update(secret, "utf8").digest();
}

export function assertBungieSessionConfigured() {
  void getSessionKey();
}

function isBungieSession(value: unknown): value is BungieSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.accessExpiresAt === "number" &&
    typeof candidate.refreshExpiresAt === "number" &&
    typeof candidate.bungieMembershipId === "string"
  );
}

export function sealBungieSession(session: BungieSession) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getSessionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const authenticationTag = cipher.getAuthTag();

  return [
    SESSION_VERSION,
    iv.toString("base64url"),
    authenticationTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function unsealBungieSession(value?: string) {
  if (!value) {
    return null;
  }

  const sessionKey = getSessionKey();

  try {
    const [version, ivValue, tagValue, ciphertextValue] = value.split(".");
    if (
      version !== SESSION_VERSION ||
      !ivValue ||
      !tagValue ||
      !ciphertextValue
    ) {
      return null;
    }

    const decipher = createDecipheriv(
      "aes-256-gcm",
      sessionKey,
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const parsed = JSON.parse(plaintext) as unknown;

    return isBungieSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getBungieSessionCookieOptions(refreshExpiresAt: number) {
  const remainingSeconds = Math.max(
    0,
    Math.floor((refreshExpiresAt - Date.now()) / 1000),
  );

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: remainingSeconds,
    priority: "high" as const,
  };
}

export function getExpiredBungieCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    priority: "high" as const,
  };
}

export function generateOauthState() {
  return randomBytes(32).toString("base64url");
}

export function oauthStatesMatch(expected?: string, received?: string) {
  if (!expected || !received) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function getOauthStateCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
    priority: "high" as const,
  };
}
