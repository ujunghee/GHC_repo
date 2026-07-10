# Main UI Replacement Handoff

이 문서는 메인 검색 화면 UI를 사용자가 제공한 새 화면 파일로 덮어쓸 때, 현재 개발된 기능을 손상하지 않도록 다음 개발자 또는 AI가 반드시 따라야 하는 바톤터치 문서입니다.

핵심 원칙:

- 새 UI 파일은 시각 기준입니다. 픽셀, 레이아웃, 여백, 타이포, 색, 버튼 배치, 카드 모양은 사용자가 준 화면을 최대한 그대로 복제합니다.
- 현재 React 코드의 상태, 이벤트, 데이터 흐름은 기능 기준입니다.
- 검색 기능을 다시 만들지 말고, 현재 기능 위에 새 UI를 입힙니다.
- 화면이 비슷해 보여도 검색/선택/채팅 진입 기능이 끊기면 실패입니다.

## 작업 범위

대상 화면:

- 기능 폴더: `solvek-react/src/features/report-search`
- 루트 컨테이너: `MainSearchPage.tsx`
- 화면 섹션 컴포넌트: `components/ReportSearchSections.tsx`

새 UI를 입힐 때 우선 수정할 수 있는 부분:

- JSX 마크업 구조
- className
- 디자인시스템 class 조합
- 필요한 wrapper
- 인라인 style 중 순수 시각 표현 값
- 표시 문구
- 아이콘 배치
- 카드/슬라이더/팝업 내부 레이아웃

되도록 수정하지 말아야 하는 부분:

- `MainSearchPage`의 state 이름과 소유 관계
- `MainSearchPage`의 handler 역할
- `ReportSearchSections`의 props 계약
- 검색 도우미 외부 클릭 닫힘 로직
- 검색 도우미 키보드 접근성
- 단서 추가/삭제/활성화 로직
- 최근 검색어 저장 조건
- 추천 보고서 조건
- 그룹 결과 생성 흐름
- 결과 없음 시 선택 보고서 초기화
- 보고서 선택 개수 무제한 정책
- 하단 `채팅하기`가 선택 id 전체를 전달하는 정책
- 그룹 `채팅하기`가 그룹 id 전체를 전달하는 정책

## Current Functional Skeleton

```tsx
<MainSearchPage>
  <HelperMenu />
  <ClueChips />
  <RecentReports />
  <RecommendSlider />
  <FilterRail />
  <ResultHeader />
  <GroupedReportSections />
  <ReportGrid />
  <EmptyState />
  <BottomChatCTA />
</MainSearchPage>
```

새 UI를 넣더라도 이 역할 분리는 유지합니다.

## MainSearchPage State Contract

아래 state는 현재 기능의 핵심입니다. 이름을 바꾸거나 하위 컴포넌트로 옮기지 않습니다.

| state | type | purpose |
|---|---|---|
| `viewportWidth` | `number` | narrow viewport 판단 |
| `query` | `string` | 검색어 input 값 |
| `mode` | `ViewMode` | 화면 모드 |
| `searchHistory` | `string[]` | 최근 검색어 |
| `helperOpen` | `boolean` | 검색 도우미 팝업 열림 여부 |
| `activeFilters` | `string[]` | 필터 레일 선택값 |
| `clues` | `string[]` | 검색 도우미에서 추가한 단서 |
| `checkedClues` | `string[]` | 활성화된 단서 칩 |
| `selectedReports` | `number[]` | 선택한 보고서 id 전체 |

Derived values:

| derived value | purpose |
|---|---|
| `shownReports` | 검색어/mode 기준 화면 표시 보고서 |
| `activeGroupKeywords` | 그룹 결과 기준 키워드 |
| `groupedReports` | 키워드별 보고서 그룹 |
| `recommendedReports` | 최근 검색어 기반 추천 보고서 |
| `isEmptyResult` | 결과 없음 상태 |
| `hasGroupedResults` | 그룹 결과 표시 여부 |
| `resultCount` | 결과 헤더 count |
| `heading` | 화면 title |
| `isNarrowViewport` | compact UI 분기 |

## Handler Contract

`handleSearch(event?)`

- form submit 시 호출합니다.
- 검색어가 있고 결과가 있으면 최근 검색어에 저장합니다.
- 최근 검색어는 중복 제거 후 최대 5개입니다.
- 검색어가 있으면 `mode`는 `"history"`입니다.
- 검색어가 없으면 `mode`는 `"default"`입니다.

`toggleClue(value)`

- 검색 도우미 option 클릭 시 호출합니다.
- `clues`에 없으면 추가, 있으면 제거합니다.
- 제거되는 단서는 `checkedClues`에서도 제거합니다.

`toggleClueChecked(value)`

- 단서 칩 checkbox 클릭 시 호출합니다.
- `checkedClues`에 없으면 추가, 있으면 제거합니다.
- 그룹 결과 기준에 반영됩니다.

`resetClues()`

- 단서와 활성 단서를 모두 초기화합니다.

