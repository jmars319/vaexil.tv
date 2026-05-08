"use client";

import { changeAdminPassword } from "@/app/actions";
import type { ActionState } from "@/lib/types";
import { Save } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const initialState: ActionState = {
  ok: false,
  message: "",
};

function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-200">{errors[0]}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save className="mr-2 size-4" aria-hidden="true" />
      {pending ? "Saving..." : "Change password"}
    </button>
  );
}

export function ChangeAdminPasswordForm() {
  const [state, formAction] = useActionState(
    changeAdminPassword,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6"
    >
      {state.message ? (
        <div
          className={
            state.ok
              ? "mb-5 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100"
              : "mb-5 rounded-xl border border-rose-300/40 bg-rose-300/10 px-4 py-3 text-sm text-rose-100"
          }
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <label>
          <span className="text-sm font-medium text-slate-200">
            Current password
          </span>
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.currentPassword} />
        </label>

        <label>
          <span className="text-sm font-medium text-slate-200">
            New password
          </span>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.newPassword} />
        </label>

        <label>
          <span className="text-sm font-medium text-slate-200">
            Confirm password
          </span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.confirmPassword} />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          New passwords must be at least 12 characters. The value is hashed
          before it is stored.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
