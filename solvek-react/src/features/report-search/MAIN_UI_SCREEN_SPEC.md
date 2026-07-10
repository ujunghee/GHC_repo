# Main Search UI Screen Spec

이 문서는 사용자가 제공한 메인 검색 UI 원본 화면을 React/CSS로 복사하듯 구현하기 위한 화면 정의서입니다.

`MAIN_UI_REPLACEMENT_HANDOFF.md`가 기능 보존 계약이라면, 이 문서는 시각 구현 계약입니다.

다음 개발자 또는 AI는 새 메인 UI 파일을 받으면 이 문서를 기준으로 화면을 분석하고, 각 값을 React 컴포넌트와 CSS에 매핑해야 합니다.

## Required Inputs

이 git을 개발자에게 그대로 넘기는 경우, 별도 캡처나 외부 디자인 파일은 필수가 아닙니다. 아래 경로의 현재 React 코드와 CSS가 메인 화면의 원본 UI입니다.

원본 경로:

- `solvek-react/src/features/report-search/MainSearchPage.tsx`
- `solvek-react/src/features/report-search/components/ReportSearchSections.tsx`
- `solvekdesignsystem-web/css/index.css`
- `solvekdesignsystem-web/image/icon/`

외부 UI 시안을 추가로 받는 경우에만 아래 입력물을 보조 자료로 사용합니다.

- 새 메인 UI 원본 파일: HTML, React, Figma export, 캡처 이미지, 또는 디자인 산출물
- 기준 desktop viewport 캡처
- 가능하면 mobile/narrow viewport 캡처
- 검색 도우미 팝업이 열린 상태 캡처
- 단서 칩이 표시된 상태 캡처
- 최근 검색어가 표시된 상태 캡처
- 추천 보고서가 표시된 상태 캡처
- 일반 결과 목록 캡처
- 그룹 결과 목록 캡처
- 결과 없음 상태 캡처
- 하단 `채팅하기` CTA 표시 상태 캡처
- 아이콘/이미지 asset 원본 또는 asset 경로
- 사용한 font family, font weight, font size 정보
- CSS가 있다면 전체 CSS 파일

입력물이 캡처 이미지만 있을 경우:

- 픽셀 단위 완전 동일 구현은 어렵습니다.
- 그래도 이 문서의 `Visual Measurement Sheet`를 먼저 채운 뒤 구현합니다.
- 측정은 브라우저 devtools 또는 이미지 측정 도구로 합니다.

## Visual Source Of Truth

새 UI의 시각 기준 우선순위:

1. 사용자가 제공한 실제 UI 파일 또는 코드
2. 사용자가 제공한 화면 캡처
3. 이 문서의 측정표
4. 기존 React 기능 구조
5. 기존 디자인시스템 class

기능 기준 우선순위:

1. `MAIN_UI_REPLACEMENT_HANDOFF.md`
2. `MainSearchPage.tsx`
3. `components/ReportSearchSections.tsx`
4. `COMPONENT_RULES.md`

즉, 시각은 새 UI가 이기고, 기능은 현재 React 계약이 이깁니다.

## File Mapping

새 UI를 React에 넣을 때 아래 파일로 나눕니다.

| screen area | React file | CSS responsibility |
|---|---|---|
| 전체 메인 shell | `MainSearchPage.tsx` | page bg, vertical layout, section width, bottom CTA |
| 제목/설명 | `MainSearchPage.tsx` | title alignment, heading, subtitle |
| 검색바 | `MainSearchPage.tsx` | search wrapper, helper trigger, input, submit button |
| 검색 도우미 팝업 | `components/ReportSearchSections.tsx` `HelperMenu` | helper category panel, option panel |
| 단서 칩 | `components/ReportSearchSections.tsx` `ClueChips` | chip list, reset, navigation buttons |
| 필터 레일 | `components/ReportSearchSections.tsx` `FilterRail` | filter chip row |
| 최근 검색어 | `components/ReportSearchSections.tsx` `RecentReports` | recent chip slider |
| 추천 보고서 | `components/ReportSearchSections.tsx` `RecommendSlider` | slider and card layout |
| 결과 헤더 | `components/ReportSearchSections.tsx` `ResultHeader` | count and chat action |
| 보고서 카드 | `components/ReportSearchSections.tsx` `ReportCard`, `ReportGrid` | card, selected, tag, highlight |
| 그룹 결과 | `components/ReportSearchSections.tsx` `GroupedReportSections` | group header and grid |
| 결과 없음 | `components/ReportSearchSections.tsx` `EmptyState` | empty icon, text, suggestion buttons |

