# Report Search Prototype Flow

이 문서는 `MainSearchPage.tsx`와 `ReportSearchSections.tsx` 기준의 화면 흐름 설명입니다. 새 UI를 만들 때는 아래 상태와 조건부 렌더링을 먼저 재현합니다.

## Main Screen

초기 화면은 발굴보고서 검색 화면입니다.

- 배경: `bg-slate-50`
- 메인 영역: `h-screen overflow-auto`
- 상단 제목: `대화할 발굴보고서를 선택하거나 입력해보세요`
- 설명: `AI는 선택한 1개 보고서를 기준으로 요약, 위치, 유구·유물 정보를 답변합니다.`
- 검색창: 검색 도우미 버튼 + 검색 input + 검색 버튼
- 기본 결과: 전체 보고서 목록

## Main State

`MainSearchPage`가 관리하는 상태입니다.

| state | type | role |
|---|---|---|
| `query` | `string` | 검색어 |
| `mode` | `ViewMode` | 화면 상태 |
| `searchHistory` | `string[]` | 최근 검색어 |
| `helperOpen` | `boolean` | 검색 도우미 팝업 열림 여부 |
| `activeFilters` | `string[]` | 선택된 필터 칩 |
| `clues` | `string[]` | 검색 도우미에서 추가한 단서 |
| `checkedClues` | `string[]` | 선택한 단서 칩 중 체크된 값 |
| `selectedReports` | `number[]` | 선택한 보고서 id 목록 |
| `toastVisible` | `boolean` | 최대 선택 제한 토스트 표시 여부 |

## View Modes

`ViewMode`는 `types.ts`에서 관리합니다.

```ts
type ViewMode = "default" | "history" | "filtered" | "grouped" | "empty" | "recommend";
```

현재 주요 사용 방식:

- `default`: 검색어가 없고 기본 보고서 목록을 보여주는 상태
- `history`: 검색어가 있거나 최근 검색어를 선택한 상태
- `grouped`, `filtered`: 필터가 선택되어 필터 결과를 보여주는 상태
- `empty`: 검색 결과 없음 상태
- `recommend`: 추천 흐름용 예비 상태

## Search Flow

1. 사용자가 검색어를 입력합니다.
2. 입력값이 있으면 `mode`는 `history`로 바뀝니다.
3. 검색 submit 시 `handleSearch`가 실행됩니다.
4. 검색 결과가 있으면 최근 검색어 목록에 추가합니다.
5. 검색 결과가 없으면 `EmptyState`가 표시됩니다.

검색 매칭 기준은 현재 프로토타입에서 아래 필드를 대상으로 합니다.

- `report.title`
- `report.summary`
- `report.tags`

## Empty Result Flow

결과 없음 상태 기준:

```ts
const isEmptyResult = mode === "empty" || (query.trim() !== "" && shownReports.length === 0);
```

`isEmptyResult`가 true가 되면:

- `EmptyState`를 표시합니다.
- `selectedReports`를 빈 배열로 초기화합니다.
- 하단 `채팅하기` CTA를 숨깁니다.
- 선택 제한 토스트를 닫습니다.

`EmptyState`에는 아래 요소가 있습니다.

- `not-file` 아이콘
- `“{query}” 를 찾을 수 없습니다`
- 추천 검색어 버튼 3개

추천 검색어를 누르면:

- `query`를 추천 문구로 변경합니다.
- `mode`를 `history`로 변경합니다.

## Helper Menu Flow

검색창 왼쪽 필터 아이콘 버튼을 누르면 `HelperMenu`가 열립니다.

카테고리:

- 지역
- 소재지
- 시대

동작:

- 카테고리를 클릭하면 오른쪽 상세 옵션 패널이 열립니다.
- 옵션을 클릭하면 `clues`에 추가/삭제됩니다.
- 선택된 옵션은 체크 아이콘으로 표시됩니다.
- 팝업 바깥을 클릭하면 닫힙니다.

키보드:

- `ArrowDown`: 다음 옵션
- `ArrowUp`: 이전 옵션
- `Home`: 첫 옵션
- `End`: 마지막 옵션
- `Enter` 또는 `Space`: 현재 옵션 선택

## Clue Chips Flow

`clues.length > 0`이면 `ClueChips`가 표시됩니다.

동작:

- 각 단서는 checkbox chip으로 표시됩니다.
- 칩을 체크하면 삭제 버튼이 나타납니다.
- 삭제 버튼을 누르면 해당 단서가 제거됩니다.
- 단서 목록은 Swiper로 가로 스크롤됩니다.

## Report Result Flow

결과 목록은 `ReportGrid`가 표시합니다.

카드 구성:

- 보고서 제목
- 연도
- 요약
- 태그 목록

