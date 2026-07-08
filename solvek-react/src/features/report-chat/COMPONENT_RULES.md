# Report Chat Component Rules

이 문서는 챗봇 화면을 컴포넌트별, 용도별, 기능별로 재구현하기 위한 규칙입니다. 검색 화면의 공통 규칙은 `../report-search/COMPONENT_RULES.md`를 함께 따릅니다.

## Folder Roles

- `ChatPage.tsx`: 챗봇 화면 컨테이너입니다. 화면 상태와 이벤트 핸들러만 관리합니다.
- `components/`: 챗봇 화면의 독립 UI 컴포넌트를 둡니다.
- `data.ts`: 챗봇 프로토타입용 임시 데이터입니다. API 연결 시 교체 대상입니다.
- `types.ts`: 챗봇 화면 타입입니다.

## Component Roles

### `ChatPage`

용도:
- 메인 검색 화면에서 전달받은 `Report[]`를 기준으로 챗봇 화면을 구성합니다.

기능:
- 왼쪽 선택 보고서 패널 열림/닫힘
- 왼쪽 패널 너비 resize
- 오른쪽 원문 패널 열림/닫힘
- 오른쪽 원문 패널 너비 resize
- 챗봇 메시지 상태 관리
- 보고서 검색 모달 상태 관리
- 검색 모달 단서/칩 상태 관리

규칙:
- 카드, 버튼 목록, 원문 패널 내부 마크업을 직접 넣지 않습니다.
- API 호출이 생기면 `ChatPage` 또는 별도 hook/service에서 처리하고, 하위 컴포넌트에는 props로 결과만 전달합니다.

### `ReportChatSidePanel`

용도:
- 메인에서 선택한 보고서만 왼쪽 목록에 표시합니다.

기능:
- 홈으로 이동
- 보고서 검색 모달 열기
- 전체 선택
- 개별 보고서 체크/해제
- resize handle 표시

규칙:
- `reports`는 메인에서 선택된 보고서 또는 검색 모달에서 추가된 보고서 목록입니다.
- 체크 상태는 `activeReportIds`로 판단합니다.
- 전체 선택을 해제하더라도 최소 1건은 남기는 로직은 상위 `ChatPage`에서 처리합니다.
- 패널 자체는 목록 표시와 이벤트 전달만 담당합니다.

### `ChatConversation`

용도:
- 중앙 채팅 본문, 추천 질문, 메시지 입력 영역을 표시합니다.

기능:
- 선택 보고서 제목/건수 표시
- 선택 보고서가 없을 때 안내 문구 표시
- 초기 추천 질문 버튼 표시
- 사용자/AI 메시지 표시
- 답변 근거 요약 표시
- 입력창 submit 처리

규칙:
- 답변 생성은 직접 하지 않고 `onSend`, `onSubmit`으로 상위에 위임합니다.
- 원문/지도 근거 버튼은 답변 항목 옆에 표시합니다.
- `원문` 버튼은 `onOpenSource`를 호출합니다.
- `지도` 버튼은 추후 지도 패널 또는 지도 화면 연결 지점으로 남깁니다.

### `ChatSearchModal`

용도:
- 챗봇 화면 안에서 보고서를 추가 검색하고 체크 상태를 바꾸는 모달입니다.

기능:
- 검색 input
- 검색 도우미 팝업
- 공통 `ClueChips`
- 검색 결과 없음 `EmptyState`
- 검색 결과 목록
- 체크된 보고서를 상단으로 정렬

규칙:
- 검색창은 디자인시스템 `search-48` 구조를 사용합니다.
- 단서 칩은 검색 화면과 같은 `ClueChips`를 재사용합니다.
- 체크된 보고서는 `activeReportIds` 기준으로 상단 정렬합니다.
- 체크 시 스크롤 위치는 유지합니다.
- 검색 도우미 팝업은 외부 클릭 시 닫힙니다.

### `SourcePanel`

용도:
- AI 답변 근거로 연결된 원문 페이지를 오른쪽 패널에 표시합니다.

기능:
- 유사도 표시
- 보고서명과 페이지 표시
- 원문 이미지 표시
- 원문 이미지가 없을 때 placeholder 표시
- resize handle 표시

