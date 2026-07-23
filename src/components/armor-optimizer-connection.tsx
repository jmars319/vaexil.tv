import {
  getBungieInventorySummary,
  type BungieInventorySummary,
} from "@/lib/bungie-inventory";
import {
  ArmorInventoryWorkbench,
  type ArmorWorkbenchSelection,
} from "@/components/armor-inventory-workbench";
import {
  BUNGIE_SESSION_COOKIE,
  unsealBungieSession,
} from "@/lib/bungie-session";
import { cookies } from "next/headers";

type ConnectionState =
  | { status: "disconnected"; message?: string }
  | { status: "refresh" }
  | { status: "error"; message: string }
  | { status: "connected"; inventory: BungieInventorySummary };

const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60_000;

async function getConnectionState(): Promise<ConnectionState> {
  try {
    const cookieStore = await cookies();
    const sealedSession = cookieStore.get(BUNGIE_SESSION_COOKIE)?.value;
    const session = unsealBungieSession(sealedSession);

    if (!session) {
      return { status: "disconnected" };
    }

    if (session.refreshExpiresAt <= Date.now()) {
      return {
        status: "disconnected",
        message: "Your Bungie connection expired. Connect again to continue.",
      };
    }

    if (session.accessExpiresAt - Date.now() <= ACCESS_TOKEN_REFRESH_WINDOW_MS) {
      return { status: "refresh" };
    }

    return {
      status: "connected",
      inventory: await getBungieInventorySummary(session.accessToken),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return {
      status: "error",
      message: message.includes("not configured") || message.includes("must contain")
        ? "Bungie authentication is not configured."
        : "Bungie inventory is temporarily unavailable.",
    };
  }
}

export async function ArmorOptimizerConnection({
  notice,
  selection,
}: {
  notice?: string;
  selection: ArmorWorkbenchSelection;
}) {
  const state = await getConnectionState();

  if (state.status === "refresh") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Refresh Bungie inventory</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Your secure access token is ready to refresh. This keeps the existing
          read-only Bungie connection without asking you to authorize again.
        </p>
        <form action="/api/auth/bungie/refresh" method="post" className="mt-6">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
          >
            Refresh inventory
          </button>
        </form>
      </div>
    );
  }

  if (state.status === "disconnected" || state.status === "error") {
    const message = state.status === "error" ? state.message : state.message || notice;
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="flex size-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-lg font-semibold text-cyan-100">
          <span aria-hidden="true">✓</span>
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-white">Connect your Bungie account</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Vaexil requests read-only Destiny 2 inventory access. Your OAuth tokens stay
          encrypted in an HTTP-only cookie and are never exposed to the optimizer UI.
        </p>
        {message ? (
          <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
            {message}
          </p>
        ) : null}
        <a
          href="/api/auth/bungie/start"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
        >
          Continue with Bungie
        </a>
      </div>
    );
  }

  const { inventory } = state;
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
              <span className="text-base" aria-hidden="true">●</span>
              Bungie connected
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {inventory.guardian.displayName}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Read-only inventory imported {new Date(inventory.importedAt).toLocaleString()}.
            </p>
          </div>
          <form action="/api/auth/bungie/logout" method="post">
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-semibold text-slate-200 transition hover:border-rose-300/40 hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/70"
            >
              Disconnect
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InventoryMetric label="Armor pieces" value={inventory.totals.armor} />
        <InventoryMetric label="Exotic rolls" value={inventory.totals.exotics} />
        <InventoryMetric label="Owned armor sets" value={inventory.totals.armorSets} />
        <InventoryMetric label="All instanced items" value={inventory.totals.instancedItems} />
      </div>

      {inventory.armor.length > 0 ? (
        <ArmorInventoryWorkbench
          armor={inventory.armor}
          armorSets={inventory.armorSets}
          defaultClass={inventory.defaultClass}
          selection={selection}
        />
      ) : (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-6">
          <h2 className="text-lg font-semibold text-amber-100">No armor instances found</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Bungie returned the account inventory, but none of its instanced items
            matched the five Destiny 2 armor buckets. Refresh after moving an armor
            piece to a character or the vault.
          </p>
        </div>
      )}
    </div>
  );
}

function InventoryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 font-mono text-3xl font-semibold text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
