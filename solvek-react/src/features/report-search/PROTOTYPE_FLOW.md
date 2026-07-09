# Report Search Prototype Flow

> 최신 기준 요약입니다. 이 섹션을 우선하고, 전체 상세 명세는 `MAIN_SCREEN_SPEC.md`를 확인합니다.

## 최신 메인 화면 사용자 흐름

### 1. 초기 화면

- 제목: `대화할 발굴보고서를 선택하거나 입력해보세요`
- 설명: 선택한 보고서를 기준으로 요약, 위치, 유구·유물 정보를 답변한다는 안내를 표시합니다.
- 검색바는 검색 도우미 버튼, 검색 input, 검색 버튼으로 구성합니다.
- 기본 상태에서는 전체 보고서 목록을 보여줍니다.
- 보고서가 선택되지 않았으면 하단 `채팅하기` CTA는 숨깁니다.

### 2. 검색어 입력

- 사용자가 input에 입력하면 `query`를 즉시 갱신합니다.
- 검색어가 있으면 `mode`를 `history`로 변경합니다.
- 보고서는 `title`, `summary`, `tags` 기준으로 실시간 필터링합니다.
- 매칭된 텍스트는 blue 색상으로 하이라이트합니다.

### 3. 검색 submit

- 검색 버튼 또는 Enter로 submit합니다.
- 결과가 있는 검색어만 최근 검색어에 저장합니다.
- 최근 검색어는 중복 제거 후 맨 앞으로 이동합니다.
- 최근 검색어는 최대 5개까지만 유지합니다.
- 결과가 없으면 `EmptyState`로 전환합니다.

### 4. 결과 없음

- 빈 상태 문구와 추천 검색어 버튼을 표시합니다.
- 선택된 보고서와 하단 CTA를 초기화합니다.
- 선택 제한 토스트를 숨깁니다.
- 추천 검색어를 누르면 해당 값으로 검색 상태를 복구합니다.

### 5. 검색 도우미

- 검색바 왼쪽 필터 아이콘을 누르면 팝업을 엽니다.
- 팝업은 카테고리와 옵션 목록으로 구성합니다.
- 옵션을 클릭하면 `clues`에 추가하거나 제거합니다.
- 팝업 바깥을 클릭하면 닫습니다.
- 키보드 이동은 `ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Space`를 지원합니다.

### 6. 단서 칩

- `clues.length > 0`이면 검색바 바로 아래에 칩 영역을 표시합니다.
- 칩 클릭은 `checkedClues` 활성/비활성을 토글합니다.
- 활성 칩은 blue 색상 상태로만 구분하고 체크 아이콘은 표시하지 않습니다.
- 초기화 버튼은 모든 단서와 활성 상태를 지웁니다.
- 칩 영역 자체는 height/opacity로 접히거나 펼쳐질 수 있습니다.
- 아래 결과 영역의 위치 이동에는 layout transition을 쓰지 않습니다.
- 검색 중 스크롤 위치가 바뀌어도 결과 콘텐츠가 검색바와 겹치는 애니메이션이 발생하면 안 됩니다.

### 7. 최근 검색한 보고서

- `query`가 비어 있고 최근 검색어가 있으면 표시합니다.
- 위치는 검색바/단서 칩 바로 아래입니다.
- 추천 보고서보다 위에 위치합니다.
- 최근 검색어를 클릭하면 해당 검색어로 결과를 보여주고 선택 보고서를 초기화합니다.

### 8. 추천 보고서

- `query`가 비어 있고 최근 검색어가 5개 이상이며 추천 결과가 있으면 표시합니다.
- 위치는 모든 보고서 리스트 또는 그룹 리스트 바로 위입니다.
- 추천 보고서 아래에는 42px 여백을 둡니다.
- 추천 보고서 카드도 일반 보고서 카드와 동일한 선택 규칙을 따릅니다.

### 9. 일반 결과 목록

- 활성 단서나 필터가 없으면 `ResultHeader`와 `ReportGrid`를 표시합니다.
- 헤더는 `총 N건` 또는 필터 문맥의 `{키워드} N건`으로 표시합니다.
- 카드 클릭으로 보고서를 선택/해제합니다.

### 10. 키워드별 그룹 결과

- `checkedClues`가 있으면 이를 우선 그룹 기준으로 사용합니다.
- `checkedClues`가 없고 `activeFilters`가 있으면 `activeFilters`를 그룹 기준으로 사용합니다.
- 그룹 헤더는 `{키워드} {건수}건`과 `채팅하기 >` 액션으로 구성합니다.
- 그룹 본문은 해당 키워드의 보고서 카드 목록입니다.

### 11. 보고서 선택 제한

- 보고서는 최대 2건까지만 선택할 수 있습니다.
- 2건을 초과하려고 하면 새 선택은 무시하고 토스트를 표시합니다.
- 토스트 문구는 `최대 2건만 가능합니다`입니다.
- 토스트 표시 시간은 1800ms입니다.

### 12. 그룹 채팅하기

- 그룹 보고서가 1-2건이면 바로 `onStartChat(reportIds)`를 호출합니다.
- 그룹 보고서가 3건 이상이면 바로 이동하지 않습니다.
- 그룹의 앞 2건만 선택 상태로 만들고 토스트를 표시합니다.
- 사용자는 하단 fixed `채팅하기` CTA를 눌러 이동합니다.

