# Chat UI Replacement Handoff

## Latest Handoff Notice

챗봇 UI를 개발자 AI가 그대로 복사 구현해야 하는 경우, 이 문서와 함께 루트의 `AI_DEVELOPER_CHATBOT_HANDOFF.md`를 반드시 먼저 읽어야 합니다.

최신 추가 범위:

- 이미지 업로드 기반 AI 유사후보
- PDF에서 추출한 도면/페이지 이미지 사용
- 유사후보 카드의 `지도에서 보기`
- 지도 위 이미지 최초 적용 완료 상태 표시
- 관리 패널의 `이미지 수정`/`이미지 삭제`
- 적용 완료 후 지도 좌표 고정
- 기존 토스트 UI를 재사용한 `적용 완료`
- 채팅 첨부 이미지는 고정 preview만 제공
- 최소화된 지도 설정 popup drag 이동
- 보고서 선택 수 프론트 임의 제한 금지

이 문서는 챗봇 화면 UI를 사용자가 제공한 새 화면 파일로 덮어쓸 때, 현재 개발된 기능을 손상하지 않도록 다음 개발자 또는 AI가 반드시 따라야 하는 바톤터치 문서입니다.

## 기존 챗봇 위 UI 교체 작업 정의

이 문서는 GHC 화면을 새 앱으로 만들기 위한 문서가 아닙니다. 기존 챗봇 저장소가 따로 있다면 그 저장소의 기능 로직을 유지하고, 기존 챗봇의 UI만 이 저장소의 화면으로 교체합니다.

유지해야 할 기존 챗봇 기능:

- 로그인과 사용자 세션
- 대화방 생성과 대화 기록
- 질문 전송과 AI 응답 스트리밍
- 응답 중단, 재생성, 복사
- 파일 업로드
- 오류, 로딩, empty 상태 처리
- 백엔드 API와 DB 연결
- 인증 토큰과 사용자 권한 처리

교체할 부분:

- 챗봇 화면 레이아웃
- 왼쪽 보고서 패널
- 중앙 대화 영역과 입력창
- 추천 질문
- 오른쪽 원문/지도 패널
- 보고서 검색 모달
- CSS와 아이콘

금지:

- GHC를 기존 챗봇과 별도 앱으로 새로 개발하지 않습니다.
- 기존 챗봇 화면 위에 iframe으로 얹지 않습니다.
- 기존 챗봇 API, 세션, 스트리밍, 파일 업로드, 대화 기록 기능을 삭제하거나 전체 재작성하지 않습니다.
- `data.ts` mock 응답을 실제 운영 데이터로 사용하지 않습니다.

통합 구조:

```txt
기존 챗봇
├─ API·DB·AI·세션·스트리밍 ── 유지
├─ 기존 상태관리·서비스      ── 유지
└─ 기존 임의 UI              ── 교체
                               ↓
                       GHC React/CSS UI
```

기존 챗봇이 React라면 이 폴더의 컴포넌트를 이식하고, Vue/Svelte라면 동일한 화면 구조와 이벤트 계약을 해당 프레임워크로 옮깁니다. Django/Jinja 또는 순수 HTML/JS라면 React 부분 마운트 또는 HTML/CSS 재구현을 선택합니다. Streamlit/Gradio라면 기본 컴포넌트만으로 동일 UI 구현이 어려우므로 별도 프론트엔드 또는 커스텀 컴포넌트가 필요할 수 있습니다.

핵심 원칙:

- 새 UI 파일은 시각 기준입니다. 픽셀, 레이아웃, 여백, 타이포, 색, 버튼 배치, 패널 모양은 사용자가 준 화면을 최대한 그대로 복제합니다.
- 현재 React 코드의 상태, 이벤트, 데이터 흐름은 GHC UI를 이해하기 위한 기준입니다. 실제 통합에서는 기존 챗봇의 API/상태관리/세션/스트리밍 로직을 유지하고 GHC UI 이벤트에 연결해야 합니다.
- 챗봇 기능을 다시 만들지 말고, 현재 기능 위에 새 UI를 입힙니다.
- 화면이 비슷해 보여도 기능이 끊기면 실패입니다. 반대로 기능이 살아도 사용자가 준 UI와 다르면 실패입니다.

## 작업 범위

대상 화면:

- 브라우저 확인 주소: `http://192.168.0.75:5173/`
- 기능 폴더: `solvek-react/src/features/report-chat`
- 루트 컨테이너: `ChatPage.tsx`
- 왼쪽 보고서 패널: `components/ReportChatSidePanel.tsx`
- 중앙 대화 영역: `components/ChatConversation.tsx`
- 챗봇 내 보고서 검색 모달: `components/ChatSearchModal.tsx`
- 오른쪽 원문 패널: `components/SourcePanel.tsx`
- 오른쪽 지도 패널: `components/MapPanel.tsx`
- 패널 리사이즈 핸들: `components/ResizeHandle.tsx`

