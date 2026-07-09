import type { Report } from "../report-search/types";

export type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  imageUrl?: string;
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
  similarityScore: number;
};

export type MapBaseLayer = {
  label: string;
  tone: "pin" | "survey" | "ruins" | "drawing";
};

export type MapLayerNode = {
  label: string;
  checked?: boolean;
  children?: MapLayerNode[];
};

export type MapDocument = {
  title: string;
  location: string;
  baseLayers: MapBaseLayer[];
  activeLayers: string[];
  advancedTabs: string[];
  layerRoots: MapLayerNode[];
};

export type RightPanelMode = "none" | "source" | "map";

export type ChatPageProps = {
  reports: Report[];
  onBack: () => void;
};
