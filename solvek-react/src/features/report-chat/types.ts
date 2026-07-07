import type { Report } from "../report-search/types";

export type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  hasEvidence?: boolean;
};

export type AnswerEvidenceAction = "source" | "map";

export type AnswerFact = {
  label: string;
  value: string;
  actions: AnswerEvidenceAction[];
};

export type SourceDocument = {
  title: string;
  pageLabel: string;
  pageImageUrl?: string;
  similarity: Array<{ label: string; tone: "blue" | "green" | "yellow" | "orange" }>;
};

export type ChatPageProps = {
  reports: Report[];
  onBack: () => void;
};