새 UI를 입힐 때 우선 수정할 수 있는 부분:

- JSX 마크업 구조
- className
- 디자인시스템 class 조합
- 필요한 wrapper
- 인라인 style 중 순수 시각 표현 값
- 표시 문구
- 아이콘 배치
- 패널 내부 레이아웃

되도록 수정하지 말아야 하는 부분:

- `ChatPage`의 state 이름과 소유 관계
- `ChatPage`의 handler 역할
- `ReportChatSidePanel`, `ChatConversation`, `ChatSearchModal`, `SourcePanel`의 props 계약
- `activeReportIds` 최소 1건 유지 로직
- 검색 모달에서 보고서를 추가하면 왼쪽 패널 목록에도 추가되는 로직
- 검색 모달 체크 시 스크롤 위치 유지 로직
- 답변 근거가 생긴 뒤에만 오른쪽 패널 토글 아이콘을 표시하는 로직
- 왼쪽/오른쪽 패널 resize 로직
- compact viewport에서 패널을 닫는 반응형 로직
- 파일 첨부, 이미지 drag/drop, 첨부 미리보기, object URL revoke 로직
- `onBack`, `onSearch`, `onSend`, `onOpenSource`, `onOpenMap` 연결

## Current Functional Skeleton

현재 챗봇 화면은 `ChatPage`가 모든 화면 상태를 소유하고, 하위 컴포넌트는 UI 표시와 이벤트 위임만 담당합니다.

```tsx
<ChatPage>
  <ReportChatSidePanel />
  <ChatConversation />
  <SourcePanel />
  <MapPanel />
  <ChatSearchModal />
</ChatPage>
```

새 UI를 넣더라도 이 역할 분리는 유지합니다. 새 화면이 하나의 큰 HTML처럼 되어 있더라도, 그대로 한 파일에 몰아넣지 말고 기존 컴포넌트 경계 안으로 나눠 넣습니다.

## ChatPage State Contract

아래 state는 현재 기능의 핵심입니다. 이름을 바꾸거나 하위 컴포넌트로 옮기지 않습니다.

| state | type | purpose |
|---|---|---|
| `viewportWidth` | `number` | compact/desktop 반응형 판단 |
| `message` | `string` | 하단 입력창 값 |
| `messages` | `ChatMessage[]` | 사용자/AI 메시지 목록 |
| `isPanelOpen` | `boolean` | 왼쪽 보고서 패널 열림 여부 |
| `panelWidth` | `number` | 왼쪽 보고서 패널 너비 |
| `isPanelResizing` | `boolean` | 왼쪽 패널 resize 중 여부 |
| `isPanelResizeHover` | `boolean` | 왼쪽 resize handle hover 여부 |
| `rightPanelMode` | `"none" \| "source" \| "map"` | 오른쪽 패널 표시 상태 |
| `lastRightPanelMode` | `"source" \| "map"` | 오른쪽 패널 재오픈 시 복원할 마지막 모드 |
| `sourcePanelWidth` | `number` | 오른쪽 패널 너비 |
| `isSourcePanelResizing` | `boolean` | 오른쪽 패널 resize 중 여부 |
| `isSourcePanelResizeHover` | `boolean` | 오른쪽 resize handle hover 여부 |
| `activeSourceTitle` | `string` | 오른쪽 원문 패널에 표시할 보고서명 |
| `isSearchOpen` | `boolean` | 보고서 검색 모달 열림 여부 |
| `searchQuery` | `string` | 검색 모달 검색어 |
| `searchHelperOpen` | `boolean` | 검색 모달 검색 도우미 팝업 열림 여부 |
| `searchClues` | `string[]` | 검색 모달 단서 칩 목록 |
| `checkedSearchClues` | `string[]` | 검색 모달에서 활성화된 단서 |
| `panelReportIds` | `number[]` | 왼쪽 패널에 표시할 보고서 id |
| `activeReportIds` | `number[]` | 현재 대화 대상으로 체크된 보고서 id |

Derived values도 유지합니다.