### 13. 하단 채팅 CTA

- `selectedReports.length > 0`이면 하단 fixed CTA를 표시합니다.
- CTA 클릭 시 선택 보고서 id를 최대 2건으로 잘라 `onStartChat(reportIds)`를 호출합니다.

---

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
- 선택된 옵션은 blue 텍스트와 배경으로 표시됩니다.
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
- 칩을 체크하면 선택 단서 활성 상태가 됩니다.
- 활성 칩은 체크 아이콘 없이 blue border, blue text, blue background로만 표시합니다.
- 개별 X 삭제는 사용하지 않습니다.
- `초기화` 버튼을 누르면 모든 단서와 체크 상태가 초기화됩니다.
- 단서 목록은 Swiper로 가로 스크롤됩니다.
- 칩 영역은 자체 height/opacity transition으로 사라질 수 있습니다.
- 결과 영역의 위치는 즉시 재배치합니다.
- `LayoutGroup`, `layout`, `layout="position"` 기반 위치 보간은 사용하지 않습니다.

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

## Grouped Result Flow

활성 키워드가 있으면 결과를 하나의 `총 N건` 목록이 아니라 키워드별 그룹으로 표시합니다.

활성 키워드 기준:

1. `checkedClues`가 있으면 `checkedClues`를 그룹 기준으로 사용합니다.
2. `checkedClues`가 없고 `activeFilters`가 있으면 `activeFilters`를 그룹 기준으로 사용합니다.
3. 둘 다 없으면 기존 단일 결과 목록을 사용합니다.

그룹 데이터 구조:

```ts
type ReportGroup = {
  label: string;
  reports: Report[];
};
```

각 그룹 UI:

- 헤더 왼쪽: `{label} {reports.length}건`
- 헤더 오른쪽: `채팅하기` 버튼과 chevron icon
- 하단: 해당 그룹 보고서 카드 그리드

그룹 헤더의 `채팅하기`:

- 그룹 보고서가 1-2건이면 바로 챗봇으로 이동합니다.
- 그룹 보고서가 3건 이상이면 바로 이동하지 않습니다.
- 해당 그룹 앞 2건만 선택 상태로 만듭니다.
- `최대 2건만 가능합니다` 토스트를 띄웁니다.
- 사용자는 하단 고정 `채팅하기`를 눌러 챗봇으로 이동합니다.

프로토타입 데이터에 실제 매칭 결과가 없으면 화면 검증을 위해 현재 결과 후보 중 앞 3건을 임시로 표시할 수 있습니다. 실제 API 연결 후에는 백엔드가 그룹별 결과를 반환해야 합니다.

## Chat CTA Flow

`selectedReports.length > 0`이면 하단 고정 CTA가 표시됩니다.

- 위치: 화면 하단 fixed
- 버튼: `채팅하기`
- 역할: 선택 보고서를 기반으로 챗봇 화면으로 이동하는 진입점

클릭 시:

- `MainSearchPage`가 선택 보고서 id 최대 2건으로 `onStartChat(reportIds)`를 호출합니다.
- `App.tsx`가 `selectedReportIds`를 저장합니다.
- `App.tsx`가 `reportData`에서 선택 보고서를 찾아 `ChatPage`에 `reports` prop으로 전달합니다.
- 화면은 `search`에서 `chat`으로 전환됩니다.

## Chat Screen Handoff

챗봇 화면의 상세 플로우는 검색 문서에 중복 작성하지 않습니다.

- `../report-chat/README.md`
- `../report-chat/PROTOTYPE_FLOW.md`
- `../report-chat/COMPONENT_RULES.md`

## Toast Flow

선택 보고서가 2건인 상태에서 추가 선택을 시도하면 토스트가 표시됩니다. 그룹 헤더의 `채팅하기`가 3건 이상을 대상으로 할 때도 토스트가 표시되고 앞 2건만 선택됩니다.

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
  <GroupedReportSections />
  <ReportGrid />
  <ChatCTA />
</MainSearchPage>
```

`ChatCTA`는 별도 컴포넌트로 분리되어 있지 않고 `MainSearchPage` 안에 직접 렌더링되어 있습니다.

## Rebuild Checklist

- 검색어 입력 시 결과 목록이 즉시 필터링되는가
- 검색 결과 없음 상태에서 선택 보고서와 채팅 CTA가 초기화되는가
- 보고서 선택은 최대 2건까지만 가능한가
- 검색 도우미 옵션은 마우스와 키보드로 선택 가능한가
- 선택한 단서 칩 초기화가 가능한가
- 활성 단서 칩에 체크 아이콘이 보이지 않는가
- 활성 키워드별 그룹 결과가 표시되는가
- 그룹 헤더의 `채팅하기`가 3건 이상일 때 앞 2건만 선택하고 토스트를 표시하는가
- 검색어 입력/단서 초기화/결과 전환 시 결과 영역이 검색바와 겹치는 위치 애니메이션 없이 즉시 재배치되는가
- 최근 검색어 중복이 제거되는가
- 태그/제목/요약의 검색어 하이라이트가 동작하는가
- 디자인시스템 class를 우선 사용했는가
