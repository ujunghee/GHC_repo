# Report Chat Feature

선택한 발굴보고서를 기준으로 질문하고, AI 답변의 근거 원문을 확인하는 챗봇 화면입니다. 메인 검색 화면에서 `채팅하기`를 누르면 `App.tsx`가 선택한 보고서 id를 `Report[]`로 변환해 `ChatPage`에 전달합니다.

메인 검색 화면은 사용자가 선택한 보고서 id를 그대로 챗봇 화면에 전달합니다. 선택 가능한 최대 보고서 수는 프론트에서 고정하지 않고, 채팅 세션 생성 API의 정책과 응답 메시지를 기준으로 처리합니다.

## UI Replacement

사용자가 제공한 새 챗봇 UI 화면을 현재 기능 위에 덮어씌울 때는 `CHAT_UI_SCREEN_SPEC.md`를 먼저 읽고, 이어서 `CHAT_UI_REPLACEMENT_HANDOFF.md`를 읽습니다.

- `CHAT_UI_SCREEN_SPEC.md`: 새 UI 원본을 CSS/React 컴포넌트/치수/반응형 기준으로 분석하고 화면을 복사하듯 구현하기 위한 시각 정의서입니다.
- `CHAT_UI_REPLACEMENT_HANDOFF.md`: 새 UI를 입히면서 현재 개발된 왼쪽 보고서 패널, 중앙 대화, 검색 모달, 파일 첨부, 원문/지도 패널, resize 기능을 손상하지 않기 위한 기능 보존 계약입니다.

## File Map

| file | role |
|---|---|
| `ChatPage.tsx` | 챗봇 화면 컨테이너. 패널, 검색 모달, 메시지, 원문 패널 상태를 관리합니다. |
| `CHAT_UI_SCREEN_SPEC.md` | 새 챗봇 UI 화면의 CSS, React 구분, 치수, 반응형, asset 매핑을 정의하는 화면 명세입니다. |
| `CHAT_UI_REPLACEMENT_HANDOFF.md` | 새 챗봇 UI 화면을 덮어쓸 때 기능 보존을 위한 최우선 인수인계 문서입니다. |
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
- 채팅 가능한 보고서 수 초과, 서버 처리량 부족, 권한 오류 등은 API 응답의 사용자 표시용 메시지를 토스트로 표시

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