| derived value | purpose |
|---|---|
| `panelReports` | `panelReportIds`로 왼쪽 패널에 표시할 `Report[]` 생성 |
| `activeReports` | `activeReportIds`로 현재 AI 대화 대상 `Report[]` 생성 |
| `baseSearchReports` | 검색 모달 검색어 기준 결과 |
| `groupedSearchReports` | 검색 모달 단서 기준 그룹 결과 |
| `searchedReports` | 체크된 보고서를 상단으로 정렬한 검색 결과 |
| `selectedCount` | 중앙 헤더와 입력 가능 여부에 사용하는 선택 건수 |
| `isAllChecked` | 왼쪽 패널 전체 선택 checkbox 상태 |
| `isPartiallyChecked` | 왼쪽 패널 전체 선택 indeterminate 상태 |
| `reportTitle` | 중앙 헤더 대표 보고서명 |
| `suggestionLabels` | 추천 질문 목록 |
| `hasSourceContent` | 답변 근거 생성 후 오른쪽 패널 토글 표시 여부 |

## Handler Contract

아래 handler의 의미는 바꾸지 않습니다.

### Report Selection

`toggleReport(reportId)`

- 왼쪽 패널 checkbox와 검색 모달 checkbox에서 사용합니다.
- 선택 안 된 보고서는 `activeReportIds`에 추가합니다.
- 선택된 보고서는 해제합니다.
- 단, 마지막 1건은 해제하지 않습니다.
- 보고서 개수 제한은 프론트에서 하지 않습니다.

`toggleAllReports()`

- 왼쪽 패널 전체 선택 checkbox에서 사용합니다.
- 전체가 선택되지 않은 상태면 패널의 모든 보고서를 active 상태로 만듭니다.
- 이미 전체 선택 상태에서 다시 누르면 전체 해제가 아니라 첫 번째 보고서 1건만 남깁니다.
- `activeReportIds`가 0건이 되는 상태를 만들면 안 됩니다.

`toggleSearchReport(reportId)`

- 검색 모달에서 보고서 checkbox를 누를 때 사용합니다.
- 보고서가 왼쪽 패널 목록에 없으면 `panelReportIds`에 추가합니다.
- 그 다음 `toggleReport(reportId)`로 대화 대상 체크 상태를 바꿉니다.
- 검색 결과 스크롤 위치를 유지해야 합니다.

`removePanelReport(reportId)`

- 왼쪽 패널의 보고서 row 메뉴에서 삭제할 때 사용합니다.
- 왼쪽 패널 보고서가 1건뿐이면 삭제하지 않습니다.
- 삭제한 보고서가 active였다면 active에서도 제거합니다.
- 제거 후 active가 0건이 되면 남아 있는 첫 번째 보고서를 active로 둡니다.

### Panel

`openSourcePanel()`

- AI 답변 근거의 `원문` 버튼에서 호출합니다.
- compact viewport에서는 동작하지 않습니다.
- `activeSourceTitle`을 현재 첫 번째 active 보고서명으로 맞춥니다.
- `rightPanelMode`를 `"source"`로 바꿉니다.

`openMapPanel()`

- AI 답변 근거의 `지도` 버튼에서 호출합니다.
- compact viewport에서는 동작하지 않습니다.
- `rightPanelMode`를 `"map"`으로 바꿉니다.

`toggleRightPanel()`

- 오른쪽 상단 layout icon에서 호출합니다.
- 오른쪽 패널이 열려 있으면 닫습니다.
- 닫혀 있으면 `lastRightPanelMode` 기준으로 source/map을 다시 엽니다.
- 답변 근거가 없으면 오른쪽 패널 토글 자체가 보이면 안 됩니다.

`bindResizeEvents()`

- 왼쪽/오른쪽 resize에 공통 사용합니다.
- pointermove 중 `document.body.style.cursor = "col-resize"`와 `userSelect = "none"`을 설정합니다.
- pointerup 후 반드시 원복합니다.

### Message

`sendMessage(text, imageUrl?)`

- 입력창 submit과 추천 질문 버튼에서 사용합니다.
- active 보고서가 0건이면 전송하지 않습니다.
- text와 image가 모두 없으면 전송하지 않습니다.
- user message를 추가합니다.
- 현재 프로토타입에서는 `createAssistantMessage`로 임시 AI 답변을 추가합니다.
- 실제 API 연결 시 이 함수 또는 별도 hook/service에서 채팅 API를 호출합니다.

## UI Replacement Rules

### 1. Use The Supplied UI As The Visual Source Of Truth

사용자가 제공한 화면 파일의 UI를 그대로 옮깁니다.

반드시 맞춰야 하는 시각 항목:

- 전체 화면 배경색
- 좌측 패널 폭과 배경
- 패널 구분선
- 헤더 높이
- 홈/검색/패널 토글 버튼 위치
- 보고서 row 높이, radius, border, hover, checked 상태
- 중앙 대화 영역 폭과 정렬
- 대화 헤더 위치와 문구 구성
- 추천 질문 버튼 묶음 위치와 모양
- 사용자 말풍선/AI 답변 말풍선 모양
- 근거 버튼 `원문`, `지도` 형태
- 하단 입력창 높이, radius, 아이콘 위치
- 첨부 이미지 미리보기 영역
- 검색 모달 크기, dim overlay, 검색창, 결과 list row
- 오른쪽 source/map 패널 폭, 헤더, 원문 이미지 영역
- resize handle hover/active 시각