`toggleFilter(filter)`

- 필터 레일 chip 클릭 시 호출합니다.
- active filter를 추가/제거합니다.
- 선택값이 있으면 `mode`는 `"grouped"`입니다.
- 선택값이 없으면 검색어 여부에 따라 `"history"` 또는 `"default"`입니다.

`chooseRecent(term)`

- 최근 검색어 chip 클릭 시 호출합니다.
- `query`를 해당 term으로 바꿉니다.
- `mode`를 `"history"`로 바꿉니다.
- 기존 선택 보고서를 초기화합니다.

`toggleReport(id)`

- 보고서 카드 클릭 시 호출합니다.
- 선택 안 된 id는 `selectedReports`에 추가합니다.
- 선택된 id는 제거합니다.
- 프론트에서 개수 제한을 하지 않습니다.

`startChatWithReports(reportIds)`

- 하단 `채팅하기` 클릭 시 호출합니다.
- id가 0개면 아무것도 하지 않습니다.
- id 전체를 `onStartChat`으로 넘깁니다.
- `slice(0, 2)`를 넣으면 안 됩니다.

`startChatWithGroup(reports)`

- 그룹 헤더 `채팅하기` 클릭 시 호출합니다.
- 그룹의 report id 전체를 `onStartChat`으로 넘깁니다.
- 앞 2건만 고르거나 토스트를 띄우면 안 됩니다.

## UI Replacement Rules

### 1. Use The Supplied UI As The Visual Source Of Truth

사용자가 제공한 메인 UI 파일의 레이아웃을 그대로 옮깁니다.

반드시 맞춰야 하는 시각 항목:

- 전체 배경
- main section width와 top spacing
- 제목/설명 위치와 타이포
- 검색바 크기와 radius
- 검색 도우미 trigger 위치
- 검색 도우미 팝업 위치/크기/상태
- 단서 칩 row
- 최근 검색어 slider
- 추천 보고서 slider
- 필터 레일
- 결과 헤더
- 보고서 카드 grid/card/tag/selected state
- 그룹 결과 header/card stack
- 결과 없음 상태
- 하단 fixed CTA

하지만 아래 기능 연결은 절대 끊지 않습니다.

- 검색 input은 `query`와 연결합니다.
- 검색 submit은 `handleSearch`와 연결합니다.
- helper trigger는 `helperOpen`과 연결합니다.
- helper option은 `toggleClue`와 연결합니다.
- clue chip은 `checkedClues`와 연결합니다.
- report card는 `selectedReports`와 연결합니다.
- bottom CTA는 `startChatWithReports(selectedReports)`를 호출합니다.
- group chat은 `startChatWithGroup(group.reports)`를 호출합니다.

### 2. Do Not Flatten The Screen Into Static HTML

금지:

- 보고서 카드를 정적 HTML로만 두기
- 최근 검색어를 정적 chip으로만 두기
- 추천 보고서를 정적 card로만 두기
- `reports.map`, `groups.map`, `searchHistory.map`, `suggestion.map` 제거
- 검색 input에서 `value={query}` 제거
- helper popup의 keyboard handler 제거
- report card 선택 로직 제거
- bottom CTA 조건 제거

허용:

- UI wrapper 추가
- 텍스트/아이콘 위치 변경
- className 변경
- 시각 전용 div/span 추가
- motion wrapper 유지 또는 조정

### 3. Keep Component Boundaries

`MainSearchPage`

- state와 handler를 관리합니다.
- 조건부로 섹션 컴포넌트를 조합합니다.

`HelperMenu`

- 검색 도우미 category/option UI만 담당합니다.

`ClueChips`

- 단서 chip slider와 reset UI만 담당합니다.

`RecentReports`

- 최근 검색어 slider만 담당합니다.

`RecommendSlider`

- 추천 보고서 slider만 담당합니다.

`ReportGrid`/`ReportCard`

- 보고서 카드 UI만 담당합니다.

`GroupedReportSections`

- 그룹별 결과 UI만 담당합니다.

`EmptyState`

- 결과 없음 UI만 담당합니다.

## Required UI Areas

### A. Search Shell

현재 root:

```tsx
<main className="bg-slate-50 h-screen overflow-auto">
```

유지 조건:

- 화면 전체 height를 채웁니다.
- 결과가 길면 page 내부 scroll이 가능해야 합니다.
- 하단 fixed CTA가 있을 때도 마지막 카드가 완전히 가려지지 않아야 합니다.

### B. Header

현재 기능:

- `heading` 값 표시
- 설명 문구 표시
- center alignment

새 UI의 제목/설명 스타일은 그대로 복사하되, heading 값은 state 기반으로 유지합니다.

### C. Search Bar

유지 조건:

- form submit 유지
- helper trigger는 `type="button"`
- search submit은 `type="submit"`
- input은 controlled input
- helper popup은 `helperOpen`일 때만 표시
- helper popup 외부 클릭 닫힘 유지

### D. Helper Menu

