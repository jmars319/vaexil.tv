import { cn } from "@/lib/utils";
import Link from "next/link";

export function Section({
  children,
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>
      ) : null}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.12] px-5 text-sm font-semibold text-slate-100 transition hover:border-fuchsia-300/60 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200/70"
    >
      {children}
    </Link>
  );
}

export function ExternalButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.12] px-5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
    >
      {children}
    </a>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replaceAll("_", " ");
  const statusStyles =
    status === "ready_for_review"
      ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100"
      : status === "verified"
        ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100"
        : status === "published"
          ? "border-fuchsia-300/50 bg-fuchsia-300/10 text-fuchsia-100"
          : status === "rejected"
            ? "border-rose-300/50 bg-rose-300/10 text-rose-100"
            : "border-white/10 bg-white/5 text-slate-300";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        statusStyles,
      )}
    >
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Panel className="p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </Panel>
  );
}