하지만 아래 기능 연결은 절대 끊지 않습니다.

- 모든 checkbox는 기존 state와 연결되어야 합니다.
- 모든 검색 input은 기존 state와 연결되어야 합니다.
- 모든 버튼은 기존 handler를 호출해야 합니다.
- 모든 modal open/close는 기존 state로 제어해야 합니다.
- 오른쪽 source/map 패널은 답변 근거 생성 후에만 열 수 있어야 합니다.

### 2. Do Not Flatten The App Into Static HTML

새 UI 파일을 보고 그대로 붙이다가 정적 HTML로 만들면 안 됩니다.

금지:

- checkbox를 `checked` 고정값으로 두기
- 검색 결과를 하드코딩 list로만 두기
- 메시지를 정적 텍스트로만 두기
- 추천 질문 버튼의 `onClick={() => onSend(label)}` 제거
- `onSubmit`, `onChange`, `onToggleReport`, `onRemoveReport` 연결 제거
- `messages.map(...)` 제거
- `reports.map(...)` 제거
- `searchedReports.map(...)` 제거
- `activeReportIds.includes(report.id)` 제거

허용:

- UI wrapper 추가
- 텍스트/아이콘 위치 변경
- className 변경
- 디자인시스템 class 추가
- 시각 전용 div/span 추가
- motion wrapper 유지 또는 시각 요구에 맞게 조정

### 3. Keep Component Boundaries

새 UI가 한 장의 화면처럼 보여도 아래 경계를 유지합니다.

`ChatPage`

- state와 handler만 관리합니다.
- 직접 긴 카드 row나 메시지 row를 하드코딩하지 않습니다.

`ReportChatSidePanel`

- 왼쪽 패널 전체 UI만 담당합니다.
- props로 받은 `reports`, `activeReportIds`, `isAllChecked`를 표시합니다.
- 상태 변경은 전부 callback으로 올립니다.

`ChatConversation`

- 중앙 header, message list, suggestion, input, attachment UI만 담당합니다.
- `messages`와 `suggestionLabels`를 map으로 렌더링합니다.
- 답변 근거 버튼은 `onOpenSource`, `onOpenMap`을 호출합니다.

`ChatSearchModal`

- 챗봇 내 보고서 검색 modal만 담당합니다.
- 검색 도우미는 메인 검색의 `HelperMenu`, `ClueChips`, `EmptyState`를 재사용합니다.

`SourcePanel`

- 원문 패널 표시만 담당합니다.
- 유사도, 보고서명, pageLabel, image placeholder/image 영역을 유지합니다.

`MapPanel`

- 지도 패널 표시만 담당합니다.
- 현재 지도 레이어 checkbox/tree/active layer 기능은 유지합니다.

## Required UI Areas

### A. Full Chat Shell

현재 root:

```tsx
<main className="bg-white h-screen overflow-hidden flex">
```

새 UI에서도 전체 챗봇 화면은 viewport 높이를 꽉 채워야 합니다.

유지 조건:

- 전체 화면 height는 `100vh` 또는 `h-screen`
- root overflow는 전체 page scroll이 아니라 내부 panel scroll 중심
- 왼쪽 패널, 중앙 대화, 오른쪽 패널이 수평 배치
- compact viewport에서는 왼쪽/오른쪽 패널이 닫히고 중앙 대화 우선

### B. Left Report Panel

현재 기능:

- `홈으로` 버튼: `onBack`
- `검색` 버튼: `onSearch`
- 총 보고서 수 표시: `reports.length`
- 전체 선택 checkbox: `isAllChecked`, `onToggleAll`
- 개별 보고서 row: `reports.map`
- row checkbox: `activeReportIds.includes(report.id)`, `onToggleReport(report.id)`
- row menu: hover 또는 menu open 시 표시
- row menu 삭제: `onRemoveReport(report.id)`
- 삭제 disabled: `reports.length <= 1`
- resize handle: `ResizeHandle side="right"`

UI 교체 시 보존할 코드 패턴:

```tsx
{reports.map((report) => {
  const isChecked = activeReportIds.includes(report.id);
  return (
    ...
    <input checked={isChecked} onChange={() => onToggleReport(report.id)} />
    ...
  );
})}
```

주의:

- 보고서 제목은 길 수 있으므로 ellipsis 또는 줄바꿈 정책을 명확히 둡니다.
- row hover 시 메뉴 버튼 표시가 현재 기능입니다. 새 UI에 메뉴가 있다면 같은 삭제 기능을 연결합니다.
- 새 UI에 삭제 메뉴가 없다면 기능 손실입니다. 삭제 액션을 다른 위치라도 반드시 유지합니다.
- 전체 선택 checkbox는 indeterminate 상태가 `ChatPage`의 `selectAllRef`로 설정됩니다. ref를 제거하지 않습니다.

### C. Panel Collapse Button

현재 기능:

- 왼쪽 패널을 최소 너비 아래로 드래그하면 일정 delay 후 접힘
- 접힌 뒤 중앙 영역 왼쪽에 펼치기 버튼 표시
- 펼치기 버튼 클릭 시 `panelWidth`를 기본 폭 이상으로 맞추고 `isPanelOpen` true

UI 교체 시:

- 사용자가 준 화면에 접힘 버튼이 있으면 그 위치/모양으로 옮깁니다.
- 없더라도 개발 기능을 살리려면 접근 가능한 펼치기 버튼은 유지합니다.

### D. Center Conversation Header

현재 기능:

```tsx
{reportTitle}{selectedCount > 1 ? " 외 " : " "}
<strong>{selectedCount}건</strong>
```

유지 조건:

- 대표 보고서명은 `activeReports[0]?.title`
- 선택 건수는 `activeReports.length`
- active 보고서가 없으면 `"보고서 선택"` 또는 빈 상태 문구 표시
- 문구 디자인은 새 UI를 따르되 값은 state 기반으로 렌더링

### E. Empty Active Report State

현재 기능:

- `selectedCount === 0`이면 중앙에 `보고서를 선택해주세요`
- 하단 입력 submit은 동작하지 않음
- 파일 첨부도 disabled 상태

주의:

- 현재 상위 로직상 active 0건을 만들지 않도록 막지만, 방어 UI는 유지합니다.
- 새 UI에서 빈 상태가 다르게 생겼다면 시각만 바꾸고 조건은 유지합니다.

### F. Suggestion Questions

현재 기능:

- 메시지가 0개이면 추천 질문 표시
- `suggestionLabels`는 `getSuggestionLabels(activeReports)`에서 생성
- 각 버튼 클릭 시 `onSend(label)`

유지 조건:

```tsx
{messages.length === 0 && suggestionLabels.map((label) => (
  <button onClick={() => onSend(label)}>{label}</button>
))}
```

추천 질문 현재 예:

- `선택한 N건 전체를 요약해줘`
- `{첫 보고서명} 자세히 볼래`
- `선택한 보고서끼리 비교해줘`
- `보고서 위치를 지도에서 보여줘`
- `이미지/도면을 올려 비교할래`

새 UI가 추천 질문을 카드/칩/버튼 형태로 보여줘도 클릭 연결은 유지합니다.

### G. Message List

현재 기능:

- `messages.map`
- user message는 오른쪽 정렬
- assistant message는 왼쪽 정렬
- user message에 `imageUrl`이 있으면 이미지 표시
- assistant message에 `hasEvidence`가 있으면 `EvidenceSummary` 표시

유지 조건:

```tsx
{messages.map((item) => (
  item.role === "user" ? ... : ...
))}
```

실제 API 연결 시에도 필요한 최소 필드:

```ts
type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  imageUrl?: string;
  hasEvidence?: boolean;
};
```

### H. Evidence Summary

현재 기능:

- AI 답변 아래 근거 요약 표시
- `answerFacts.map`
- action에 `"source"`가 있으면 `원문 p.12 ~ 16` 버튼 표시
- action에 `"map"`이 있으면 `지도` 버튼 표시
- `원문` 클릭 시 `onOpenSource`
- `지도` 클릭 시 `onOpenMap`
- 요약 카드의 copy icon 클릭 시 clipboard copy
- copy 성공 시 `복사 완료` 토스트 1800ms

유지 조건:

- `onOpenSource`와 `onOpenMap`을 반드시 연결합니다.
- 오른쪽 패널 토글 아이콘은 assistant evidence가 생긴 뒤에만 보입니다.
- copy 기능은 유지합니다.

주의:

- 보고서 선택 제한 토스트와 `복사 완료` 토스트는 별도입니다.
- `복사 완료` 토스트는 유지해도 됩니다.

### I. Message Input And Attachment

현재 기능:

- 하단 form submit
- input value는 `message`
- 변경 시 `onMessageChange`
- submit 시 `onSend`
- attach button 클릭 시 hidden file input click
- image file만 허용
- 첨부 시 object URL 생성
- 첨부 상태에서는 preview UI 표시
- 첨부 삭제 가능
- 첨부 후 메시지가 비어 있으면 placeholder 문구 자동 입력
- drag/drop으로 이미지 첨부 가능
- drag 중 overlay 표시
- unmount 또는 교체 시 object URL revoke
- 첨부 preview는 이동/회전/resize/투명도 조정을 지원하지 않음
- 지도 위 도면 이미지 편집 기능을 첨부 preview에 붙이면 안 됨

유지해야 할 상수:

```ts
const ATTACHED_PLACEHOLDER = "이 이미지가 보고서 어디에 나오는지 찾아줘";
const DEFAULT_PLACEHOLDER = "보고서명, 유적명, 지역, 유물명으로 검색하기";
```

새 UI에서 input 모양이 바뀌어도 아래 연결은 유지합니다.

```tsx
<form onSubmit={handleFormSubmit}>
  <input value={message} onChange={(event) => onMessageChange(event.target.value)} />
  <button type="button" onClick={() => fileInputRef.current?.click()} />
  <button type="submit" />
</form>
```

### J. Chat Search Modal

현재 기능:

- dim overlay 클릭 시 닫힘
- modal 내부 클릭은 닫힘 방지
- search input autoFocus
- 검색 helper open/close
- helper 외부 클릭 시 닫힘
- `HelperMenu` 재사용
- `ClueChips` 재사용
- `EmptyState` 재사용
- 검색 결과 일반 목록
- 검색 결과 그룹 목록
- checkbox로 active report toggle
- 검색 모달에서 보고서 선택 시 왼쪽 패널에 추가
- 체크된 보고서는 목록 상단 정렬
- 체크 후 scrollTop 유지

유지할 props:

```ts
type ChatSearchModalProps = {
  searchQuery: string;
  searchHelperOpen: boolean;
  searchClues: string[];
  checkedSearchClues: string[];
  searchedReports: Report[];
  groupedSearchReports: ReportGroup[];
  activeReportIds: number[];
  helperPopupRef: RefObject<HTMLDivElement>;
  resultListRef: RefObject<HTMLUListElement>;
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onToggleHelper: () => void;
  onToggleClue: (value: string) => void;
  onToggleClueChecked: (value: string) => void;
  onResetClues: () => void;
  onToggleReport: (reportId: number) => void;
};
```

새 UI에서 검색 모달이 drawer, full modal, panel 형태여도 이 props 계약은 유지합니다.

### K. Right Source Panel

현재 기능:

- assistant evidence가 생긴 뒤 오른쪽 상단 layout icon 표시
- source mode면 `SourcePanel embedded`
- map mode면 `MapPanel embedded`
- 오른쪽 panel은 `ResizeHandle side="left"` 사용
- source panel width는 viewport, 왼쪽 panel width, reserved chat width를 기준으로 계산
- compact viewport에서는 오른쪽 panel을 닫음

SourcePanel 표시 요소:

- 유사도 label
- 유사도 badge
- pageLabel
- report title
- 원문 이미지 영역
- 이미지 없을 때 `DB 원문 이미지 영역` placeholder

데이터 타입:

```ts
type SourceDocument = {
  title: string;
  pageLabel: string;
  pageImageUrl?: string;
  similarityScore: number;
};
```

유사도 tone:

- 75 이상: blue
- 50 이상: green
- 30 이상: yellow
- 그 외: orange

### L. Right Map Panel

현재 기능:

- `MapPanel`은 source와 같은 오른쪽 패널 영역에 들어갑니다.
- `onOpenMap`이 호출되면 `rightPanelMode`가 `"map"`이 됩니다.
- `MapPanel` 내부의 레이어 tree, active layer, map type, advanced tab 기능은 유지해야 합니다.
- 이미지 후보의 `지도에서 보기` 최초 진입 시 후보 이미지는 편집 overlay가 아니라 적용 완료 상태로 지도 위에 표시합니다.
- 우하단 관리 패널은 `이미지 적용 완료 / 지도 위치에 고정됨`, `이미지 수정`, `이미지 삭제`를 제공합니다.
- `이미지 수정`을 눌렀을 때만 이동/회전/resize/투명도 조정 편집 UI를 표시합니다.
- `이미지 적용 완료`를 누르면 기존 toast UI로 `적용 완료`를 표시하고 다시 지도 좌표에 고정합니다.
- 최소화된 지도 설정 popup은 헤더 drag로 위치 이동할 수 있어야 합니다.

주의:

- 사용자가 준 UI 파일에 지도 패널이 없더라도, 현재 개발된 지도 기능은 삭제하지 않습니다.
- 디자인만 새 UI와 맞춥니다.

## Responsive Rules

현재 기준:

- `isChatCompact = viewportWidth <= 1100`
- `shouldPreferConversation = viewportWidth <= 1280`