검색어가 있으면 제목, 요약, 태그 중 매칭되는 텍스트를 강조합니다.

카드를 클릭하면:

- 선택되지 않은 보고서는 선택됩니다.
- 이미 선택된 보고서는 선택 해제됩니다.
- 최대 2건까지만 선택됩니다.
- 2건을 초과하려 하면 토스트가 표시됩니다.

## Chat CTA Flow

`selectedReports.length > 0`이면 하단 고정 CTA가 표시됩니다.

- 위치: 화면 하단 fixed
- 버튼: `채팅하기`
- 역할: 선택 보고서를 기반으로 챗봇 화면으로 이동하는 진입점

클릭 시:

- `MainSearchPage`가 `onStartChat(selectedReports)`를 호출합니다.
- `App.tsx`가 `selectedReportIds`를 저장합니다.
- `App.tsx`가 `reportData`에서 선택 보고서를 찾아 `ChatPage`에 `reports` prop으로 전달합니다.
- 화면은 `search`에서 `chat`으로 전환됩니다.

## Chat Screen Flow

`ChatPage`는 선택한 보고서 기반 채팅 화면입니다.

주요 영역:

- 좌측 패널 상단: `홈으로`, `검색`
- 좌측 패널 본문: 사용자가 메인 화면에서 선택한 보고서만 목록으로 표시
- 우측 상단: 좌측 패널 접기/펼치기 버튼. 선택 보고서가 없으면 표시하지 않음
- 중앙 영역: 선택 보고서 안내 문구와 맞춤 제안 버튼 목록
- 하단 입력 영역: 예시 질문, 검색형 input, 첨부 버튼, 검색 버튼

동작:

- 뒤로가기 버튼을 누르면 `App.tsx`가 화면을 다시 `search`로 전환합니다.
- 좌측 패널에는 메인 화면에서 처음 체크한 보고서만 나열합니다.
- 좌측 패널의 전체 선택과 각 보고서 checkbox는 채팅 대상 보고서를 다시 선택하는 용도입니다.
- 다중 선택이 가능하지만 채팅 대상 보고서는 최소 1건 이상 유지합니다.
- 전체 선택이 켜진 상태에서 다시 누르면 모든 항목을 해제하지 않고 1건만 남깁니다.
- 선택 보고서가 0건인 예외 상태에서는 중앙 영역에 `보고서를 선택해주세요` 문구를 표시합니다.
- 맞춤 제안은 버튼 형태이며 클릭 시 채팅 메시지로 전송됩니다.
- 메시지를 입력하고 전송하면 user 메시지가 추가됩니다.
- 현재는 실제 API 대신 placeholder assistant 메시지가 추가됩니다.
- 백엔드 연결 시 메시지 submit 위치에서 채팅 API를 호출하면 됩니다.

## Toast Flow

선택 보고서가 2건인 상태에서 추가 선택을 시도하면 토스트가 표시됩니다.

문구:

```txt
최대 2건만 가능합니다
```

표시 시간:

```ts
1800ms
```

결과 없음 상태가 되면 토스트는 즉시 닫힙니다.

## Recent And Recommendation Flow

최근 검색어:

- 검색어로 결과가 있으면 최근 검색어에 추가합니다.
- 최대 5개까지 유지합니다.
- 같은 검색어는 중복 저장하지 않고 맨 앞으로 이동합니다.

추천 보고서:

- 최근 검색어가 5개 이상이고 추천 결과가 있으면 `RecommendSlider`가 표시됩니다.
- 추천 기준은 현재 프로토타입에서 최근 검색어의 키워드와 보고서 제목/요약/태그 매칭입니다.

## Component Composition

```tsx
<MainSearchPage>
  <HelperMenu />
  <ClueChips />
  <EmptyState />
  <RecentReports />
  <RecommendSlider />
  <FilterRail />
  <ResultHeader />
  <ReportGrid />
  <ChatCTA />
</MainSearchPage>
```

`ChatCTA`는 별도 컴포넌트로 분리되어 있지 않고 `MainSearchPage` 안에 직접 렌더링되어 있습니다. 추후 챗봇 화면이 추가되면 분리해도 됩니다.

## Rebuild Checklist

- 검색어 입력 시 결과 목록이 즉시 필터링되는가
- 검색 결과 없음 상태에서 선택 보고서와 채팅 CTA가 초기화되는가
- 보고서 선택은 최대 2건까지만 가능한가
- 검색 도우미 옵션은 마우스와 키보드로 선택 가능한가
- 선택한 단서 칩 삭제가 가능한가
- 최근 검색어 중복이 제거되는가
- 태그/제목/요약의 검색어 하이라이트가 동작하는가
- 디자인시스템 class를 우선 사용했는가
