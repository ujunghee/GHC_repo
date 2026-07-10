# Chat UI Screen Spec

이 문서는 사용자가 제공한 챗봇 UI 원본 화면을 React/CSS로 복사하듯 구현하기 위한 화면 정의서입니다.

`CHAT_UI_REPLACEMENT_HANDOFF.md`가 기능 보존 계약이라면, 이 문서는 시각 구현 계약입니다.

다음 개발자 또는 AI는 새 UI 파일을 받으면 이 문서를 기준으로 화면을 분석하고, 각 값을 React 컴포넌트와 CSS에 매핑해야 합니다.

## Required Inputs

이 git을 개발자에게 그대로 넘기는 경우, 별도 캡처나 외부 디자인 파일은 필수가 아닙니다. 아래 경로의 현재 React 코드와 CSS가 챗봇 화면의 원본 UI입니다.

원본 경로:

- `solvek-react/src/features/report-chat/ChatPage.tsx`
- `solvek-react/src/features/report-chat/components/ReportChatSidePanel.tsx`
- `solvek-react/src/features/report-chat/components/ChatConversation.tsx`
- `solvek-react/src/features/report-chat/components/ChatSearchModal.tsx`
- `solvek-react/src/features/report-chat/components/SourcePanel.tsx`
- `solvek-react/src/features/report-chat/components/MapPanel.tsx`
- `solvek-react/src/features/report-chat/components/ResizeHandle.tsx`
- `solvekdesignsystem-web/css/index.css`
- `solvekdesignsystem-web/image/icon/`

외부 UI 시안을 추가로 받는 경우에만 아래 입력물을 보조 자료로 사용합니다.

- 새 챗봇 UI 원본 파일: HTML, React, Figma export, 캡처 이미지, 또는 디자인 산출물
- 기준 viewport 캡처: desktop 최소 1장
- 가능하면 narrow viewport 캡처: 1280px 이하, 1100px 이하
- 아이콘/이미지 asset 원본 또는 asset 경로
- 사용한 font family, font weight, font size 정보
- CSS가 있다면 전체 CSS 파일
- React로 나뉜 파일이 있다면 컴포넌트 파일 구조

입력물이 캡처 이미지만 있을 경우:

- 픽셀 단위의 완전 동일 구현은 어렵습니다.
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

1. `CHAT_UI_REPLACEMENT_HANDOFF.md`
2. `ChatPage.tsx`
3. 각 하위 컴포넌트 props
4. `COMPONENT_RULES.md`

즉, 시각은 새 UI가 이기고, 기능은 현재 React 계약이 이깁니다.

## File Mapping

새 UI를 React에 넣을 때 아래 파일로 나눕니다.

| screen area | React file | CSS responsibility |
|---|---|---|
| 전체 챗봇 shell | `ChatPage.tsx` | 전체 수평 레이아웃, panel open/close, right panel 영역 |
| 왼쪽 보고서 패널 | `components/ReportChatSidePanel.tsx` | 패널 배경, header, report row, checkbox, menu, resize |
| 중앙 대화 영역 | `components/ChatConversation.tsx` | header, empty state, suggestion, message list, input, attachment |
| AI 답변 근거 | `ChatConversation.tsx` 내부 `EvidenceSummary` | evidence row, source/map button, summary card, copy toast |
| 검색 모달 | `components/ChatSearchModal.tsx` | dim, modal box, search bar, helper popup, clue chips, result row |
| 오른쪽 원문 패널 | `components/SourcePanel.tsx` | similarity, title, page label, image frame |
| 오른쪽 지도 패널 | `components/MapPanel.tsx` | map canvas, controls, layer settings |
| resize handle | `components/ResizeHandle.tsx` | hover/active line, hit area |
| shared tokens/classes | `solvekdesignsystem-web/css/**` | button, search, checkbox, chip, icon, map panel |

새 UI 원본이 이미 React로 구분되어 있다면:

- 원본 컴포넌트 이름을 그대로 가져와도 됩니다.
- 단, 최종 위치는 위 파일 매핑에 맞춥니다.
- 상태 소유권은 원본 UI가 아니라 현재 `ChatPage` 기준으로 재연결합니다.

## CSS Placement Rules

기존 CSS 우선순위:

1. `solvekdesignsystem-web/css/index.css`
2. `solvekdesignsystem-web/css/component/search.css`
3. `solvekdesignsystem-web/css/component/checkbox.css`
4. `solvekdesignsystem-web/css/component/chip.css`
5. `solvekdesignsystem-web/css/component/map-panel.css`
6. 필요 시 새 챗봇 전용 CSS

현재 챗봇 관련 class가 이미 있는 곳:

| class/pattern | file | current use |
|---|---|---|
| `search-62` | `component/search.css` | 중앙 하단 채팅 입력 |
| `search-62--with-attach` | `component/search.css` | 첨부 이미지 포함 입력창 |
| `chat-compose__field` | `component/search.css` | 첨부 상태 input |
| `chat-compose__actions` | `component/search.css` | 첨부/전송 action 영역 |
| `chat-attach-preview` | `component/search.css` | 첨부 이미지 preview |
| `chat-drop-overlay` | `component/search.css` | drag/drop overlay |
| `chat-message-image` | `component/search.css` | user 첨부 이미지 메시지 |
| `search-48` | `component/search.css` | 검색 모달/지도 패널 검색창 |
| `checkbox-basic` | `component/checkbox.css` | 보고서/레이어 checkbox |
| `evidence-action` | `component/chip.css` | 원문/지도 근거 버튼 |
| `toast` | `default/component.css` | 복사 완료 toast |
| `map-panel*` | `component/map-panel.css` | 오른쪽 지도 패널 |

새 CSS를 추가해야 할 때:

- 챗봇 화면 전용 class는 `chat-*` prefix를 사용합니다.
- map 관련 class는 기존 `map-panel*`를 우선 확장합니다.
- 무의미한 `box1`, `leftArea`, `styleA` 같은 이름은 금지합니다.
- 디자인시스템에 이미 있는 버튼/checkbox/search/chip class를 새로 복제하지 않습니다.
- 기존 class를 덮어써야 하면 영향 범위를 챗봇 root class 아래로 제한합니다.

권장 새 CSS 위치:

```txt
solvekdesignsystem-web/css/component/chat-panel.css
```

단, 새 파일을 만들면 반드시 `solvekdesignsystem-web/css/index.css`에 import를 추가합니다.

```css
@import url('./component/chat-panel.css');
```

## Visual Measurement Sheet

새 UI 파일을 받으면 먼저 아래 표를 채웁니다. 이 표가 채워져야 “복사하듯” 구현할 수 있습니다.

### Viewport

| item | value |
|---|---|
| 기준 desktop width | 예: `1920px` |
| 기준 desktop height | 예: `1080px` |
| content safe area | 예: `0` 또는 좌우 padding |
| main background | 예: `#ffffff` |
| app font family | 예: `Pretendard` |

### Shell Layout

| item | value |
|---|---|
| root display | `flex` |
| root height | `100vh` |
| left panel width | 새 UI 기준값 |
| center min width | 새 UI 기준값 |
| right panel width | 새 UI 기준값 |
| left/center divider | 색/두께 |
| center/right divider | 색/두께 |

현재 기능 기본값:

```ts
panelDefaultWidth = 427;
panelMinWidth = 240;
panelMaxWidth = 560;
sourcePanelDefaultWidth = 840;
sourcePanelMinWidth = 360;
sourcePanelMaxWidth = 960;
```

새 UI가 다른 폭을 쓰면 `data.ts`의 panel width 상수를 조정해도 됩니다. 단, resize 기능은 유지합니다.

### Left Panel

