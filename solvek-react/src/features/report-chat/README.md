# Report Chat Feature

선택한 발굴보고서를 기준으로 질문하고, AI 답변의 근거 원문을 확인하는 챗봇 화면입니다. 메인 검색 화면에서 `채팅하기`를 누르면 `App.tsx`가 선택한 보고서 id를 `Report[]`로 변환해 `ChatPage`에 전달합니다.

메인 검색 화면은 최대 2건까지만 챗봇으로 전달합니다. 그룹 헤더의 `채팅하기`가 3건 이상을 대상으로 하면 메인에서 앞 2건만 선택하고 토스트를 표시한 뒤, 사용자가 하단 `채팅하기`를 눌러 이 화면으로 들어옵니다.

## File Map

| file | role |
|---|---|
| `ChatPage.tsx` | 챗봇 화면 컨테이너. 패널, 검색 모달, 메시지, 원문 패널 상태를 관리합니다. |
| `components/ReportChatSidePanel.tsx` | 왼쪽 선택 보고서 목록 패널입니다. |
| `components/ChatConversation.tsx` | 중앙 채팅 본문, 추천 질문, 메시지 입력 영역입니다. |
| `components/ChatSearchModal.tsx` | 챗봇 화면에서 보고서를 추가 검색하는 모달입니다. |
| `components/SourcePanel.tsx` | 오른쪽 원문 이미지 패널입니다. |
| `components/ResizeHandle.tsx` | 좌우 패널 너비 조절 핸들입니다. |
| `data.ts` | 챗봇 프로토타입용 응답, 추천 질문, 원문 패널 임시 데이터입니다. |
| `types.ts` | 챗봇 화면 타입입니다. |

## Main Responsibilities

- 메인에서 전달된 보고서를 왼쪽 패널에 표시합니다.
- 사용자가 체크한 보고서를 현재 대화 대상 `activeReportIds`로 관리합니다.
- 대화 대상은 최소 1건 이상 유지합니다.
- 질문 입력 또는 추천 질문 클릭 시 사용자 메시지와 임시 AI 답변을 추가합니다.
- AI 답변의 `원문` 버튼을 누르면 오른쪽 원문 패널을 엽니다.
- 보고서 검색 버튼을 누르면 검색 모달을 열고, 메인 검색과 같은 단서/칩 UI를 재사용합니다.

## Backend Handoff Notes

실제 API 연결 시 교체할 위치입니다.

- `createAssistantMessage`: 실제 챗봇 답변 API 응답으로 교체
- `answerFacts`: 답변에서 추출한 근거 항목으로 교체
- `sourceDocument`: DB 원문 이미지/페이지/유사도 데이터로 교체
- `searchedReports`: 보고서 검색 API 결과로 교체

## Source Panel Data

원문 패널은 현재 아래 구조를 기대합니다.

```ts
type SourceDocument = {
  title: string;
  pageLabel: string;
  pageImageUrl?: string;
  similarityScore: number;
};
```

`pageImageUrl`이 있으면 이미지를 표시하고, 없으면 DB 원문 이미지 영역 placeholder를 표시합니다.
