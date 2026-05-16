import {
  loginAdmin,
  logoutAdmin,
  publishSuggestion,
  rejectSuggestion,
  verifySuggestion,
} from "@/app/actions";
import { ChangeAdminPasswordForm } from "@/components/admin-password-form";
import { Section, SectionHeading, StatusBadge } from "@/components/ui";
import { adminPasswordIsUsable, isAdminAuthenticated } from "@/lib/admin";
import {
  getAnalyticsSummary,
  listRecentContactSubmissions,
  listSuggestions,
} from "@/lib/repository";
import type { AnalyticsSummary, ContactSubmission } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Crosshair, ExternalLink, KeyRound, LogOut } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin",
  description: "Lightweight Vaexil.tv admin queue for suggestions.",
  robots: {
    index: false,
    follow: false,
  },
};

export const runtime = "nodejs";

type AdminPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const authenticated = await isAdminAuthenticated();
  const params = await searchParams;

  if (!authenticated) {
    const configured = await adminPasswordIsUsable();
    return (
      <AdminLogin configured={configured} hasError={params.error === "invalid"} />
    );
  }

  const [suggestions, recentContacts, analyticsSummary] = await Promise.all([
    listSuggestions({ includeClosed: true }),
    listRecentContactSubmissions(),
    getAnalyticsSummary(),
  ]);

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="Admin queue"
            description="Review community suggestions, reject incorrect entries, verify useful entries, and publish verified rows into the official guide table."
          />
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.12] px-5 text-sm font-semibold text-slate-100 transition hover:border-rose-300/60 hover:bg-rose-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/70"
            >
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </Section>

      <Section className="pt-4">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <KeyRound className="size-6 text-cyan-200" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold text-white">Security</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The environment password is the bootstrap fallback. Password
              changes made here are stored as a hash in the production database.
            </p>
          </div>
          <ChangeAdminPasswordForm />
        </div>
      </Section>

      <Section className="pt-4">
        <Link
          href="/admin/recon"
          className="flex flex-col gap-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5 transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.09] sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            <span className="flex items-center gap-3 text-lg font-semibold text-white">
              <Crosshair className="size-6 text-cyan-200" aria-hidden="true" />
              Recon coordinate capture
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-400">
              Review draft map records and save private normalized marker
              captures for later verification.
            </span>
          </span>
          <span className="text-sm font-semibold text-cyan-100">Open Recon</span>
        </Link>
      </Section>

      <Section className="pt-4">
        <div className="grid gap-5 lg:grid-cols-2">
          <AnalyticsPanel summary={analyticsSummary} />
          <ContactPanel contacts={recentContacts} />
        </div>
      </Section>

      <Section className="pt-4">
        {suggestions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center text-sm text-slate-400">
            No suggestions have been submitted.
          </div>
        ) : (
          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <article
                key={suggestion.id}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={suggestion.status} />
                      <span className="text-xs text-slate-500">
                        {suggestion.voteCount} votes / Submitted{" "}
                        {formatDate(suggestion.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-white">
                      {suggestion.itemName}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {suggestion.category} / {suggestion.mapName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.status === "pending" ||
                    suggestion.status === "ready_for_review" ? (
                      <AdminActionButton
                        action={verifySuggestion}
                        suggestionId={suggestion.id}
                        label="Verify"
                        tone="cyan"
                      />
                    ) : null}
                    {suggestion.status === "verified" ? (
                      <AdminActionButton
                        action={publishSuggestion}
                        suggestionId={suggestion.id}
                        label="Publish"
                        tone="fuchsia"
                      />
                    ) : null}
                    {suggestion.status !== "rejected" &&
                    suggestion.status !== "published" ? (
                      <AdminActionButton
                        action={rejectSuggestion}
                        suggestionId={suggestion.id}
                        label="Reject"
                        tone="rose"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Location
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {suggestion.locationDescription}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Notes
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {suggestion.notes}
                    </p>
                  </div>
                </div>
                {suggestion.sourceUrl ? (
                  <a
                    href={suggestion.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100"
                  >
                    Source
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function AnalyticsPanel({ summary }: { summary: AnalyticsSummary }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
        Light analytics
      </p>
      <h2 className="mt-4 text-xl font-semibold text-white">
        Public page views
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        A small first-party snapshot for public route traffic. Admin, API, and
        framework asset routes are excluded.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-2xl font-semibold text-white">
            {summary.viewsLast7Days}
          </p>
          <p className="mt-1 text-sm text-slate-400">Last 7 days</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-2xl font-semibold text-white">
            {summary.viewsLast30Days}
          </p>
          <p className="mt-1 text-sm text-slate-400">Last 30 days</p>
        </div>
      </div>
      {summary.topPaths.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
          No page views have been recorded yet.
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {summary.topPaths.map((item) => (
            <div
              key={item.path}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-400"
            >
              <span className="truncate">{item.path}</span>
              <span className="font-semibold text-slate-100">{item.views}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactPanel({ contacts }: { contacts: ContactSubmission[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
        Contact intake
      </p>
      <h2 className="mt-4 text-xl font-semibold text-white">
        Recent messages
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Vaexil contact form submissions are recorded before email delivery is
        marked as sent, failed, or disabled.
      </p>
      {contacts.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-400">
          No contact messages have been recorded yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {contacts.map((contact) => (
            <article
              key={contact.id}
              className="rounded-xl border border-white/10 bg-slate-950/50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {contact.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {contact.email}
                    {contact.organization ? ` / ${contact.organization}` : ""}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-white/10 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  email {contact.emailStatus}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                {contact.inquiryType} / {formatDate(contact.createdAt)}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                {contact.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminLogin({
  configured,
  hasError,
}: {
  configured: boolean;
  hasError: boolean;
}) {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Admin"
          description="This first version uses a bootstrap password, an optional database-stored password, and a signed session cookie. It is intentionally lightweight for early deployment."
        />
      </Section>
      <Section className="pt-4">
        <form
          action={loginAdmin}
          className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/[0.035] p-6"
        >
          {!configured ? (
            <div className="mb-5 rounded-xl border border-rose-300/40 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              Set ADMIN_PASSWORD before using the admin area.
            </div>
          ) : null}
          {hasError ? (
            <div className="mb-5 rounded-xl border border-rose-300/40 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              Invalid admin password.
            </div>
          ) : null}
          <label>
            <span className="text-sm font-medium text-slate-200">
              Admin password
            </span>
            <input
              name="password"
              type="password"
              disabled={!configured}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>
          <button
            type="submit"
            disabled={!configured}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in
          </button>
        </form>
      </Section>
    </>
  );
}

function AdminActionButton({
  action,
  suggestionId,
  label,
  tone,
}: {
  action: (formData: FormData) => Promise<void>;
  suggestionId: string;
  label: string;
  tone: "cyan" | "fuchsia" | "rose";
}) {
  const toneClass =
    tone === "cyan"
      ? "border-cyan-300/40 text-cyan-100 hover:bg-cyan-300/10"
      : tone === "fuchsia"
        ? "border-fuchsia-300/40 text-fuchsia-100 hover:bg-fuchsia-300/10"
        : "border-rose-300/40 text-rose-100 hover:bg-rose-300/10";

  return (
    <form action={action}>
      <input type="hidden" name="suggestionId" value={suggestionId} />
      <button
        type="submit"
        className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${toneClass}`}
      >
        {label}
      </button>
    </form>
  );
}