새 UI 원본이 이미 React로 구분되어 있다면:

- 원본 컴포넌트 이름을 가져와도 됩니다.
- 단, 최종 위치는 위 파일 매핑에 맞춥니다.
- 상태 소유권은 원본 UI가 아니라 현재 `MainSearchPage` 기준으로 재연결합니다.

## CSS Placement Rules

기존 CSS 우선순위:

1. `solvekdesignsystem-web/css/index.css`
2. `solvekdesignsystem-web/css/component/search.css`
3. `solvekdesignsystem-web/css/component/chip.css`
4. `solvekdesignsystem-web/css/component/checkbox.css`
5. `solvekdesignsystem-web/css/component/meta-tag.css`
6. `solvekdesignsystem-web/css/uikit/web/filter.css`
7. 필요 시 새 메인 전용 CSS

현재 메인 관련 class가 이미 있는 곳:

| class/pattern | file | current use |
|---|---|---|
| `main-search-wrapper` | `component/search.css` | 메인 검색 form wrapper |
| `main-search-62` | `component/search.css` | 62px 메인 검색창 |
| `main-search__input` | `component/search.css` | 검색 input |
| `search-button` | `component/search.css` | 검색 submit button |
| `filter-tooltip-trigger` | `component/search.css` | 검색 도우미 trigger |
| `map-search-dropdown` | map/search CSS | 검색 도우미 팝업 위치/상자 |
| `checkbox-chip-label` | `component/chip.css`, `checkbox.css` | 단서/필터 chip |
| `checkbox-chip` | `component/chip.css`, `checkbox.css` | chip checkbox |
| `meta-tag`, `meta-tag--active` | `component/meta-tag.css` | 보고서 카드 태그 |
| `blue-button-48` | `component/button.css` | 하단 채팅 CTA |
| `not-file` | `default/icon.css` | 결과 없음 icon |

새 CSS를 추가해야 할 때:

- 메인 검색 전용 class는 `main-search-*` 또는 `report-search-*` prefix를 사용합니다.
- 디자인시스템에 이미 있는 버튼/search/checkbox/chip/card class를 새로 복제하지 않습니다.
- 새 UI 고유 layout만 새 class로 만듭니다.
- 기존 class를 덮어써야 하면 영향 범위를 메인 root class 아래로 제한합니다.

권장 새 CSS 위치:

```txt
solvekdesignsystem-web/css/component/report-search.css
```

새 파일을 만들면 반드시 `solvekdesignsystem-web/css/index.css`에 import를 추가합니다.

```css
@import url('./component/report-search.css');
```

## Visual Measurement Sheet

새 UI 파일을 받으면 먼저 아래 표를 채웁니다.

### Viewport

| item | value |
|---|---|
| 기준 desktop width |  |
| 기준 desktop height |  |
| main background |  |
| content max width |  |
| content top margin |  |
| content bottom padding |  |
| horizontal padding desktop |  |
| horizontal padding mobile |  |
| font family |  |

### Header

| item | value |
|---|---|
| header top position |  |
| header bottom margin |  |
| title text |  |
| title font |  |
| title color |  |
| subtitle text |  |
| subtitle font |  |
| subtitle color |  |
| text alignment |  |

React mapping:

- title: `heading`
- subtitle: static copy currently in `MainSearchPage`

### Main Search Bar

| item | value |
|---|---|
| wrapper width |  |
| input height |  |
| background |  |
| border |  |
| radius |  |
| padding left/right |  |
| gap |  |
| helper button size |  |
| helper active state |  |
| input font |  |
| placeholder color |  |
| search button size |  |
| search icon size |  |
| focus ring |  |

React mapping:

- value: `query`
- change: `setQuery`
- submit: `handleSearch`
- helper trigger: `helperOpen`, `setHelperOpen`
- helper outside click: `helperPopupRef`

### Helper Popup

| item | value |
|---|---|
| popup top/left offset |  |
| category panel width |  |
| category panel height |  |
| option panel width |  |
| option panel height |  |
| panel padding |  |
| panel background |  |
| border/radius/shadow |  |
| title font |  |
| row height |  |
| active row background |  |
| selected text color |  |
| selected check icon |  |
| inter-panel gap |  |

React mapping:

- categories: `helperCategories.map`
- selected category: `categoryKey`
- active keyboard option: `activeIndex`
- selected clues: `clues.includes(option)`
- option click: `onToggleClue(option)`
- keyboard: ArrowUp, ArrowDown, Home, End, Enter, Space

### Clue Chips

| item | value |
|---|---|
| top margin |  |
| chip height |  |
| chip padding |  |
| chip radius |  |
| chip gap |  |
| active background |  |
| active border |  |
| active text |  |
| remove icon size |  |
| reset button style |  |
| nav button size |  |

React mapping:

- chips: `clues.map`
- checked: `checkedClues.includes(clue)`
- toggle: `onToggleChecked(clue)`
- remove: `onRemove(clue)`
- reset: `onReset`
- slider: Swiper

### Recent Reports

| item | value |
|---|---|
| section top margin |  |
| title font |  |
| title bottom margin |  |
| chip height |  |
| chip padding |  |
| chip border/radius |  |
| slider gap |  |
| nav button size |  |
| nav button position |  |

React mapping:

- condition: `query.trim() === "" && searchHistory.length > 0`
- items: `searchHistory`
- click: `chooseRecent(term)`

### Recommend Slider

| item | value |
|---|---|
| section top margin |  |
| section bottom margin |  |
| title font |  |
| slides per view desktop |  |
| slides per view mobile |  |
| slide width |  |
| slide gap |  |
| nav button position |  |

React mapping:

- condition: `query.trim() === "" && searchHistory.length >= 5 && recommendedReports.length > 0`
- reports: `recommendedReports`
- selected: `selectedReports.includes(report.id)`
- toggle: `toggleReport(report.id)`

### Filter Rail

| item | value |
|---|---|
| top margin |  |
| chip height |  |
| chip gap |  |
| chip active style |  |
| more button size |  |

React mapping:

- condition: `mode === "filtered" || mode === "grouped"`
- items: `filterChips`
- selected: `activeFilters.includes(filter)`
- toggle: `toggleFilter(filter)`

### Result Header

| item | value |
|---|---|
| bottom margin |  |
| label font |  |
| count color |  |
| chat action font |  |
| chevron icon size |  |

React mapping:

- label: result context
- count: `resultCount` or group count
- show chat: grouped/filter context or group header
- click: `onChat`

### Report Card

| item | value |
|---|---|
| card height |  |
| card padding |  |
| card radius |  |
| default border |  |
| selected border |  |
| default background |  |
| selected background |  |
| title font |  |
| year font |  |
| summary font |  |
| title/year gap |  |
| summary top gap |  |
| tag list gap |  |
| tag height |  |
| tag padding/radius |  |
| active tag style |  |
| grid columns desktop |  |
| grid columns mobile |  |
| grid gap x/y |  |

React mapping:

- card list: `reports.map`
- click: `onToggle(report.id)`
- selected: `selectedReports.includes(report.id)`
- highlight: `highlightMatch(title/summary/tag, keyword)`
- schema: `itemScope`, `itemType`

### Grouped Results

| item | value |
|---|---|
| group gap |  |
| group header height |  |
| group title font |  |
| group card grid |  |
| group chat action position |  |

React mapping:

- groups: `groupedReports`
- group header: `ResultHeader`
- group grid: `ReportGrid`
- group chat: `startChatWithGroup(group.reports)`
- no frontend slicing of report ids

### Empty State

| item | value |
|---|---|
| top margin |  |
| icon size |  |
| icon bottom margin |  |
| title font |  |
| description font |  |
| suggestion chip style |  |
| suggestion gap |  |

React mapping:

- condition: `isEmptyResult`
- query display: `query || "489651"`
- suggestions: `suggestions.map`
- click: `onSuggestion(text)`
- effect: selected reports reset

### Bottom Chat CTA

| item | value |
|---|---|
| fixed area height |  |
| gradient background |  |
| button width |  |
| button height |  |
| button radius |  |
| button font |  |
| bottom padding |  |

React mapping:

- condition: `selectedReports.length > 0`
- click: `startChatWithReports(selectedReports)`
- must pass all selected ids
- no `slice(0, 2)`

## React Component Definition

### `MainSearchPage`

Visual responsibility:

- page shell
- header/title
- search form
- helper popup placement
- clue chips animation wrapper
- conditional section composition
- bottom fixed CTA

Functional responsibility:

- state owner
- search/filter/selection/chat handlers
- responsive owner
- empty result side effect

Do:

- 새 UI의 shell wrapper class를 추가할 수 있습니다.
- section width/padding/top margin을 새 UI 기준으로 조정할 수 있습니다.

Do not:

- report card markup을 `MainSearchPage`에 직접 길게 하드코딩하지 않습니다.
- 현재 handler 의미를 바꾸지 않습니다.

### `HelperMenu`

Visual responsibility:

- category panel
- option panel
- selected/focused state

Functional responsibility:

- internal category selection
- keyboard option navigation
- option click delegation

Required data-driven rendering:

```tsx
helperCategories.map(...)
activeCategory.options.map(...)
```

### `ClueChips`

Visual responsibility:

- chip slider
- checked chip style
- reset button
- prev/next buttons

Functional responsibility:

- Swiper edge state
- checked state delegation
- remove/reset delegation

### `RecentReports`

Visual responsibility:

- recent chip slider
- navigation buttons

Functional responsibility:

- Swiper edge state
- choose recent callback

### `RecommendSlider`

Visual responsibility:

- recommendation slider
- report cards inside slides

Functional responsibility:

- Swiper edge state
- report selection callback

### `ReportGrid` and `ReportCard`

Visual responsibility:

- responsive grid
- card UI
- selected state
- highlight
- tags

Functional responsibility:

- report id toggle delegation
- no API calls
- no backend assumptions

### `GroupedReportSections`

Visual responsibility:

- keyword group stack
- group header
- group report grid

Functional responsibility:

- pass group reports to `onChat`

### `EmptyState`

Visual responsibility:

- not found icon
- title/description
- suggestion chips

Functional responsibility:

- suggestion callback

## State Style Mapping

| UI state | current condition | style hook |
|---|---|---|
| narrow viewport | `viewportWidth <= 768` | compact grid and section padding |
| helper open | `helperOpen` | active filter icon, helper popup render |
| clue exists | `clues.length > 0` | clue chip wrapper visible |
| clue checked | `checkedClues.includes(clue)` | chip active style |
| filter active | `activeFilters.includes(filter)` | filter active style |
| report selected | `selectedReports.includes(report.id)` | card selected border/background |
| empty result | `isEmptyResult` | empty state visible |
| grouped result | `groupedReports.length > 0` | grouped sections visible |
| recent visible | `query.trim() === "" && searchHistory.length > 0` | recent slider visible |
| recommend visible | `query.trim() === "" && searchHistory.length >= 5 && recommendedReports.length > 0` | recommend slider visible |
| bottom CTA visible | `selectedReports.length > 0` | fixed chat bar visible |

## Asset Mapping

현재 사용 중인 icon class 또는 asset:

| purpose | current class/path |
|---|---|
| search helper/filter | `filter-icon` |
| main search submit | `main-search-blue-icon` |
| search modal submit/common search | `searchbar-search-icon` |
| chevron right | `chevron-right-slate-700` |
| chevron left | `chevron-left-slate-700` |
| chip remove | `chips-close-icon` |
| empty state | `not-file` |

새 UI가 다른 아이콘을 쓰면:

- 가능하면 `solvekdesignsystem-web/image/icon`에 추가합니다.
- 기존 icon class를 바꿀 때는 챗봇/지도/다른 검색 화면 영향 여부를 확인합니다.
- 새 icon class는 `default/icon.css` 또는 메인 전용 CSS에 명확히 추가합니다.

## Design Token Mapping

새 UI 색상은 먼저 디자인시스템 토큰으로 매핑합니다.

| visual intent | preferred token |
|---|---|
| primary blue | `var(--blue-500)` |
| light blue bg | `var(--blue-50)` |
| main text | `var(--slate-900)` |
| secondary text | `var(--slate-500)` |
| border | `var(--slate-200)` 또는 `var(--slate-300)` |
| page bg | `var(--slate-50)` |
| white bg | `#fff` 또는 `bg-white` |
| danger/API error | `var(--red-500)` |

새 UI에 토큰에 없는 색이 있으면:

- 색상값을 측정표에 기록합니다.
- 디자인시스템 토큰과 육안 차이가 작으면 토큰을 사용합니다.
- 차이가 크고 화면 복제가 중요하면 메인 전용 CSS 변수로 둡니다.

## Typography Mapping

기존 typography class를 우선 사용합니다.

예:

- `heading4-b-32`
- `heading9-sb-22`
- `body1-sb-18`
- `body1-m-18`
- `body2-sb-16`
- `body2-m-16`
- `body2-r-16`
- `body3-r-14`