유지 조건:

- category click 시 option panel 표시
- option click 시 clue toggle
- keyboard: ArrowUp, ArrowDown, Home, End, Enter, Space
- selected option 표시
- `role="listbox"`, `role="option"` 유지

### E. Clue Chips

유지 조건:

- `clues.length > 0`일 때 표시
- chip check 시 `checkedClues` 활성/비활성
- remove 버튼이 있으면 `onRemove(clue)`
- reset 버튼은 `onReset`
- Swiper slider 유지

### F. Recent Reports

유지 조건:

- `query.trim() === "" && searchHistory.length > 0`일 때 표시
- click 시 `chooseRecent`
- Swiper nav 유지

### G. Recommendations

유지 조건:

- `query.trim() === "" && searchHistory.length >= 5 && recommendedReports.length > 0`일 때 표시
- card 선택 기능은 일반 card와 동일
- Swiper nav 유지

### H. Result Cards

유지 조건:

- `ReportGrid`는 report list를 map으로 렌더링
- `ReportCard` click 시 선택/해제
- 선택 상태는 `selectedReports.includes(report.id)`
- title/summary/tag highlight 유지
- tags는 `report.tags.map`

### I. Grouped Results

유지 조건:

- `groupedReports.length > 0`이면 그룹 결과 표시
- 각 그룹은 label/count/report grid 표시
- 그룹 `채팅하기`는 그룹 report id 전체 전달

### J. Empty State

유지 조건:

- 검색 결과가 없으면 표시
- 진입 시 선택 보고서 초기화
- suggestion button click 시 query 변경 및 history mode

### K. Bottom Chat CTA

유지 조건:

- `selectedReports.length > 0`일 때만 표시
- click 시 선택 id 전체 전달
- 프론트 임의 개수 제한 없음

## API And Toast Notes

메인에서 보고서 선택 개수는 제한하지 않습니다.

금지:

- `current.length >= 2`
- `groupReportIds.length > 2`
- `slice(0, 2)`
- `최대 2건만 가능합니다`
- `최대 5건까지 대화할 수 있어요`

선택 가능한 최대 보고서 수는 채팅 세션 생성 API가 판단합니다. API 실패 메시지는 토스트로 표시할 수 있지만, 메인 카드 선택 단계에서 임의 제한 토스트를 띄우지 않습니다.

## Exact Implementation Checklist

UI 교체 전:

- `MAIN_UI_SCREEN_SPEC.md`의 측정표를 새 UI 기준으로 채웁니다.
- 새 UI의 영역을 header, search, helper, chips, recent, recommend, cards, empty, CTA로 나눕니다.
- 각 클릭 요소를 현재 handler와 매칭합니다.

구현 중:

- 먼저 `MainSearchPage` state/handler는 건드리지 않고 하위 UI만 바꿉니다.
- 검색바와 helper popup을 맞춥니다.
- clue/recent/recommend slider를 맞춥니다.
- report card와 grid를 맞춥니다.
- grouped/empty/bottom CTA를 맞춥니다.

구현 후 반드시 확인:

- 검색어 입력 시 결과가 필터링되는가
- 검색 submit 시 최근 검색어가 저장되는가
- helper popup이 열리고 닫히는가
- helper keyboard가 동작하는가
- clue 추가/활성/삭제/초기화가 되는가
- 최근 검색어 클릭이 동작하는가
- 추천 보고서 카드 선택이 동작하는가
- 일반 카드 선택이 동작하는가
- 그룹 카드 선택이 동작하는가
- 그룹 `채팅하기`가 전체 id를 넘기는가
- 하단 `채팅하기`가 전체 selected id를 넘기는가
- 결과 없음에서 selectedReports가 초기화되는가
- narrow viewport에서 카드/검색창/CTA가 겹치지 않는가
- `npm run build`가 통과하는가

## Suggested Prompt For The Next AI

```txt
사용자가 제공한 메인 검색 UI 화면 파일을 시각 기준으로 삼아 현재 React 메인 검색 화면에 그대로 입혀줘.

반드시 먼저 읽을 문서:
1. solvek-react/src/features/report-search/MAIN_UI_SCREEN_SPEC.md
2. solvek-react/src/features/report-search/MAIN_UI_REPLACEMENT_HANDOFF.md
3. solvek-react/src/features/report-search/README.md
4. solvek-react/src/features/report-search/COMPONENT_RULES.md

절대 지켜야 할 조건:
- 새 UI는 사용자가 준 화면과 최대한 동일하게 구현한다.
- 현재 개발된 검색/단서/추천/선택/채팅 CTA 기능은 삭제하지 않는다.
- MainSearchPage의 state/handler 계약을 유지한다.
- ReportSearchSections의 컴포넌트 역할 경계를 유지한다.
- 보고서 선택 개수 제한을 프론트에 하드코딩하지 않는다.
- 선택 보고서 수 제한 토스트는 API 응답 메시지 기준이다.
- 작업 후 npm run build로 검증한다.
```
