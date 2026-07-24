import {
  computeArmorTargetBuilds,
  type ArmorOptimizationConstraints,
  type OptimizerArmorPiece,
} from "@/lib/armor-optimizer";
import type { ArmorStats } from "@/lib/armor-stat-definitions";

type WorkerRequest =
  | { type: "initialize"; pieces: OptimizerArmorPiece[] }
  | {
      type: "calculate";
      requestId: number;
      constraints: ArmorOptimizationConstraints;
      targets: ArmorStats;
    };

type WorkerResponse = {
  requestId: number;
  maximums?: Record<string, number | null>;
  error?: string;
};

type ArmorWorkerScope = {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerResponse) => void;
};

const workerScope = self as unknown as ArmorWorkerScope;
let optimizerPieces: OptimizerArmorPiece[] = [];

workerScope.onmessage = (event) => {
  if (event.data.type === "initialize") {
    optimizerPieces = event.data.pieces;
    return;
  }

  const { requestId, constraints, targets } = event.data;
  try {
    const builds = computeArmorTargetBuilds(
      optimizerPieces,
      constraints,
      targets,
    );
    workerScope.postMessage({
      requestId,
      maximums: Object.fromEntries(
        builds.map((build) => [build.stat, build.potential]),
      ),
    });
  } catch {
    workerScope.postMessage({
      requestId,
      error: "Live potential calculation failed.",
    });
  }
};
