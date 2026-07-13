import type { AnswerFact, ChatMessage, DrawingCandidate, MapDocument, SourceDocument } from "./types";
import type { Report } from "../report-search/types";

export const panelMinWidth = 240;
export const panelMaxWidth = 560;
export const panelDefaultWidth = 427;
export const panelCollapseDelay = 450;

export const sourcePanelMinWidth = 360;
export const sourcePanelMaxWidth = 1440;
export const sourcePanelDefaultWidth = 920;
export const sourcePanelWideBreakpoint = 1600;
export const sourcePanelExtraWideBreakpoint = 2000;
export const sourcePanelExtraWideDefaultWidth = 1400;
export const sourcePanelReservedChatWidth = 420;

export function getRightPanelDefaultWidth(viewportWidth: number) {
  if (viewportWidth <= sourcePanelWideBreakpoint) return sourcePanelDefaultWidth;
  if (viewportWidth >= sourcePanelExtraWideBreakpoint) return sourcePanelExtraWideDefaultWidth;

  const ratio =
    (viewportWidth - sourcePanelWideBreakpoint) /
    (sourcePanelExtraWideBreakpoint - sourcePanelWideBreakpoint);

  return Math.round(sourcePanelDefaultWidth + ratio * (sourcePanelExtraWideDefaultWidth - sourcePanelDefaultWidth));
}

export function getRightPanelMaxWidth(
  viewportWidth: number,
  openReportPanelWidth: number,
  reservedChatWidth = sourcePanelReservedChatWidth,
) {
  const availableWidth = Math.max(
    sourcePanelMinWidth,
    viewportWidth - openReportPanelWidth - reservedChatWidth,
  );
  return Math.min(sourcePanelMaxWidth, availableWidth);
}

export function getRightPanelWidth(viewportWidth: number, openReportPanelWidth: number) {
  return Math.min(getRightPanelDefaultWidth(viewportWidth), getRightPanelMaxWidth(viewportWidth, openReportPanelWidth));
}

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

export function createImageMatchAssistantMessage(id: number): ChatMessage {
  return {
    id,
    role: "assistant",
    text: "업로드한 이미지는 토기가마 도면으로 보입니다.\n선택한 보고서 안에는 a보고서 p.32의 도면과 가장 유사합니다.",
    drawingCandidates,
  };
}

export const drawingCandidates: DrawingCandidate[] = [
  {
    id: 1,
    pageLabel: "p.032",
    typeLabel: "도면",
    similarity: 12,
    reportTitle: "함안 윤내리 토기가마 I",
    title: "도면 14. 1~2호 토기가마 평면도",
  },
  {
    id: 2,
    pageLabel: "p.032",
    typeLabel: "도면",
    similarity: 4,
    reportTitle: "함안 윤내리 토기가마 I",
    title: "도면 14. 1~2호 토기가마 평면도",
    hasSource: true,
  },
];

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

export const mapDocument: MapDocument = {
  title: "함안 윤내리 토기가마",
  location: "함안 윤내리 1443 번지",
  baseLayers: [
    { label: "대표 좌표", tone: "pin" },
    { label: "조사 범위", tone: "survey" },
    { label: "주변 유적", tone: "ruins" },
    { label: "보고서 도면", tone: "drawing" },
  ],
  activeLayers: ["국가지정유산 보호구역", "연속지적도(부번)"],
  advancedTabs: ["기본", "필지", "도면", "주변"],
  layerRoots: [
    {
      label: "국가유산",
      children: [
        {
          label: "지정유산",
          children: [
            {
              label: "국가지정",
              checked: true,
              children: [
                { label: "국가등록문화유산", checked: false },
                { label: "국가등록문화유산", checked: false },
                { label: "국가지정유산보호구역주기", checked: true },
              ],
            },
            { label: "시도지정", checked: false },
            { label: "시군구지정", checked: false },
            { label: "국가등록", checked: false },
          ],
        },
      ],
    },
    {
      label: "활용 주제도",
      children: [
        { label: "문화유산 활용권역", checked: true },
        { label: "역사문화환경", checked: true },
        { label: "관광 활용 주제도", checked: true },
      ],
    },
    {
      label: "도시 계획",
      children: [
        { label: "도시지역", checked: true },
        { label: "관리지역", checked: true },
      ],
    },
    {
      label: "고급 레이어",
      children: [
        {
          label: "위치·필지",
          children: [
            { label: "도시지역", checked: false },
            { label: "연속지적도(부번)", checked: true },
          ],
        },
      ],
    },
  ],
};
