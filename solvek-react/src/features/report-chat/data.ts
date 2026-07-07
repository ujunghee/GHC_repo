import type { AnswerFact, ChatMessage, SourceDocument } from "./types";
import type { Report } from "../report-search/types";

export const panelMinWidth = 240;
export const panelMaxWidth = 560;
export const panelDefaultWidth = 427;
export const panelCollapseDelay = 450;

export const sourcePanelMinWidth = 360;
export const sourcePanelMaxWidth = 720;
export const sourcePanelDefaultWidth = 500;

export function getChatTargetLabel(activeReports: Report[]) {
  if (activeReports.length === 0) return "선택된 보고서";
  if (activeReports.length === 1) return activeReports[0].title;
  return `${activeReports[0].title} 외 ${activeReports.length - 1}건`;
}

export function getSuggestionLabels(activeReports: Report[]) {
  if (activeReports.length === 0) return [];

  const firstTitle = activeReports[0].title;
  const compareLabel = activeReports.length > 1 ? "선택한 보고서끼리 비교해줘" : `${firstTitle}의 주요 유물을 알려줘`;

  return [
    `선택한 ${activeReports.length}건 전체를 요약해줘`,
    `${firstTitle} 자세히 볼래`,
    compareLabel,
    "보고서 위치를 지도에서 보여줘",
    "이미지/도면을 올려 비교할래",
  ];
}

export function createAssistantMessage(id: number): ChatMessage {
  return {
    id,
    role: "assistant",
    text: "선택한 보고서는 모두 함안 지역의 토기가마 유적을 다룬 발굴조사 보고서입니다. 공통적으로 토기가마의 입지, 구조, 출토 유물, 조사 결과를 중심으로 설명하고 있습니다.",
    hasEvidence: true,
  };
}

export const answerFacts: AnswerFact[] = [
  { label: "조사 위치", value: "함안 지역 일대 토기가마 유적", actions: ["source", "map"] },
  { label: "주요 유구", value: "토기가마, 작업장, 폐기장", actions: ["source"] },
  { label: "출토 유물", value: "토기편과 소성 관련 유물", actions: ["source", "map"] },
  { label: "핵심 결과", value: "5세기 전후 토기 생산 체계와 폐기 양상 확인", actions: ["source"] },
];

export const sourceDocument: SourceDocument = {
  title: "함안 윤내리 토기가마",
  pageLabel: "p.12",
  pageImageUrl: "",
  similarityScore: 80,
};