| item | value |
|---|---|
| panel background |  |
| panel header height |  |
| panel horizontal padding |  |
| panel vertical padding |  |
| home button size |  |
| search button size |  |
| total row height |  |
| report list gap |  |
| report row height |  |
| report row padding |  |
| report row radius |  |
| report row default background |  |
| report row checked background |  |
| report row default border |  |
| report row checked border |  |
| report row hover background |  |
| report title font |  |
| checkbox size |  |
| row menu icon size |  |
| row menu popup size |  |
| delete action style |  |

React mapping:

- row list: `reports.map`
- checked state: `activeReportIds.includes(report.id)`
- total count: `reports.length`
- 전체 선택: `isAllChecked`, `selectAllRef`, `onToggleAll`
- 삭제: `onRemoveReport(report.id)`

### Center Header

| item | value |
|---|---|
| header height |  |
| header padding |  |
| title font |  |
| title color |  |
| count color |  |
| right panel toggle position |  |
| right panel toggle icon size |  |

React mapping:

- title: `reportTitle`
- count: `selectedCount`
- right panel toggle visibility: `hasSourceContent`
- toggle action: `toggleRightPanel`

### Conversation Body

| item | value |
|---|---|
| content max width |  |
| content top padding |  |
| empty state top padding |  |
| selected count guide font |  |
| helper title font |  |
| suggestion group width |  |
| suggestion button height |  |
| suggestion button padding |  |
| suggestion border/radius |  |
| message list gap |  |
| user bubble max width |  |
| user bubble background |  |
| user bubble radius |  |
| assistant bubble max width |  |
| assistant text font |  |

React mapping:

- empty state: `selectedCount === 0`
- suggestions: `messages.length === 0`
- messages: `messages.map`
- user/assistant split: `item.role`

### Evidence Summary

| item | value |
|---|---|
| evidence report title font |  |
| fact list gap |  |
| fact label font/color |  |
| fact value font/color |  |
| source button size |  |
| source button background/border |  |
| map button size |  |
| map button background/border |  |
| summary card padding |  |
| summary card background |  |
| summary card radius |  |
| copy icon size |  |
| copy toast position |  |

React mapping:

- facts: `answerFacts.map`
- source action: `fact.actions.includes("source")`
- map action: `fact.actions.includes("map")`
- source click: `onOpenSource`
- map click: `onOpenMap`
- copy: `handleCopySummary`

### Input Area

| item | value |
|---|---|
| form bottom padding |  |
| input max width |  |
| input height |  |
| input background |  |
| input border/radius |  |
| input horizontal padding |  |
| placeholder font/color |  |
| attach button size |  |
| send button size |  |
| icon size |  |
| attached input height |  |
| preview image size |  |
| preview remove button position |  |
| drag overlay background |  |
| drag overlay text style |  |

React mapping:

- text input value: `message`
- input change: `onMessageChange`
- submit: `handleFormSubmit`
- attach file input: `fileInputRef`
- attach preview: `attachedImage`
- drag overlay: `isDragging && canAttach`

### Search Modal

| item | value |
|---|---|
| overlay background |  |
| modal width |  |
| modal max height |  |
| modal padding |  |
| modal radius |  |
| modal shadow |  |
| search bar height |  |
| search bar padding |  |
| helper dropdown position |  |
| clue chip area margin |  |
| result area height |  |
| result row height |  |
| result row padding |  |
| result row radius |  |
| checked row border/background |  |
| empty state alignment |  |

React mapping:

- modal open: `isSearchOpen`
- close: `onClose`
- query: `searchQuery`
- helper: `searchHelperOpen`
- helper ref: `helperPopupRef`
- result ref: `resultListRef`
- general result: `searchedReports.map`
- grouped result: `groupedSearchReports.map`
- row checked: `activeReportIds.includes(report.id)`
- row toggle: `onToggleReport(report.id)`

### Right Source Panel

