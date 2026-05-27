export type ReconSourceCrossCheckStatus =
  | "position_cross_checked"
  | "needs_manual_position_review"
  | "source_gap";

export type ReconVisualReviewStatus =
  | "visual_sources_compared"
  | "partial_visual_sources_compared"
  | "source_limited";

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

export type ReconVisualReview = {
  status: ReconVisualReviewStatus;
  lastCompared: string;
  summary: string;
  findings: string[];
  manualReviewFocus: string[];
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
  visualReview: ReconVisualReview;
  checks: ReconSourceCrossCheckResult[];
  warnings: string[];
  nextSteps: string[];
};

export async function listStaticReconSourceCrossChecks() {
  const sourceCrossCheckData = await import(
    "@/data/recon/source-cross-checks.json"
  );
  return sourceCrossCheckData.default as ReconSourceCrossCheck[];
}

export async function getStaticReconSourceCrossCheck(mapId: string) {
  const checks = await listStaticReconSourceCrossChecks();
  return checks.find((check) => check.mapId === mapId) || null;
}
