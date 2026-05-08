"use client";

import { submitSuggestion } from "@/app/actions";
import type { ActionState } from "@/lib/types";
import { Send } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const initialState: ActionState = {
  ok: false,
  message: "",
};

const fields = [
  {
    name: "itemName",
    label: "Item name",
    placeholder: "Use the exact item name if known",
  },
  {
    name: "category",
    label: "Category",
    placeholder: "Tool, setup note, route note, etc.",
  },
  {
    name: "mapName",
    label: "Map name",
    placeholder: "Use placeholder text if this needs admin confirmation",
  },
];

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
      <Send className="mr-2 size-4" aria-hidden="true" />
      {pending ? "Submitting..." : "Submit suggestion"}
    </button>
  );
}

export function SuggestionForm() {
  const [state, formAction] = useActionState(submitSuggestion, initialState);

  return (
    <form action={formAction} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
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

      <div className="grid gap-4 md:grid-cols-3">
        {fields.map((field) => (
          <label key={field.name}>
            <span className="text-sm font-medium text-slate-200">
              {field.label}
            </span>
            <input
              name={field.name}
              placeholder={field.placeholder}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            />
            <FieldErrors errors={state.fieldErrors?.[field.name]} />
          </label>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-sm font-medium text-slate-200">
            Location description
          </span>
          <textarea
            name="locationDescription"
            rows={6}
            placeholder="Describe where the item or correction belongs. It will stay pending until reviewed."
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.locationDescription} />
        </label>
        <label>
          <span className="text-sm font-medium text-slate-200">Notes</span>
          <textarea
            name="notes"
            rows={6}
            placeholder="Add caveats, context, or what needs to be verified."
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.notes} />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-200">
          Source URL optional
        </span>
        <input
          name="sourceUrl"
          type="url"
          placeholder="https://..."
          className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
        />
        <FieldErrors errors={state.fieldErrors?.sourceUrl} />
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Suggestions are saved as pending. Five votes marks them ready for
          review, but only an admin can verify and publish them.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