| item | value |
|---|---|
| panel background |  |
| panel padding |  |
| similarity row gap |  |
| similarity badge size |  |
| title font |  |
| title separator style |  |
| image frame margin top |  |
| image frame border/radius |  |
| image frame background |  |
| placeholder font/color |  |

React mapping:

- panel visibility: `rightPanelMode === "source"`
- title: `activeSourceTitle`
- similarity: `sourceDocument.similarityScore`
- page label: `sourceDocument.pageLabel`
- image: `sourceDocument.pageImageUrl`

### Right Map Panel

| item | value |
|---|---|
| map background |  |
| map viewport padding |  |
| map controls position |  |
| map type control position |  |
| settings panel width |  |
| layer row height |  |
| active layer chip style |  |

React mapping:

- panel visibility: `rightPanelMode === "map"`
- keep `MapPanel` layer tree functionality
- keep `MAX_ACTIVE_LAYERS = 5`

## React Component Definition

새 UI를 분해할 때 아래 단위로 생각합니다.

### `ChatPage`

Visual responsibility:

- 전체 3-column shell
- 왼쪽 panel open/collapse 영역
- 오른쪽 panel open/collapse 영역
- 오른쪽 상단 layout toggle position

Functional responsibility:

- state owner
- handler owner
- responsive owner
- resize owner

Do:

- 새 UI의 shell wrapper class를 추가할 수 있습니다.
- panel width 상수는 새 UI 기준에 맞게 조정할 수 있습니다.

Do not:

- 하위 row/message/modal markup을 모두 `ChatPage`로 끌어올리지 않습니다.

### `ReportChatSidePanel`

Visual responsibility:

- left panel header
- home/search controls
- total + select all row
- report item row
- row action menu
- right resize handle

Functional responsibility:

- props render
- callback call

Required data-driven rendering:

```tsx
reports.map((report) => ...)
activeReportIds.includes(report.id)
```

### `ChatConversation`

Visual responsibility:

- center header
- selected count guide
- empty selected state
- suggestion buttons
- message list
- evidence summary
- bottom composer
- drag/drop overlay
- attachment preview

Functional responsibility:

- file selection
- drag/drop
- local attached image state
- form submit
- copy toast

Required data-driven rendering:

```tsx
messages.map((item) => ...)
suggestionLabels.map((label) => ...)
answerFacts.map((fact) => ...)
```

### `ChatSearchModal`

Visual responsibility:

- overlay
- modal box
- search bar
- helper popup
- clue chips
- empty state
- grouped/general result rows

Functional responsibility:

- event delegation through props
- stop overlay close inside modal

Required data-driven rendering:

```tsx
searchedReports.map((report) => ...)
groupedSearchReports.map((group) => ...)
```

### `SourcePanel`

Visual responsibility:

- source header
- similarity badge
- page title
- image/placeholder frame

Functional responsibility:

- embedded/non-embedded rendering support
- resize handle support when non-embedded

### `MapPanel`

Visual responsibility:

- map viewport
- map type controls
- layer settings
- active layer display

Functional responsibility:

- layer checkbox tree
- active layer max count
- advanced tab

## CSS Extraction Workflow

새 UI 파일을 받으면 아래 순서로 CSS를 옮깁니다.

1. 전체 CSS에서 reset/global 스타일을 분리합니다.
2. 이미 디자인시스템에 있는 스타일과 중복되는 것을 제거합니다.
3. button/search/checkbox/chip은 디자인시스템 class로 먼저 표현합니다.
4. 새 UI 고유 layout만 `chat-*` class로 만듭니다.
5. width/height/padding/radius/color/font를 이 문서의 측정표에 기록합니다.
6. React JSX에 className을 붙입니다.
7. 상태별 class를 정리합니다: default, hover, active, checked, disabled, open, resizing.
8. responsive rule을 정리합니다.

상태 class 네이밍 권장:

```css
.chat-shell {}
.chat-shell--compact {}
.chat-report-panel {}
.chat-report-panel__header {}
.chat-report-row {}
.chat-report-row--active {}
.chat-report-row--hovered {}
.chat-conversation {}
.chat-conversation__header {}
.chat-message {}
.chat-message--user {}
.chat-message--assistant {}
.chat-composer {}
.chat-search-modal {}
.chat-source-panel {}
```

기존 class와 병행 예:

```tsx
<div className="chat-composer search-62 flex align-center px-16 bg-white gap-8">
```

## State Style Mapping

| UI state | current condition | style hook |
|---|---|---|
| left panel open | `isPanelOpen` | shell/panel open style |
| left panel resizing | `isPanelResizing` | resize transition duration 0 |
| left resize hover | `isPanelResizeHover` | handle thick line |
| report row checked | `activeReportIds.includes(report.id)` | checked border/background |
| all checked | `isAllChecked` | checkbox checked |
| partially checked | `selectAllRef.current.indeterminate` | checkbox indeterminate |
| search modal open | `isSearchOpen` | modal render |
| search helper open | `searchHelperOpen` | helper dropdown render |
| source panel open | `rightPanelMode === "source"` | source panel visible |
| map panel open | `rightPanelMode === "map"` | map panel visible |
| right panel resizing | `isSourcePanelResizing` | resize transition duration 0 |
| message empty | `messages.length === 0` | suggestion visible |
| selected empty | `selectedCount === 0` | empty selected state |
| attachment exists | `attachedImage !== null` | preview composer |
| dragging file | `isDragging && canAttach` | drop overlay |
| evidence exists | `hasSourceContent` | right panel toggle visible |

## Asset Mapping

현재 사용 중인 icon class 또는 asset:

| purpose | current class/path |
|---|---|
| home | `home-icon` |
| search | `search-icon-40`, `searchbar-search-icon` |
| filter | `filter-icon` |
| file attach | `file-attach-icon` |
| close/remove | `chips-close-icon` |
| right layout toggle | `layout-right-active-icon`, `layout-right-inactive-icon` |
| panel expand | `chevron-right-slate-700` |
| row menu | `./image/icon/details-vertical-stroke.svg` |
| copy | `copy-icon` |

새 UI가 다른 아이콘을 쓰면:

- 가능하면 `solvekdesignsystem-web/image/icon`에 추가합니다.
- 기존 icon class를 바꿀 때는 다른 화면 영향 여부를 확인합니다.
- 새 아이콘 class는 `default/icon.css` 또는 챗봇 전용 CSS에 명확히 추가합니다.

## Design Token Mapping

새 UI 색상은 먼저 디자인시스템 토큰으로 매핑합니다.

| visual intent | preferred token |
|---|---|
| primary blue | `var(--blue-500)` |
| light blue bg | `var(--blue-50)` |
| main text | `var(--slate-900)` |
| secondary text | `var(--slate-500)` |
| border | `var(--slate-200)` 또는 `var(--slate-300)` |
| panel bg | `var(--slate-50)` 또는 새 UI 값 |
| white bg | `#fff` 또는 `bg-white` |
| danger | `var(--red-500)` |

새 UI에 토큰에 없는 색이 있으면:

- 색상값을 측정표에 기록합니다.
- 디자인시스템 토큰과 육안 차이가 작으면 토큰을 사용합니다.
- 차이가 크고 화면 복제가 중요하면 챗봇 전용 CSS 변수로 둡니다.

예:

```css
.chat-shell {
  --chat-panel-bg: #f8fafc;
}
```

## Typography Mapping

챗봇 화면의 텍스트는 최소 13px, 최대 16px 범위 안에서 기존 typography class를 우선 사용합니다.

예:

- `body2-sb-16`
- `body2-m-16`
- `body2-r-16`
- `body3-sb-14`
- `body3-r-14`
- `body4-r-13`

