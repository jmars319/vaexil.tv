"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

type FieldErrors = Record<string, string[] | undefined>;

const inquiryTypes = [
  "Collaboration",
  "Promotion",
  "Stream question",
  "VaexCore",
  "Other",
];

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-200">{errors[0]}</p>;
}

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [startedAt, setStartedAt] = useState(() => Date.now());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("loading");
    setMessage("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFieldErrors(payload.fieldErrors ?? {});
        throw new Error(payload.error || "Unable to send the message.");
      }

      form.reset();
      setStartedAt(Date.now());
      setStatus("success");
      setMessage(
        payload.message ||
          "Message recorded. Expect a reply when Vaexil contact intake is reviewed.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try the form again in a moment.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6"
    >
      <input type="hidden" name="startedAt" value={startedAt} />
      <input
        type="text"
        name="vaexil_hp"
        autoComplete="new-password"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
        aria-label="Leave this field blank"
      />
      {message ? (
        <div
          className={
            status === "success"
              ? "mb-5 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100"
              : "mb-5 rounded-xl border border-rose-300/40 bg-rose-300/10 px-4 py-3 text-sm text-rose-100"
          }
          role="status"
        >
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-sm font-medium text-slate-200">Name</span>
          <input
            name="name"
            autoComplete="name"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldError errors={fieldErrors.name} />
        </label>
        <label>
          <span className="text-sm font-medium text-slate-200">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldError errors={fieldErrors.email} />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-sm font-medium text-slate-200">
            Organization optional
          </span>
          <input
            name="organization"
            autoComplete="organization"
            placeholder="Brand, channel, studio, or company"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldError errors={fieldErrors.organization} />
        </label>
        <label>
          <span className="text-sm font-medium text-slate-200">
            Inquiry type
          </span>
          <select
            name="inquiryType"
            defaultValue="Collaboration"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          >
            {inquiryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <FieldError errors={fieldErrors.inquiryType} />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-200">Message</span>
        <textarea
          name="message"
          rows={7}
          placeholder="Share the context, timing, links, and what you want to discuss."
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
        />
        <FieldError errors={fieldErrors.message} />
      </label>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Public contact runs through this form so requests keep enough context
          to review cleanly.
        </p>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="mr-2 size-4" aria-hidden="true" />
          {status === "loading" ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
