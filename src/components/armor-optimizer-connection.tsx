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
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.065] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="min-w-0 xl:w-64 xl:shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-200" aria-hidden="true">●</span>
              <h2 className="truncate text-base font-semibold text-white">
                {inventory.guardian.displayName}
              </h2>
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
                Connected
              </span>
            </div>
            <p className="mt-1 truncate text-[11px] text-slate-500">
              Read-only import · {new Date(inventory.importedAt).toLocaleString()}
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-4">
            <InventoryMetric label="Armor" value={inventory.totals.armor} />
            <InventoryMetric label="Exotics" value={inventory.totals.exotics} />
            <InventoryMetric label="Armor sets" value={inventory.totals.armorSets} />
            <InventoryMetric label="All items" value={inventory.totals.instancedItems} />
          </div>

          <form action="/api/auth/bungie/logout" method="post" className="xl:ml-1">
            <button
              type="submit"
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:border-rose-300/40 hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/70"
            >
              Disconnect
            </button>
          </form>
        </div>
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
    <div className="rounded-lg border border-white/[0.08] bg-slate-950/25 px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-lg font-semibold leading-none text-slate-100">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
