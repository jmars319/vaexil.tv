export type SuggestionStatus =
  | "pending"
  | "ready_for_review"
  | "verified"
  | "rejected"
  | "published";

export type OfficialGuideItem = {
  id: string;
  itemName: string;
  category: string;
  mapName: string;
  locationDescription: string;
  notes: string;
  verified: boolean;
  createdAt: string;
};

export type CommunitySuggestion = {
  id: string;
  itemName: string;
  category: string;
  mapName: string;
  locationDescription: string;
  notes: string;
  sourceUrl: string | null;
  status: SuggestionStatus;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  organization: string;
  inquiryType: string;
  message: string;
  status: string;
  emailStatus: string;
  createdAt: string;
};

export type AnalyticsSummary = {
  viewsLast7Days: number;
  viewsLast30Days: number;
  topPaths: {
    path: string;
    views: number;
  }[];
  recentDays: {
    day: string;
    views: number;
  }[];
};

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