새 UI가 정확히 다른 값을 쓰면:

- 새 값을 측정표에 적습니다.
- 16px를 초과하거나 13px보다 작은 텍스트를 추가하지 않습니다.

## Resize Minimum

오른쪽 원문/지도 패널을 resize 하더라도 중앙 챗봇 영역은 최소 480px을 확보합니다.

- `sourcePanelReservedChatWidth = 480`
- 유사후보 카드는 56rem을 최대 폭으로 사용합니다.
- 화면이 좁아지면 후보 카드 내부 썸네일과 텍스트 영역은 `flex-wrap`으로 줄바꿈되어 텍스트가 깨지지 않아야 합니다.
- 기존 class로 맞지 않으면 챗봇 전용 class를 추가합니다.
- font-size를 viewport width로 스케일하지 않습니다.
- letter-spacing은 기본 `0`을 유지합니다.

## Responsive Screen Spec

현재 기능 breakpoint:

```ts
isChatCompact = viewportWidth <= 1100;
shouldPreferConversation = viewportWidth <= 1280;
```

새 UI 기준으로 아래 표를 채웁니다.

| viewport | left panel | center | right panel | search modal |
|---|---|---|---|---|
| `> 1280px` | visible/resizable | full | evidence after answer | centered modal |
| `1101px - 1280px` | visible unless collapsed | priority | closed by default | centered modal |
| `<= 1100px` | closed/overlay or hidden | full | closed | viewport-fit modal |
| mobile | define from UI | define from UI | hidden/drawer | full or near full |

주의:

- 새 UI가 mobile을 제공하지 않아도 텍스트/버튼 겹침은 없어야 합니다.
- 하단 입력창은 항상 화면 안에 보여야 합니다.
- 검색 모달은 viewport height를 넘으면 내부 scroll이어야 합니다.

## Screen QA Checklist

Visual QA:

- 새 UI 원본과 좌측 패널 폭이 같은가
- header 높이와 버튼 위치가 같은가
- 중앙 대화 max width가 같은가
- 하단 입력창 위치와 높이가 같은가
- 메시지 bubble radius와 padding이 같은가
- 검색 모달 width/radius/padding이 같은가
- 오른쪽 패널 폭과 구분선이 같은가
- 아이콘 크기와 위치가 같은가
- 색상과 typography가 원본과 같은가
- hover/checked/open 상태가 원본과 같은가

React QA:

- `reports.map`, `messages.map`, `searchedReports.map`, `groupedSearchReports.map`가 유지되는가
- 모든 input이 controlled state와 연결되어 있는가
- 모든 버튼이 기존 handler와 연결되어 있는가
- class만 바꾸고 기능 callback을 누락하지 않았는가
- build가 통과하는가

Browser QA:

- desktop 기준 캡처 비교
- 1280px 기준 캡처 비교
- 1100px 이하 기준 캡처 비교
- 메시지 추가 후 오른쪽 패널 토글 확인
- 검색 모달 열림/닫힘 확인
- resize 확인
- 첨부 preview 확인

## Suggested Handoff Bundle

개발자에게 전달할 때는 아래를 한 번에 줍니다.

```txt
1. 새 챗봇 UI 원본 파일 또는 캡처
2. 현재 GHC_repo 전체
3. solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md
4. solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md
5. solvek-react/src/features/report-chat/README.md
6. solvek-react/src/features/report-chat/COMPONENT_RULES.md
```

개발 AI에게 줄 지시:

```txt
먼저 CHAT_UI_SCREEN_SPEC.md로 새 UI의 화면 치수/CSS/컴포넌트 구분을 분석하고,
그 다음 CHAT_UI_REPLACEMENT_HANDOFF.md로 기존 기능 보존 계약을 확인한 뒤 구현해줘.

새 UI는 시각 기준으로 최대한 동일하게 복사하고,
현재 React의 state/handler/props/API 연결 지점은 손상하지 마.
```
