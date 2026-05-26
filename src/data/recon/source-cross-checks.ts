import sourceCrossChecks from "@/data/recon/source-cross-checks.json";

export type ReconSourceCrossCheckStatus =
  | "position_cross_checked"
  | "needs_manual_position_review"
  | "source_gap";

export type ReconSourceCrossCheckResultStatus =
  | "match"
  | "mismatch"
  | "scope_delta"
  | "pending"
  | "source_gap";

export type ReconSourceCrossCheckSource = {
  label: string;
  url: string;
  coverage: string;
  notes: string;
};

export type ReconSourceCrossCheckResult = {
  label: string;
  status: ReconSourceCrossCheckResultStatus;
  localValue: string;
  sourceValue: string;
  notes: string;
};

export type ReconSourceCrossCheck = {
  mapId: string;
  gameId: string;
  status: ReconSourceCrossCheckStatus;
  lastReviewed: string;
  localMarkerCount: number;
  localWorkbenchCount: number;
  summary: string;
  sources: ReconSourceCrossCheckSource[];
  checks: ReconSourceCrossCheckResult[];
  warnings: string[];
  nextSteps: string[];
};

const checks = sourceCrossChecks as ReconSourceCrossCheck[];

export function listReconSourceCrossChecks() {
  return checks;
}

export function getReconSourceCrossCheck(mapId: string) {
  return checks.find((check) => check.mapId === mapId) || null;
}
