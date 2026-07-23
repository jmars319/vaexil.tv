import type { BungieSession } from "@/lib/bungie-session";

const BUNGIE_AUTHORIZATION_URL = "https://www.bungie.net/en/OAuth/Authorize";
const BUNGIE_TOKEN_URL = "https://www.bungie.net/platform/app/oauth/token/";
const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60_000;

type BungieTokenResponse = {
  access_token?: string;
  expires_in?: number;
  membership_id?: string;
  refresh_token?: string;
  refresh_expires_in?: number;
};

type ValidatedTokenResponse = BungieTokenResponse & {
  access_token: string;
  expires_in: number;
};

function requireEnvironmentValue(key: string) {
  const value = process.env[key]?.trim() ?? "";
  if (!value) {
    throw new Error(`${key} is not configured.`);
  }

  return value;
}

function getOauthClient() {
  const redirectUri = requireEnvironmentValue("BUNGIE_OAUTH_REDIRECT_URI");
  const parsedRedirectUri = new URL(redirectUri);

  if (parsedRedirectUri.protocol !== "https:") {
    throw new Error("BUNGIE_OAUTH_REDIRECT_URI must use HTTPS.");
  }

  return {
    clientId: requireEnvironmentValue("BUNGIE_OAUTH_CLIENT_ID"),
    clientSecret: requireEnvironmentValue("BUNGIE_OAUTH_CLIENT_SECRET"),
    redirectUri,
  };
}

function getBasicAuthorizationHeader() {
  const { clientId, clientSecret } = getOauthClient();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString(
    "base64",
  );

  return `Basic ${credentials}`;
}

async function requestToken(body: URLSearchParams): Promise<ValidatedTokenResponse> {
  const response = await fetch(BUNGIE_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: getBasicAuthorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as BungieTokenResponse | null;

  if (!response.ok || !payload?.access_token || !payload.expires_in) {
    throw new Error("Bungie rejected the OAuth token request.");
  }

  return {
    ...payload,
    access_token: payload.access_token,
    expires_in: payload.expires_in,
  };
}

export function getBungieAuthorizationUrl(state: string) {
  const { clientId } = getOauthClient();
  const url = new URL(BUNGIE_AUTHORIZATION_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return url;
}

export function getArmorOptimizerUrl(status?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://vaexil.tv";
  const url = new URL("/tools/destiny2/armor-optimizer", siteUrl);

  if (status) {
    url.searchParams.set("bungie", status);
  }

  return url;
}

export async function exchangeAuthorizationCode(code: string): Promise<BungieSession> {
  const payload = await requestToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }),
  );

  if (
    !payload.refresh_token ||
    !payload.refresh_expires_in ||
    !payload.membership_id
  ) {
    throw new Error("Bungie did not return a confidential-client session.");
  }

  const now = Date.now();
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    accessExpiresAt: now + payload.expires_in * 1000,
    refreshExpiresAt: now + payload.refresh_expires_in * 1000,
    bungieMembershipId: payload.membership_id,
  };
}

export async function refreshBungieSession(
  session: BungieSession,
): Promise<BungieSession> {
  if (session.refreshExpiresAt <= Date.now()) {
    throw new Error("The Bungie session has expired.");
  }

  const payload = await requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    }),
  );
  const now = Date.now();

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || session.refreshToken,
    accessExpiresAt: now + payload.expires_in * 1000,
    refreshExpiresAt: payload.refresh_expires_in
      ? now + payload.refresh_expires_in * 1000
      : session.refreshExpiresAt,
    bungieMembershipId: payload.membership_id || session.bungieMembershipId,
  };
}

export async function ensureFreshBungieSession(session: BungieSession) {
  if (session.accessExpiresAt - Date.now() > ACCESS_TOKEN_REFRESH_WINDOW_MS) {
    return { session, refreshed: false };
  }

  return {
    session: await refreshBungieSession(session),
    refreshed: true,
  };
}
