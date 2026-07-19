"use client";

import {
  solveVerityDissection,
  validateVerityState,
  verityShape3dLabels,
  verityShapeLabels,
  verityShapes,
  verityShapes3d,
  veritySides,
  type VerityInstruction,
  type VerityShape,
  type VerityShape3d,
  type VeritySide,
} from "@/lib/destiny-verity";
import { useMemo, useState } from "react";

const sideLabels: Record<VeritySide, string> = {
  left: "Left",
  middle: "Middle",
  right: "Right",
};

export function VeritySolverTool() {
  return (
    <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-slate-950/50 p-4 sm:p-5 md:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Verity tool
          </p>
          <h4 className="mt-2 text-xl font-semibold text-white">Dissection calculator</h4>
        </div>
      </div>
      <div className="mt-5">
        <DissectionCalculator />
      </div>
    </div>
  );
}

function DissectionCalculator() {
  const [inside, setInside] = useState<VerityShape[]>(["C", "T", "S"]);
  const [outside, setOutside] = useState<VerityShape3d[]>(["CS", "TT", "CS"]);
  const validationMessage = validateVerityState(inside, outside);
  const instructions = useMemo(() => solveVerityDissection(inside, outside), [inside, outside]);
  const copyText = instructions.map(formatInstructionForChat).join(", ");

  function updateInside(index: number, shape: VerityShape) {
    setInside((current) => {
      const next = [...current];
      const previous = next[index];
      const existingIndex = next.indexOf(shape);
      next[index] = shape;

      if (existingIndex >= 0 && existingIndex !== index) {
        next[existingIndex] = previous;
      }

      return next;
    });
  }

  function updateOutside(index: number, shape: VerityShape3d) {
    setOutside((current) => current.map((value, valueIndex) => valueIndex === index ? shape : value));
  }

  return (
    <section className="rounded-xl border border-white/10 bg-black/25 p-4">
      <h5 className="text-lg font-semibold text-white">Dissection calculator</h5>
      <div className="mt-4">
        <div className="space-y-6">
          <ShapeSelectGroup
            title="Inside"
            values={inside}
            options={verityShapes}
            labels={verityShapeLabels}
            onSelect={updateInside}
          />
          <ShapeSelectGroup
            title="Outside"
            values={outside}
            options={verityShapes3d}
            labels={verityShape3dLabels}
            onSelect={updateOutside}
          />
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
          <ShapeLegend
            title="Inside symbols"
            values={verityShapes}
            labels={verityShapeLabels}
          />
          <ShapeLegend
            title="Outside shapes"
            values={verityShapes3d}
            labels={verityShape3dLabels}
          />
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Instructions
        </p>
        <InstructionList instructions={instructions} validationMessage={validationMessage} />
        <button
          type="button"
          disabled={!copyText}
          onClick={() => void navigator.clipboard.writeText(copyText)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy for game chat
        </button>
      </div>
    </section>
  );
}

function ShapeSelectGroup<T extends VerityShape | VerityShape3d>({
  title,
  values,
  options,
  labels,
  onSelect,
}: {
  title: string;
  values: T[];
  options: readonly T[];
  labels: Record<T, string>;
  onSelect: (index: number, value: T) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-lg font-semibold text-white">{title}</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {veritySides.map((side, index) => {
          const selectedShape = values[index];

          return (
            <label
              key={side}
              className="grid min-w-0 gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {sideLabels[side]}
              </span>
              <span className="flex min-w-0 items-center gap-3 rounded-xl border border-cyan-300/15 bg-black/30 p-3">
                <ShapeIllustration
                  shape={selectedShape}
                  className="size-14 shrink-0 text-cyan-100"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">
                    {labels[selectedShape]}
                  </span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200/70">
                    {selectedShape}
                  </span>
                </span>
              </span>
              <select
                value={selectedShape}
                onChange={(event) => onSelect(index, event.target.value as T)}
                className="min-h-11 w-full rounded-xl border border-cyan-300/20 bg-slate-950 px-3 text-sm font-semibold text-slate-100 outline-none focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/15"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option} - {labels[option]}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ShapeLegend<T extends VerityShape | VerityShape3d>({
  title,
  values,
  labels,
}: {
  title: string;
  values: readonly T[];
  labels: Record<T, string>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {values.map((shape) => (
          <div
            key={shape}
            className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-2 text-center"
            title={`${shape} - ${labels[shape]}`}
          >
            <ShapeIllustration
              shape={shape}
              className="mx-auto size-10 text-cyan-100"
            />
            <p className="mt-1 truncate text-[0.68rem] font-semibold text-slate-300">
              {shape} · {labels[shape]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShapeIllustration({
  shape,
  className = "",
}: {
  shape: VerityShape | VerityShape3d;
  className?: string;
}) {
  const commonProps = {
    viewBox: "0 0 64 64",
    className,
    "aria-hidden": true,
  };
  const strokeProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 3,
  };

  switch (shape) {
    case "C":
      return (
        <svg {...commonProps}>
          <circle cx="32" cy="32" r="20" {...strokeProps} />
          <circle cx="32" cy="32" r="11" className="fill-cyan-300/10" />
        </svg>
      );
    case "S":
      return (
        <svg {...commonProps}>
          <rect x="16" y="16" width="32" height="32" rx="3" {...strokeProps} />
          <rect x="23" y="23" width="18" height="18" className="fill-cyan-300/10" />
        </svg>
      );
    case "T":
      return (
        <svg {...commonProps}>
          <path d="M32 12 52 48H12L32 12Z" {...strokeProps} />
          <path d="M32 25 42 43H22L32 25Z" className="fill-cyan-300/10" />
        </svg>
      );
    case "CC":
      return (
        <svg {...commonProps}>
          <circle cx="32" cy="32" r="20" {...strokeProps} />
          <path d="M18 32h28M32 12c7 6 10 13 10 20s-3 14-10 20M32 12c-7 6-10 13-10 20s3 14 10 20" {...strokeProps} />
        </svg>
      );
    case "SS":
      return (
        <svg {...commonProps}>
          <path d="M18 22 32 14l14 8-14 8-14-8Z" {...strokeProps} />
          <path d="M18 22v20l14 8 14-8V22" {...strokeProps} />
          <path d="M32 30v20" {...strokeProps} />
          <path d="M20 42l12-7 12 7" className="fill-cyan-300/10" />
        </svg>
      );
    case "TT":
      return (
        <svg {...commonProps}>
          <path d="M32 12 52 48H12L32 12Z" {...strokeProps} />
          <path d="M32 12v36M32 48 12 48M32 48 52 48" {...strokeProps} />
          <path d="M32 12 24 48M32 12l8 36" className="opacity-70" {...strokeProps} />
        </svg>
      );
    case "CS":
      return (
        <svg {...commonProps}>
          <ellipse cx="32" cy="18" rx="17" ry="7" {...strokeProps} />
          <path d="M15 18v28c0 4 8 7 17 7s17-3 17-7V18" {...strokeProps} />
          <path d="M15 46c0 4 8 7 17 7s17-3 17-7" {...strokeProps} />
        </svg>
      );
    case "CT":
      return (
        <svg {...commonProps}>
          <path d="M32 10 14 47" {...strokeProps} />
          <path d="M32 10 50 47" {...strokeProps} />
          <ellipse cx="32" cy="47" rx="18" ry="7" {...strokeProps} />
          <path d="M22 47c2 3 18 3 20 0" className="fill-cyan-300/10" />
        </svg>
      );
    case "TS":
      return (
        <svg {...commonProps}>
          <path d="M16 46 30 18l18 28H16Z" {...strokeProps} />
          <path d="M30 18 42 12l18 28-12 6" {...strokeProps} />
          <path d="M48 46 60 40" {...strokeProps} />
          <path d="M16 46 28 40 60 40" className="opacity-70" {...strokeProps} />
        </svg>
      );
    default:
      return null;
  }
}

function InstructionList({
  instructions,
  validationMessage,
}: {
  instructions: VerityInstruction[];
  validationMessage: string;
}) {
  if (validationMessage) {
    return <p className="mt-3 text-sm leading-6 text-amber-100">{validationMessage}</p>;
  }

  if (instructions.length === 0) {
    return <p className="mt-3 text-sm leading-6 text-emerald-100">Already solved.</p>;
  }

  return (
    <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
      {instructions.map((instruction, index) => (
        <li key={`${formatInstructionForChat(instruction)}-${index}`}>
          {index + 1}. {formatInstruction(instruction)}
        </li>
      ))}
    </ol>
  );
}

function formatInstruction(instruction: VerityInstruction) {
  const [first, second] = instruction.swap;
  return `${sideLabels[first.side]} ${verityShapeLabels[first.shape]} <-> ${sideLabels[second.side]} ${verityShapeLabels[second.shape]} - ${instruction.expectedState.join(", ")}`;
}

function formatInstructionForChat(instruction: VerityInstruction) {
  const [first, second] = instruction.swap;
  return `${sideLabels[first.side]} ${verityShapeLabels[first.shape]} ${sideLabels[second.side]} ${verityShapeLabels[second.shape]}`;
}