동작:

- 1100px 이하에서는 왼쪽 패널 닫힘
- 1100px 이하에서는 오른쪽 패널 닫힘
- 1280px 이하에서는 오른쪽 패널보다 중앙 대화를 우선하여 오른쪽 패널 닫힘

새 UI 적용 시:

- 반응형 breakpoint를 바꾸려면 이유를 문서에 남깁니다.
- 모바일/좁은 화면에서 기능 버튼이 사라지면 안 됩니다.
- 검색 모달은 viewport 안에 들어와야 합니다.
- 입력창 텍스트와 버튼이 겹치면 안 됩니다.

## API Integration Notes

현재는 프로토타입 데이터입니다.

실제 기존 챗봇과 통합할 때는 `data.ts`를 운영 데이터로 쓰지 말고 adapter 계층을 둡니다. adapter는 기존 챗봇 API 응답, 스트리밍 chunk, 업로드 응답, 근거/원문/PDF 응답을 이 화면이 기대하는 타입으로 변환합니다.

권장 adapter 연결:

- 기존 chat room/session → `selectedReports`, `panelReportIds`, `activeReportIds`
- 기존 message history → `ChatMessage[]`
- 기존 streaming answer chunk → assistant message text 누적 업데이트
- 기존 upload response → `imageFileId`, `previewUrl`, `imageUrl`
- 기존 evidence/source response → `answerFacts`, `SourceDocument`
- 기존 image search/PDF extraction response → `DrawingCandidate[]`
- 기존 API error → toast message

교체 지점:

- `createAssistantMessage`: 실제 채팅 답변 API
- `answerFacts`: 답변 근거 API
- `sourceDocument`: 원문 페이지 API
- `mapDocument`: 지도 근거 API
- `reportData`: 보고서 검색 API

채팅 세션 생성/보고서 개수 제한:

- 보고서 선택 개수는 프론트에서 임의 제한하지 않습니다.
- 선택 가능한 최대 보고서 수는 채팅 세션 생성 API가 판단합니다.
- API가 제한 초과를 반환하면 API message를 토스트로 표시합니다.
- UI 파일을 적용하면서 다시 `최대 2건`, `최대 5건` 같은 고정 문구를 넣지 않습니다.

권장 오류 형태:

```ts
type ChatSessionError = {
  code: "REPORT_LIMIT_EXCEEDED" | "SERVER_BUSY" | "REPORT_NOT_READY" | "FORBIDDEN" | "UNKNOWN";
  message: string;
  maxReports?: number;
};
```

## Styling Rules

기본 원칙:

- 사용자가 제공한 UI 파일을 시각 기준으로 삼습니다.
- 기존 디자인시스템 class를 우선 사용합니다.
- `solvekdesignsystem-web/css/index.css`를 기준으로 색상/타이포/간격을 맞춥니다.
- 없는 스타일은 필요한 범위에서만 추가합니다.
- 기능 식별만을 위한 의미 없는 class를 만들지 않습니다.

유지해야 하는 접근성/상호작용 class 또는 구조:

- icon-only button은 `aria-label` 유지
- 장식 아이콘은 `aria-hidden="true"`
- resize handle은 `role="separator"`, `aria-orientation="vertical"`
- modal은 `role="dialog"`, `aria-modal="true"`
- checkbox는 label과 연결
- dim overlay click close와 modal 내부 click stopPropagation 유지

## Exact Implementation Checklist

UI 교체 전:

- 현재 `npm run build`가 통과하는 상태인지 확인합니다.
- 새 UI 파일에서 챗봇 화면의 영역을 나눕니다: shell, left panel, center chat, input, search modal, right panel.
- 새 UI의 각 클릭 가능한 요소를 현재 handler와 매칭합니다.

구현 중:

- 먼저 `ChatPage` state/handler는 건드리지 않고 하위 UI만 바꿉니다.
- `ReportChatSidePanel`부터 새 UI를 입힙니다.
- 다음 `ChatConversation` 중앙 영역을 입힙니다.
- 다음 `ChatSearchModal`을 입힙니다.
- 마지막 `SourcePanel`/`MapPanel`/resize를 맞춥니다.
- 한 컴포넌트씩 빌드 확인합니다.

구현 후 반드시 확인:

- 메인에서 선택한 보고서가 왼쪽 패널에 표시되는가
- 왼쪽 패널 총 건수가 맞는가
- 개별 보고서 checkbox가 active 상태와 연동되는가
- 마지막 active 보고서는 해제되지 않는가
- 전체 선택을 다시 눌렀을 때 첫 번째 1건만 남는가
- 보고서 row 삭제가 동작하는가
- 마지막 panel report는 삭제되지 않는가
- 왼쪽 패널 resize가 동작하는가
- 왼쪽 패널을 좁게 드래그하면 접히는가
- 접힌 패널을 다시 펼칠 수 있는가
- 추천 질문 클릭 시 메시지가 생성되는가
- 입력창 submit 시 user/assistant 메시지가 생성되는가
- active report가 0건이면 submit이 막히는가
- 이미지 첨부 버튼이 파일 선택을 여는가
- 이미지 drag/drop 첨부가 되는가
- 첨부 preview와 삭제가 되는가
- assistant 답변 근거의 `원문` 클릭 시 오른쪽 source panel이 열리는가
- assistant 답변 근거의 `지도` 클릭 시 오른쪽 map panel이 열리는가
- 오른쪽 패널 토글 icon이 답변 전에는 보이지 않는가
- 오른쪽 패널 resize가 동작하는가
- 검색 버튼이 보고서 검색 모달을 여는가
- 검색 모달 dim 클릭으로 닫히는가
- 검색 모달 내부 클릭으로 닫히지 않는가
- 검색 모달 검색어가 결과에 반영되는가
- 검색 도우미 팝업이 열리고 외부 클릭 시 닫히는가
- 검색 모달 단서 칩이 동작하는가
- 검색 모달에서 보고서를 체크하면 왼쪽 패널에도 추가되는가
- 검색 모달에서 체크 후 스크롤 위치가 튀지 않는가
- compact viewport에서 패널들이 대화 영역을 가리지 않는가
- `npm run build`가 통과하는가

## Do Not

- 현재 기능을 새 UI에 맞춘다는 이유로 삭제하지 않습니다.
- `activeReportIds` 최소 1건 유지 로직을 제거하지 않습니다.
- `panelReportIds`와 `activeReportIds`를 하나로 합치지 않습니다.
- 검색 모달을 단순 static modal로 바꾸지 않습니다.
- 오른쪽 source/map 패널 기능을 삭제하지 않습니다.
- 파일 첨부/drag-drop 기능을 삭제하지 않습니다.
- 보고서 선택 최대 개수를 프론트에 다시 하드코딩하지 않습니다.
- `slice(0, 2)`, `current.length >= 2`, `length > 2` 같은 임의 선택 제한을 되살리지 않습니다.
- `최대 2건만 가능합니다`, `최대 5건까지 대화할 수 있어요` 같은 고정 제한 문구를 넣지 않습니다.
- 새 UI를 맞추기 위해 접근성 속성을 제거하지 않습니다.
- 새 UI를 맞추기 위해 map/source evidence 버튼을 숨기지 않습니다.

## Suggested Prompt For The Next AI

아래 프롬프트를 다음 개발 AI에게 그대로 전달할 수 있습니다.

```txt
기존에 개발된 챗봇의 API, 상태관리, 세션, 메시지 송수신, 스트리밍, 파일 업로드 기능은 유지해줘.
기존 챗봇 UI만 GHC_repo의 solvek-react/src/features/report-chat/ 화면으로 교체해줘.
GHC_repo를 별도 앱으로 새로 개발하거나 기존 챗봇 위에 iframe으로 얹지 마.
기존 기능 로직을 GHC UI 컴포넌트의 이벤트와 연결하는 방식으로 통합해줘.

반드시 먼저 읽을 문서:
1. AI_DEVELOPER_CHATBOT_HANDOFF.md
2. UI_SOURCE_OF_TRUTH.md
3. solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md
4. solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md
5. solvek-react/src/features/report-chat/COMPONENT_RULES.md

절대 지켜야 할 조건:
- 기존 챗봇의 로그인, 사용자 세션, 대화방 생성, 대화 기록, 질문 전송, AI 응답 스트리밍, 중단, 재생성, 복사, 파일 업로드, 오류/로딩 처리, 백엔드 API, DB 연결을 삭제하지 않는다.
- 새 UI는 GHC React/CSS 화면과 최대한 동일하게 구현한다.
- data.ts의 목업 응답은 사용하지 말고 기존 챗봇 API 응답을 GHC UI 타입으로 변환하는 adapter를 만들어 연결한다.
- ChatPage의 state/handler 계약을 유지한다.
- ReportChatSidePanel, ChatConversation, ChatSearchModal, SourcePanel, MapPanel의 역할 경계를 유지한다.
- 보고서 선택 개수 제한을 프론트에 하드코딩하지 않는다.
- 선택 보고서 수 제한 토스트는 API 응답 메시지 기준이다.
- 왼쪽 패널, 검색 모달, 중앙 대화, 첨부, 원문/지도 패널, resize 기능을 모두 보존한다.
- 작업 후 npm run build로 검증한다.
```
