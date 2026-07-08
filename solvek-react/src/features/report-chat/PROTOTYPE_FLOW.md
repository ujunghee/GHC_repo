# Report Chat Prototype Flow

이 문서는 `ChatPage.tsx`와 `components/` 기준의 챗봇 화면 흐름입니다.

## Entry Flow

1. 메인 검색 화면에서 보고서를 선택합니다.
2. 하단 `채팅하기` 버튼을 누릅니다.
3. `MainSearchPage`가 `onStartChat(selectedReports)`를 호출합니다.
4. `App.tsx`가 선택한 id를 저장하고 `view`를 `chat`으로 변경합니다.
5. `App.tsx`가 `reportData`에서 선택 id와 일치하는 `Report[]`를 찾아 `ChatPage`에 전달합니다.

## Chat Layout

챗봇 화면은 세 영역으로 구성됩니다.

| area | component | role |
|---|---|---|
| left | `ReportChatSidePanel` | 선택 보고서 목록 |
| center | `ChatConversation` | 대화 본문과 입력 |
| right | `SourcePanel` | AI 답변 근거 원문 |

## Left Panel Flow

왼쪽 패널은 메인 화면에서 선택한 보고서만 기본 목록으로 보여줍니다.

동작:
- `홈으로`를 누르면 검색 화면으로 돌아갑니다.
- `검색`을 누르면 `ChatSearchModal`이 열립니다.
- 전체 선택은 현재 패널 보고서 전체를 체크합니다.
- 이미 전체 선택된 상태에서 다시 누르면 첫 번째 보고서 1건만 남깁니다.
- 개별 checkbox는 다중 선택을 지원합니다.
- 마지막 1건은 해제되지 않습니다.
- 가운데 선을 드래그하면 패널 너비를 조절합니다.
- 최소 너비보다 더 줄이면 패널이 접힙니다.
- 접힌 후에는 왼쪽 arrow 버튼으로 다시 펼칩니다.

## Conversation Flow

초기 상태:
- 선택 보고서 총 건수를 안내합니다.
- `도움이 필요한가요?` 아래에 맞춤 제안 버튼을 표시합니다.

질문 전송:
- 추천 질문 버튼 클릭 또는 하단 input submit으로 질문을 전송합니다.
- 현재 프로토타입은 사용자 메시지와 임시 assistant 메시지를 추가합니다.
- 실제 API 연결 시 `sendMessage`에서 채팅 API 호출로 교체합니다.

선택 보고서가 없는 예외 상태:
- 중앙에 `보고서를 선택해주세요` 문구를 표시합니다.
- 하단 input submit은 동작하지 않습니다.

## Evidence Flow

AI 답변에 근거가 있으면 답변 아래에 근거 요약을 표시합니다.

근거 항목:
- 조사 위치
- 주요 유구
- 출토 유물
- 핵심 결과

각 항목 옆에 표시되는 action:
- `원문 p.12 ~ 16`: 원문 패널 열기
- `지도`: 추후 지도 연결 placeholder

## Source Panel Flow

1. 사용자가 답변 근거의 `원문` 버튼을 누릅니다.
2. `ChatConversation`이 `onOpenSource`를 호출합니다.
3. `ChatPage`가 `isSourcePanelOpen`을 true로 변경합니다.
4. `SourcePanel`이 오른쪽에서 열립니다.
5. 오른쪽 상단 layout icon으로 원문 패널을 접거나 펼칠 수 있습니다.

원문 패널 표시 정보:
- `similarityScore`: AI가 찾은 근거와 원문 페이지의 유사도
- `pageLabel`: 원문 페이지
- `title`: 보고서명
- `pageImageUrl`: DB 원문 이미지 URL

`pageImageUrl`이 없으면 placeholder를 표시합니다.

## Chat Search Modal Flow

검색 모달은 챗봇 화면 안에서 보고서를 추가/선택하는 용도입니다.

동작:
- 검색어 입력 시 결과가 실시간으로 바뀝니다.
- 결과 기준 데이터는 메인 검색과 같은 `reportData`입니다.
- 필터 아이콘을 누르면 검색 도우미 팝업이 열립니다.
- 팝업 바깥을 클릭하면 닫힙니다.
- 선택한 단서는 공통 `ClueChips`로 표시됩니다.
- `초기화`를 누르면 단서가 사라지고 아래 컨텐츠가 자연스럽게 위로 이동합니다.
- 검색 결과가 없으면 메인과 같은 `EmptyState`를 표시합니다.
- 보고서를 체크하면 왼쪽 패널 목록에 추가됩니다.
- 체크된 보고서는 검색 결과 상단으로 올라옵니다.
- 체크 시 스크롤 위치는 유지합니다.

## Responsive Flow

반응형 보정은 디자인시스템의 `default/responsive.css` 또는 컴포넌트 구조 안에서 처리합니다.

- `1024px 이하`: 좌측/우측 패널을 fixed overlay처럼 표시합니다.
- `768px 이하`: 검색 모달과 채팅 input 폭을 화면에 맞춥니다.
- `520px 이하`: 검색 모달은 full screen에 가깝게 표시합니다.

## API Replacement Points

| current code | real API role |
|---|---|
| `reportData` | 보고서 검색/조회 API |
| `searchedReports` | 검색 모달 결과 API |
| `createAssistantMessage` | 챗봇 답변 API |
| `answerFacts` | 답변 근거 추출 결과 |
| `sourceDocument` | 원문 페이지 이미지/유사도 API |