규칙:
- 유사도는 버튼이 아니라 값 표시입니다.
- `similarityScore`에 따라 색상이 달라집니다.
- DB 원문이 붙으면 `pageImageUrl` 또는 뷰어 URL을 넣습니다.
- 원문 영역은 남은 높이를 채워야 합니다.

### `ResizeHandle`

용도:
- 좌우 패널 너비 조절을 위한 공통 핸들입니다.

기능:
- hover/active 시 `slate-200` 선 표시
- `col-resize` cursor 제공
- pointer down 이벤트 전달

규칙:
- 실제 width 계산은 상위 컨테이너에서 처리합니다.
- 왼쪽 패널은 최소 너비 아래로 드래그하면 접힙니다.
- 오른쪽 패널은 지정된 최소/최대 너비 안에서 조절합니다.

## State Rules

| state | owner | role |
|---|---|---|
| `panelReportIds` | `ChatPage` | 왼쪽 패널에 표시할 보고서 id |
| `activeReportIds` | `ChatPage` | 현재 대화 대상으로 체크된 보고서 id |
| `messages` | `ChatPage` | 채팅 메시지 목록 |
| `isPanelOpen` | `ChatPage` | 왼쪽 패널 열림 여부 |
| `panelWidth` | `ChatPage` | 왼쪽 패널 너비 |
| `isSourcePanelOpen` | `ChatPage` | 원문 패널 열림 여부 |
| `sourcePanelWidth` | `ChatPage` | 원문 패널 너비 |
| `searchQuery` | `ChatPage` | 검색 모달 검색어 |
| `searchClues` | `ChatPage` | 검색 모달 단서 목록 |
| `checkedSearchClues` | `ChatPage` | 검색 모달에서 체크된 단서 |

## Interaction Rules

- 왼쪽 패널 checkbox는 여러 건 선택할 수 있습니다.
- 단, `activeReportIds`는 최소 1건 이상 유지합니다.
- 왼쪽 패널 전체 선택을 다시 누르면 전체 해제가 아니라 첫 번째 보고서 1건만 남깁니다.
- 검색 모달에서 보고서를 체크하면 왼쪽 패널 목록에도 추가합니다.
- 검색 모달에서 체크된 보고서는 목록 상단에 올라오지만 스크롤은 위로 이동하지 않습니다.
- 답변 전에는 원문 패널 토글 아이콘을 표시하지 않습니다.
- 답변에 근거가 생긴 뒤에만 오른쪽 상단 원문 패널 아이콘을 표시합니다.

## Styling Rules

- 디자인시스템 class를 우선 사용합니다.
- 의미 없는 식별용 class는 추가하지 않습니다. 디자인시스템 유틸 class와 실제 스타일이 연결된 class만 사용합니다.
- 인라인 스타일은 동적 width, max width, object fit처럼 컴포넌트 상태와 직접 연결된 값에 한정합니다.
- 신규 색상은 만들지 않고 디자인 토큰 또는 유틸 클래스를 사용합니다.

## Accessibility Rules

- 패널 resize handle은 `role="separator"`와 `aria-orientation="vertical"`을 유지합니다.
- 검색 모달은 `role="dialog"`와 `aria-modal="true"`를 유지합니다.
- 장식 아이콘에는 `aria-hidden="true"`를 둡니다.
- 검색/첨부/패널 토글 버튼에는 `aria-label`을 둡니다.
- checkbox는 보고서명을 포함한 `aria-label`을 둡니다.

## Backend Integration Rules

- 채팅 전송 API는 `sendMessage` 또는 별도 hook에서 호출합니다.
- AI 답변은 최소 `text`, `hasEvidence`, `evidence` 계열 데이터를 포함해야 합니다.
- 근거가 있는 답변만 원문 패널 버튼을 표시합니다.
- 원문 이미지는 `SourcePanel`에 URL 또는 viewer payload로 전달합니다.
- 지도 근거는 `AnswerEvidenceAction = "map"` 분기에서 지도 패널 또는 지도 화면으로 연결합니다.