새 UI가 정확히 다른 값을 쓰면:

- 새 값을 측정표에 적습니다.
- 기존 class로 맞지 않으면 메인 전용 class를 추가합니다.
- font-size를 viewport width로 스케일하지 않습니다.
- letter-spacing은 기본 `0`을 유지합니다.

## Responsive Screen Spec

현재 기준:

```ts
isNarrowViewport = viewportWidth <= 768;
```

현재 동작:

- 768px 이하에서 section 좌우 padding을 `1.6rem`으로 둡니다.
- 768px 이하에서 `ReportGrid` 카드는 1열로 내려갑니다.
- 추천 슬라이더는 1개씩 보입니다.

새 UI 기준으로 아래 표를 채웁니다.

| viewport | section | search bar | cards | sliders | bottom CTA |
|---|---|---|---|---|---|
| desktop | define from UI | define from UI | 2 columns or UI 기준 | UI 기준 | centered fixed |
| tablet | define from UI | fit viewport | define from UI | define from UI | no overlap |
| mobile | define from UI | full width | 1 column | 1 slide | no text overflow |

주의:

- 검색창 placeholder가 버튼과 겹치면 안 됩니다.
- 카드는 mobile에서 텍스트가 카드 밖으로 나가면 안 됩니다.
- 하단 CTA가 결과 카드 내용을 영구적으로 가리면 안 됩니다.

## API And Toast Notes

보고서 선택 개수는 프론트에서 임의 제한하지 않습니다.

유지 조건:

- 카드 선택은 계속 가능해야 합니다.
- `selectedReports`는 사용자가 선택한 id 전체를 보관합니다.
- 하단 `채팅하기`는 선택 id 전체를 전달합니다.
- 그룹 `채팅하기`는 그룹 report id 전체를 전달합니다.
- `slice(0, 2)`, `current.length >= 2`, `length > 2` 같은 임의 제한을 넣지 않습니다.

토스트는 채팅 세션 생성 API가 실패할 때 API 메시지 기준으로 표시합니다. 메인 UI 원본에 `최대 2건` 같은 문구가 있더라도 다시 넣지 않습니다.

## Screen QA Checklist

Visual QA:

- 새 UI 원본과 header top/spacing이 같은가
- 검색바 width/height/radius가 같은가
- 검색 도우미 팝업 위치와 panel size가 같은가
- 단서 칩 style이 같은가
- 최근 검색어 slider style이 같은가
- 추천 보고서 slider style이 같은가
- 보고서 카드 padding/radius/border/tag가 같은가
- 그룹 결과 header와 grid가 같은가
- 결과 없음 상태가 같은가
- 하단 CTA 위치와 크기가 같은가
- hover/checked/open 상태가 원본과 같은가

React QA:

- `reportData` 또는 API 결과가 map으로 렌더링되는가
- `query`, `clues`, `checkedClues`, `activeFilters`, `selectedReports`가 유지되는가
- 모든 input이 controlled state와 연결되어 있는가
- 모든 버튼이 기존 handler와 연결되어 있는가
- build가 통과하는가

Browser QA:

- desktop 기준 캡처 비교
- mobile/narrow 기준 캡처 비교
- 검색 도우미 열림/닫힘 확인
- 단서 칩 추가/활성/삭제/초기화 확인
- 최근 검색어 선택 확인
- 보고서 카드 선택 확인
- 그룹 `채팅하기` 확인
- 하단 `채팅하기` 확인
- 결과 없음 상태 확인

## Suggested Handoff Bundle

개발자에게 전달할 때는 아래를 한 번에 줍니다.

```txt
1. 새 메인 UI 원본 파일 또는 캡처
2. 현재 GHC_repo 전체
3. solvek-react/src/features/report-search/MAIN_UI_SCREEN_SPEC.md
4. solvek-react/src/features/report-search/MAIN_UI_REPLACEMENT_HANDOFF.md
5. solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md
6. solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md
```

개발 AI에게 줄 지시:

```txt
먼저 MAIN_UI_SCREEN_SPEC.md로 새 메인 UI의 화면 치수/CSS/컴포넌트 구분을 분석하고,
그 다음 MAIN_UI_REPLACEMENT_HANDOFF.md로 기존 기능 보존 계약을 확인한 뒤 구현해줘.

새 UI는 시각 기준으로 최대한 동일하게 복사하고,
현재 React의 state/handler/props/API 연결 지점은 손상하지 마.
```
