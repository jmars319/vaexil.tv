"use client";

import type { ArmorStatMaximums } from "@/lib/armor-build-results";
import type { ArmorStats } from "@/lib/armor-stat-definitions";
import type {
  ArmorSetRequirement,
  OptimizerArmorPiece,
} from "@/lib/armor-optimizer";
import { useEffect, useRef, useState } from "react";

type LivePotentialWorkerResponse = {
  requestId: number;
  maximums?: ArmorStatMaximums;
  error?: string;
};

type UseArmorLivePotentialsProps = {
  pieces: OptimizerArmorPiece[];
  exotic: string;
  sets: ArmorSetRequirement[];
  targets: ArmorStats;
  initialMaximums: ArmorStatMaximums;
};

export function useArmorLivePotentials({
  pieces,
  exotic,
  sets,
  targets,
  initialMaximums,
}: UseArmorLivePotentialsProps) {
  const [maximums, setMaximums] = useState(initialMaximums);
  const [status, setStatus] = useState<"ready" | "updating" | "error">(
    "ready",
  );
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const firstCalculationRef = useRef(true);
  const setKey = sets
    .map((requirement) => `${requirement.setHash}:${requirement.count}`)
    .join(",");
  const targetKey = Object.values(targets).join(",");

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/armor-live-potentials.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;
    worker.postMessage({ type: "initialize", pieces });
    worker.onmessage = (event: MessageEvent<LivePotentialWorkerResponse>) => {
      if (event.data.requestId !== requestIdRef.current) return;
      if (event.data.error || !event.data.maximums) {
        setStatus("error");
        return;
      }
      setMaximums(event.data.maximums);
      setStatus("ready");
    };
    worker.onerror = () => setStatus("error");

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [pieces]);

  useEffect(() => {
    if (firstCalculationRef.current) {
      firstCalculationRef.current = false;
      return;
    }

    setStatus("updating");
    const timeout = window.setTimeout(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      workerRef.current?.postMessage({
        type: "calculate",
        requestId,
        constraints: { exotic, sets },
        targets,
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [exotic, setKey, sets, targetKey, targets]);

  return { maximums, status };
}
