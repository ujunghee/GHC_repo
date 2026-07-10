# 메인 검색 화면 최종 구현 명세

> Deprecated: 이 문서는 구버전 참고용입니다.
> 과거 `최대 2건` 선택 제한과 선택 제한 토스트 규칙이 남아 있으므로 최신 구현 기준으로 사용하지 않습니다.
> 최신 기준은 저장소 루트의 `UI_SOURCE_OF_TRUTH.md`, `MAIN_UI_SCREEN_SPEC.md`, `MAIN_UI_REPLACEMENT_HANDOFF.md`, `MAIN_SCREEN_SPEC.md`, `PROTOTYPE_FLOW.md`, `COMPONENT_RULES.md`입니다.
> 보고서 선택 개수는 프론트에서 임의 제한하지 않고, 채팅 세션 생성 API 응답 기준으로 처리합니다.

이 문서는 발굴보고서 메인 검색 화면의 과거 구현 흐름을 보존한 참고 문서이다.
AI 또는 개발자가 새로 구현할 때는 위 Deprecated 안내에 적힌 최신 문서를 기준으로 사용한다.

관련 파일:

- `solvek-react/src/features/report-search/MainSearchPage.tsx`
- `solvek-react/src/features/report-search/components/ReportSearchSections.tsx`
- `solvek-react/src/features/report-search/data.ts`
- `solvek-react/src/features/report-search/types.ts`
- `solvek-react/src/features/report-search/motionConfig.ts`
- `solvekdesignsystem-web/css/component/search.css`
- `solvekdesignsystem-web/css/default/responsive.css`
- `solvekdesignsystem-web/css/index.css`

## 1. 화면 목적

메인 검색 화면은 사용자가 발굴보고서를 검색하고, 검색 도우미에서 단서를 추가하고, 선택한 보고서 전체로 챗봇 화면에 진입하는 첫 화면이다.

사용자가 할 수 있어야 하는 일:

- 검색어를 입력한다.
- 검색 버튼을 눌러 결과가 있는 검색어만 최근 검색어로 저장한다.
- 검색 도우미 팝업에서 `지역`, `소재지`, `시대` 단서를 추가한다.
- 추가한 단서 칩을 활성화하거나 비활성화해서 그룹 결과를 본다.
- 단서 칩을 개별 삭제하거나 전체 초기화한다.
- 최근 검색어 칩을 눌러 다시 검색한다.
- 최근 검색어가 충분할 때 추천 보고서를 확인한다.
- 보고서 카드를 개수 제한 없이 선택한다.
- 선택한 보고서가 있을 때 하단 fixed `채팅하기` CTA로 챗봇에 진입한다.
- 결과가 없을 때 빈 상태와 추천 검색어를 본다.

## 2. 전체 화면 구조

최상위 구조는 아래 형태를 유지한다.

```tsx
<main className="bg-slate-50 h-screen overflow-auto">
  <Toast />
  <section className="mb-default mt-140 pb-80" aria-label="발굴보고서 검색">
    <Header />
    <SearchForm />
    <ClueChipsArea />
    <ResultArea />
  </section>
  <BottomChatCta />
</main>
```

중요한 레이아웃 규칙:

- `main`은 `h-screen overflow-auto`를 유지한다.
- `section`은 기본적으로 `mb-default mt-140 pb-80`을 사용한다.
- `default/responsive.css`에서 `.mb-default`, `.inner-default`는 `margin: 0 auto`를 쓰지 않는다.
- 위 클래스는 `margin-left: auto; margin-right: auto;`만 가져야 하며, `mt-140` 같은 margin utility를 덮으면 안 된다.
- 모바일 또는 좁은 화면에서는 `section`에 인라인으로 `paddingLeft: "1.6rem"`, `paddingRight: "1.6rem"`을 준다.
- 하단 CTA가 fixed로 떠 있으므로 `section`에는 `pb-80`이 필요하다.

## 3. 상태 모델

`MainSearchPage`는 아래 상태를 직접 관리한다.

```ts
type ViewMode = "default" | "history" | "filtered" | "grouped" | "empty" | "recommend";

type MainSearchPageState = {
  viewportWidth: number;
  query: string;
  mode: ViewMode;
  searchHistory: string[];
  helperOpen: boolean;
  activeFilters: string[];
  clues: string[];
  checkedClues: string[];
  selectedReports: number[];
  toastVisible: boolean;
};
```

초기값:

```ts
viewportWidth = typeof window === "undefined" ? 1440 : window.innerWidth;
query = "";
mode = "default";
searchHistory = [];
helperOpen = false;
activeFilters = [];
clues = [];
checkedClues = [];
selectedReports = [];
toastVisible = false;
```

반응형 기준:

```ts
const isNarrowViewport = viewportWidth <= 768;
```

`resize` 이벤트로 `viewportWidth`를 갱신한다.

```ts
useEffect(() => {
  const handleResize = () => setViewportWidth(window.innerWidth);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

## 4. 검색바 UI

검색 폼 구조:

```tsx
<form className="main-search-wrapper relative" onSubmit={handleSearch}>
  <div className="main-search-62 flex align-center gap-8 px-12">
    <button className="filter-tooltip-trigger ..." />
    <input className="main-search__input body2-r-16 flex-1" />
    <button className="search-button h-fit" />
  </div>
  <HelperPopup />
</form>
```

검색 input:

- `id="report-search"`
- `type="search"`
- `className="main-search__input body2-r-16 flex-1"`
- `aria-label="발굴보고서 검색어"`
- `autoComplete="off"`

현재 placeholder:

```txt
“함안의 있는 토기 가마 보고서”, “대청댐 주변 유적발굴” 등 찾고 싶은 발굴보고서를 작성해보세요.
```

검색바 포커스 섀도우:

- 클릭 순간에 한 번 재생되고 사라지는 키프레임 애니메이션을 쓰지 않는다.
- 포커스된 동안 유지되는 `:focus-within` 상태 스타일로 처리한다.
- 그림자는 넓게 퍼지되 과하게 튀지 않아야 한다.
- `prefers-reduced-motion: reduce`에서는 transition을 제거한다.

현재 CSS:

```css
.main-search-wrapper {
  width: 100%;
  padding: 0.2rem;
  border-radius: var(--radius-md-8);
  background: linear-gradient(90deg, var(--green-500), var(--blue-500));
  background-size: 200% 100%;
  background-position: 0% 50%;
  box-shadow: 0 0 0 rgba(26, 118, 255, 0);
  transition: box-shadow 0.32s ease, background-position 0.32s ease;
}

.main-search-wrapper:focus-within {
  background-position: 50% 50%;
  box-shadow: 0 1.2rem 2.8rem rgba(26, 118, 255, 0.10), 0 0 0 0.45rem rgba(34, 197, 94, 0.075);
}
```

## 5. 검색 이벤트

검색 submit:

```ts
const handleSearch = (event?: FormEvent) => {
  event?.preventDefault();
  const nextQuery = query.trim();

  if (nextQuery) {
    const keyword = nextQuery.toLowerCase();
    const hasResults = reportData.some(
      report =>
        report.title.toLowerCase().includes(keyword) ||
        report.summary.toLowerCase().includes(keyword) ||
        report.tags.some(tag => tag.toLowerCase().includes(keyword))
    );

    if (hasResults) {
      setSearchHistory(current =>
        [nextQuery, ...current.filter(item => item !== nextQuery)].slice(0, 5)
      );
    }
  }

  setMode(nextQuery ? "history" : "default");
};
```

검색어 입력:

```ts
onChange={(event) => {
  setQuery(event.target.value);
  if (event.target.value.trim() && event.target.value.trim() !== "489651") {
    setMode("history");
  }
}}
```

주의:

- 입력할 때 결과 영역 위치 이동에 `LayoutGroup`, `layout="position"`을 걸지 않는다.
- 사용자가 아래로 스크롤한 상태에서 검색어를 입력해도 결과 콘텐츠가 검색바와 겹치며 위에서 아래로 내려오는 애니메이션이 없어야 한다.
- 검색 결과 카드 자체의 fade-in 정도는 허용하지만, 메인 결과 영역 전체의 위치 보간은 금지한다.

## 6. 검색 결과 계산

`shownReports`:

```ts
const keyword = query.trim().toLowerCase();

if (keyword) {
  return reportData.filter(
    report =>
      report.title.toLowerCase().includes(keyword) ||
      report.summary.toLowerCase().includes(keyword) ||
      report.tags.some(tag => tag.toLowerCase().includes(keyword))
  );
}

if (mode === "filtered" || mode === "grouped") {
  return reportData.slice(0, 6);
}

return reportData;
```

`activeGroupKeywords`:

```ts
const activeGroupKeywords = checkedClues.length > 0 ? checkedClues : activeFilters;
```

우선순위:

1. `checkedClues`
2. `activeFilters`

`groupedReports`:

- 활성 키워드가 없으면 빈 배열이다.
- 기본 검색 대상은 `shownReports`다.
- `shownReports`가 비어 있으면 `reportData`를 fallback으로 사용한다.
- 각 키워드별로 `title`, `summary`, `tags`에서 매칭한다.
- 매칭 결과가 있으면 그 결과 중 최대 3건을 쓴다.
- 매칭 결과가 없으면 fallback 목록 중 최대 3건을 쓴다.

`recommendedReports`:

- `searchHistory`를 공백 기준으로 나누어 키워드를 만든다.
- 길이 1 이하 단어는 제외한다.
- 로마 숫자 패턴 `/^[IVXⅠ-Ⅻ]+$/`은 제외한다.
- 중복 키워드는 제거한다.
- 보고서 `title`, `summary`, `tags`에 키워드가 포함되면 추천 대상이다.
- 최대 8건까지 표시한다.

빈 상태:

```ts
const isEmptyResult = mode === "empty" || (query.trim() !== "" && shownReports.length === 0);
```

빈 상태 진입 시 선택 보고서와 토스트를 초기화한다.

## 7. 검색 도우미 팝업

컴포넌트: `HelperMenu`

역할:

- 검색바 왼쪽 필터 아이콘 버튼을 누르면 열린다.
- 왼쪽 패널에는 카테고리 목록이 있다.
- 카테고리를 누르면 오른쪽 패널에 옵션 listbox가 열린다.
- 옵션을 누르면 단서가 추가되거나 제거된다.

trigger 버튼:

- `aria-label="검색 도우미"`
- `aria-haspopup="dialog"`
- `aria-expanded={helperOpen}`
- `aria-controls="helper-popup"`
- `data-filter-trigger`

팝업:

- `id="helper-popup"`
- `role="dialog"`
- `aria-label="검색 도우미 단서 추가"`
- `className="map-search-dropdown align-start z-index-10"`
- 바깥 클릭 시 닫힌다.
- trigger 버튼 클릭은 바깥 클릭으로 취급하지 않는다.

`HelperMenu` wrapper:

```tsx
<div
  className="flex flex-row gap-6"
  style={{ flexWrap: "wrap", maxWidth: "calc(100vw - 3.2rem)" }}
>
```

패널 공통:

- `bg-white radius-md-8 shadow-lg border border-slate-300 p-16`
- 높이 `18.8rem`
- 너비 `min(20rem, 100%)`
- 좁은 화면에서 줄바꿈 가능

카테고리 패널:

- 제목: `어떤 단서를 추가할까요?`
- 카테고리 버튼 높이 `3.6rem`
- 활성 카테고리는 `bg-slate-50`
- 선택된 옵션 개수가 있으면 label 옆에 blue count 표시

상세 옵션 패널:

- 카테고리를 선택했을 때만 표시
- `role="listbox"`
- `aria-multiselectable="true"`
- `tabIndex={0}`
- `aria-activedescendant={`helper-option-${activeIndex}`}`
- 옵션은 `role="option"`과 `aria-selected={selected}`를 가진다.

키보드:

- `ArrowDown`: 다음 옵션
- `ArrowUp`: 이전 옵션
- `Home`: 첫 옵션
- `End`: 마지막 옵션
- `Enter`: 현재 옵션 선택/해제
- `Space`: 현재 옵션 선택/해제

## 8. 단서 칩 Swiper

컴포넌트: `ClueChips`

Props:

```ts
type ClueChipsProps = {
  clues: string[];
  checkedClues: string[];
  onToggleChecked: (value: string) => void;
  onRemove?: (value: string) => void;
  onReset?: () => void;
  showNavigation?: boolean;
  className?: string;
};
```

기본값:

```ts
showNavigation = true;
className = "mt-16";
```

표시 조건:

```ts
clues.length > 0
```

단서 영역 자체는 height/opacity/y 애니메이션으로 열리고 닫힌다. 단, 결과 영역 위치 보간은 절대 걸지 않는다.

중요:

- 단서 wrapper에는 `layout` prop을 넣지 않는다.
- 결과 영역 부모에는 `LayoutGroup`을 쓰지 않는다.
- 결과 영역 위치 이동에는 `layout="position"`을 쓰지 않는다.

Swiper 설정:

```tsx
<Swiper
  modules={[Navigation]}
  slidesPerView="auto"
  spaceBetween={8}
  grabCursor
  onSwiper={...}
  onSlideChange={...}
  onResize={...}
  onReachBeginning={() => setIsBeginning(true)}
  onReachEnd={() => setIsEnd(true)}
>
```

칩 영역 wrapper:

```tsx
<div className={`relative flex align-center gap-24 ${className}`} aria-label="선택한 단서">
  <div
    className="relative flex-1"
    style={{
      minWidth: 0,
      paddingLeft: showNavigation && !isBeginning ? "4.4rem" : 0,
      paddingRight: showNavigation && !isEnd ? "4.4rem" : 0,
      boxSizing: "border-box",
    }}
  >
```

Arrow 버튼 규칙:

- 공통 스타일은 `sliderNavButtonStyle`을 사용한다.
- 버튼 크기는 반드시 `3.6rem x 3.6rem`이다.
- `top: calc(50% - 1.8rem)`을 사용한다.
- 왼쪽 arrow는 `left: 0`
- 오른쪽 arrow는 `right: 0`
- 왼쪽 arrow는 `!isBeginning`일 때만 표시한다.
- 오른쪽 arrow는 `!isEnd`일 때만 표시한다.
- arrow가 보이는 방향에만 `4.4rem` padding을 둔다.
- 시작 지점에서는 왼쪽 padding을 없앤다.
- 끝 지점에서는 오른쪽 padding을 없앤다.
- 칩과 버튼이 겹치면 안 된다.
- arrow가 컨테이너 밖으로 잘리면 안 된다.
- 칩이 적을 때 앞뒤가 불필요하게 띄워져 보이면 안 된다.

현재 arrow style:

```ts
const sliderNavButtonStyle = {
  position: "absolute" as const,
  top: "calc(50% - 1.8rem)",
  width: "3.6rem",
  height: "3.6rem",
  border: "1px solid var(--slate-200)",
  cursor: "pointer",
  zIndex: 2,
};
```

칩 UI:

- label class: `checkbox-chip-label body2-r-16`
- input class: `checkbox-chip`
- 텍스트 span class: `body2-m-16`
- X 버튼 class: `transparent-button-28 flex align-center justify-center ml-6`
- X 버튼 실제 크기: `2rem x 2rem`
- X 버튼은 `event.preventDefault()`와 `event.stopPropagation()`을 호출한 뒤 `onRemove(clue)`를 실행한다.

초기화 버튼:

- class: `chip border-slate-500 border h-36 w-fit px-12 radius-full flex align-center justify-center bg-white flex-none`
- `aria-label="선택한 단서 초기화"`
- 텍스트: `초기화`

## 9. 최근 검색어와 추천 보고서

최근 검색어 표시 조건:

```ts
query.trim() === "" && searchHistory.length > 0
```

최근 검색어 선택:

```ts
const chooseRecent = (term: string) => {
  setQuery(term);
  setMode("history");
  setSelectedReports([]);
};
```

최근 검색어 Swiper:

- `slidesPerView="auto"`
- `spaceBetween={8}`
- arrow는 `left: "-2rem"`, `right: "-2rem"`을 쓴다.
- 최근 검색어 칩에는 `↗` 문자를 붙인다.

추천 보고서 표시 조건:

```ts
query.trim() === "" && searchHistory.length >= 5 && recommendedReports.length > 0
```

`RecommendSlider` Props:

```ts
type RecommendSliderProps = {
  reports: Report[];
  selectedReports: number[];
  onToggle: (id: number) => void;
  keyword: string;
  compact?: boolean;
};
```

반응형:

```tsx
slidesPerView={compact ? 1 : 2}
style={{ width: compact ? "100%" : "30rem", height: "auto" }}
```

## 10. 결과 헤더, 카드, 그리드

`ResultHeader` Props:

```ts
{
  label: string;
  count: number;
  showChat?: boolean;
  onChat?: () => void;
}
```

UI:

- 왼쪽: `{label} {count} 건`
- count는 `color-blue-500`
- `showChat`이 true면 오른쪽에 `채팅하기` 텍스트 버튼과 chevron icon을 보여준다.

`ReportCard`:

- `<motion.a href="#">`로 렌더링한다.
- 클릭 시 `event.preventDefault()` 후 `onToggle(report.id)`를 호출한다.
- `aria-pressed={selected}`를 가진다.
- `itemScope`, `itemType="https://schema.org/Dataset"`을 가진다.
- 제목 h3에는 `itemProp="name"`을 준다.

선택 스타일:

```ts
selected
  ? "border border-blue-500 radius-md-8 p-16 flex flex-col bg-white gap-16 h-full"
  : "border border-slate-200 radius-md-8 p-16 flex flex-col bg-white gap-16 h-full"
```

`ReportGrid` Props:

```ts
type ReportGridProps = {
  reports: Report[];
  selectedReports: number[];
  onToggle: (id: number) => void;
  keyword: string;
  compact?: boolean;
};
```

grid:

```tsx
<ul className="grid-column-sub-8 gap-y-20">
  <motion.li className={compact ? "grid-column-8" : "grid-column-4"} />
</ul>
```

반응형:

- 데스크톱: `grid-column-4`, 2열 카드
- 모바일 compact: `grid-column-8`, 1열 카드

## 11. 그룹 결과

`GroupedReportSections` Props:

```ts
type GroupedReportSectionsProps = {
  groups: { label: string; reports: Report[] }[];
  selectedReports: number[];
  onToggle: (id: number) => void;
  onChat?: (reports: Report[]) => void;
  keyword: string;
  compact?: boolean;
};
```

규칙:

- wrapper class: `flex flex-col gap-24`
- 각 그룹은 `aria-label={`${group.label} 보고서 그룹`}`를 가진다.
- 그룹 헤더에는 `ResultHeader showChat`을 사용한다.
- 그룹별 보고서는 `ReportGrid`에 `compact`를 그대로 전달한다.

그룹 채팅:

```ts
const startChatWithGroup = (reports: Report[]) => {
  const groupReportIds = reports.map(report => report.id);
  if (groupReportIds.length === 0) return;

  onStartChat?.(groupReportIds);
};
```

그룹에 포함된 report id 전체를 채팅 시작 흐름으로 전달한다. 채팅 시작 실패 사유는 API 응답 메시지를 기준으로 토스트 처리한다.

## 12. 보고서 선택과 하단 CTA

보고서 선택:

```ts
const toggleReport = (id: number) => {
  setSelectedReports(current => {
    if (current.includes(id)) {
      return current.filter(item => item !== id);
    }
    return [...current, id];
  });
};
```

선택 규칙:

- 프론트에서 선택 개수를 임의 제한하지 않는다.
- 선택 가능한 최대 보고서 수는 채팅 세션 생성 API가 판단한다.
- API가 실패하면 응답 메시지를 토스트로 표시한다.

하단 CTA 표시 조건:

```ts
selectedReports.length > 0
```

CTA:

- fixed bottom
- class: `fixed bottom-0 left-0 w-full flex justify-center z-index-6`
- button class: `blue-button-48 w-300`
- 버튼 텍스트: `채팅하기`
- 배경 gradient: `linear-gradient(to top, var(--slate-50) 9.6rem, transparent)`

채팅 진입:

```ts
const startChatWithReports = (reportIds: number[]) => {
  if (reportIds.length === 0) return;
  onStartChat?.(reportIds);
};
```

## 13. 빈 상태와 토스트

빈 상태 표시 조건:

```ts
isEmptyResult === true
```

구성:

- icon: `not-file`
- heading: `“{query || "489651"}” 를 찾을 수 없습니다`
- 설명: `아래에 항목과 비슷한 보고서를 찾고 계시나요?`
- 추천 검색어 버튼 목록

추천 검색어 클릭:

```ts
onSuggestion={(text) => {
  setQuery(text);
  setMode("history");
}}
```

빈 상태에서는 최근 검색어, 추천 보고서, 필터 레일, 일반 결과, 그룹 결과, 하단 CTA를 보여주지 않는다.

토스트:

- 문구: 채팅 세션 생성 API가 반환한 사용자 표시용 메시지
- class: `toast active bg-red-50 radius-md-8 shadow-lg px-20 py-12 flex align-center gap-8 z-index-10`
- `role="status"`
- icon class: `toast-icon`
- text class: `body1-sb-18 color-red-500`
- style: `top: "3.2rem", left: "50%", visibility: "visible", transition: "none"`

## 14. Motion 설정

공통 motion config:

```ts
export const springSnappy = { type: "spring" as const, stiffness: 300, damping: 32 };
export const springSoft = { type: "spring" as const, stiffness: 240, damping: 30 };
export const fadeEase = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const };
export const tapScale = {
  whileTap: { scale: 0.98 },
  transition: { type: "spring" as const, stiffness: 320, damping: 28 },
};
```

허용되는 animation:

- 검색 도우미 팝업 열림/닫힘
- 검색 도우미 상세 패널 전환
- 단서 칩 영역의 height/opacity/y 열림/닫힘
- 카드 fade-in
- 카드 선택 borderColor
- 버튼 tap scale
- 토스트
- 하단 CTA 진입/퇴장

금지되는 animation:

- 메인 결과 영역 전체에 `LayoutGroup`
- 결과 영역 wrapper에 `layout`
- 결과 영역 wrapper에 `layout="position"`
- 검색어 입력 시 스크롤 위치에서 콘텐츠가 검색바와 겹치며 내려오는 위치 보간
- 검색바 포커스 효과를 일회성 keyframes로 재생 후 사라지게 하는 방식

## 15. 반응형 규칙

메인 검색 화면:

```ts
const isNarrowViewport = viewportWidth <= 768;
```

좁은 화면 적용:

- section 좌우 padding `1.6rem`
- `RecommendSlider compact={isNarrowViewport}`
- `ReportGrid compact={isNarrowViewport}`
- `GroupedReportSections compact={isNarrowViewport}`

컴포넌트별 compact:

- `RecommendSlider`: `slidesPerView={1}`, slide width `100%`
- `ReportGrid`: `grid-column-8`
- 그룹 결과도 내부 `ReportGrid`에 compact 전달

디자인 시스템 responsive:

- `solvekdesignsystem-web/css/index.css`에서 `default/responsive.css`는 가장 마지막에 import되어야 한다.
- tablet/mobile font override와 margin 보정이 다른 컴포넌트 CSS보다 우선해야 한다.
- 클래스명은 그대로 두고 media query에서 같은 클래스의 `font-size`만 낮춘다.
- 예: `.body1-m-18`은 tablet에서 `1.6rem`, mobile에서 `1.4rem`처럼 내려간다.

margin 보정:

```css
.inner-default,
.mb-default {
  margin-left: auto;
  margin-right: auto;
}
```

아래처럼 쓰면 안 된다.

```css
margin: 0 auto;
```

이렇게 쓰면 `mt-140` 같은 margin-top utility가 덮인다.

## 16. 접근성

검색바:

- input은 `aria-label="발굴보고서 검색어"`
- 검색 도우미 버튼은 `aria-label="검색 도우미"`
- 검색 도우미 버튼은 `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`를 가진다.
- 검색 버튼은 `aria-label="검색"`을 가진다.

검색 도우미:

- 팝업은 `role="dialog"`를 가진다.
- 옵션 목록은 `role="listbox"`를 가진다.
- 옵션 목록은 `aria-multiselectable="true"`를 가진다.
- 옵션은 `role="option"`을 가진다.
- 옵션 선택 상태는 `aria-selected`로 표시한다.
- 키보드 활성 대상은 `aria-activedescendant`로 연결한다.

단서 칩:

- wrapper는 `aria-label="선택한 단서"`를 가진다.
- checkbox input은 `aria-label={clue}`를 가진다.
- 삭제 버튼은 `aria-label={`${clue} 삭제`}`를 가진다.
- 초기화 버튼은 `aria-label="선택한 단서 초기화"`를 가진다.

Swiper arrow:

- 단서: `이전 단서`, `다음 단서`
- 최근 검색: `이전 최근 검색`, `다음 최근 검색`
- 추천 보고서: `이전 추천 보고서`, `다음 추천 보고서`

결과:

- 보고서 카드는 `aria-pressed={selected}`를 가진다.
- 토스트는 `role="status"`를 가진다.
- 장식 icon은 `aria-hidden="true"`를 가진다.

## 17. 디자인 시스템 클래스

기존 디자인 시스템 클래스를 우선 사용한다. 새 CSS를 무분별하게 복제하지 않는다.

주요 클래스:

- 검색바: `main-search-wrapper`, `main-search-62`, `main-search__input`, `search-button`, `main-search-blue-icon`
- 검색 도우미 버튼: `filter-tooltip-trigger`, `filter-icon`
- 팝업 위치: `map-search-dropdown`
- 버튼: `transparent-button-40`, `transparent-button-32`, `transparent-button-28`, `blue-button-48`, `border-slate-button-40`
- 칩: `chip`, `checkbox-chip-label`, `checkbox-chip`
- 아이콘: `chevron-right-slate-700`, `chevron-left-slate-700`, `chips-close-icon`, `not-file`, `toast-icon`
- 카드/레이아웃: `grid-column-sub-8`, `grid-column-8`, `grid-column-4`, `radius-md-8`, `radius-full`
- 텍스트: `heading4-b-32`, `heading9-sb-22`, `body1-m-18`, `body1-sb-18`, `body2-r-16`, `body2-m-16`, `body2-sb-16`, `body3-r-14`
- 색상: `color-slate-900`, `color-slate-700`, `color-slate-500`, `color-blue-500`, `color-red-500`, `bg-white`, `bg-slate-50`, `bg-red-50`

## 18. 데이터 모델

현재 프로토타입은 로컬 `reportData`를 사용한다. 백엔드 연결 시 아래 구조를 유지한다.

```ts
type Report = {
  id: number;
  year: string;
  title: string;
  summary: string;
  tags: string[];
};

type HelperCategory = {
  key: string;
  label: string;
  options: string[];
};

type ReportGroup = {
  label: string;
  reports: Report[];
};
```

검색 도우미 카테고리:

```ts
[
  { key: "region", label: "지역", options: [...] },
  { key: "location", label: "소재지", options: [...] },
  { key: "era", label: "시대", options: [...] },
]
```

## 19. 백엔드 API 권장 설계

보고서 검색:

```http
GET /api/reports/search?query=가마&clues=함안,가야&filters=부산
```

응답:

```json
{
  "reports": [
    {
      "id": 1,
      "year": "2021",
      "title": "함안 말이산 유적",
      "summary": "발굴조사 보고서 요약",
      "tags": ["함안", "가야", "고분"]
    }
  ],
  "total": 1
}
```

그룹 결과:

```http
POST /api/reports/groups
```

요청:

```json
{
  "query": "가마",
  "keywords": ["함안", "가야"],
  "limit_per_group": 3
}
```

최근 검색어:

```http
GET /api/users/{user_id}/search-history
POST /api/users/{user_id}/search-history
```

추천 보고서:

```http
POST /api/reports/recommendations
```

채팅 세션 생성:

```http
POST /api/chat/sessions
```

요청:

```json
{
  "report_ids": [1, 2]
}
```

## 20. 구현 체크리스트

메인 구조:

- `main.bg-slate-50.h-screen.overflow-auto`를 유지한다.
- `section.mb-default.mt-140.pb-80`을 유지한다.
- 모바일에서는 section 좌우 padding을 `1.6rem` 준다.
- `mt-140`이 `margin: 0 auto`에 의해 무시되지 않아야 한다.

검색바:

- `main-search-wrapper`의 gradient border를 유지한다.
- focus 시 넓은 그림자가 유지되어야 한다.
- focus 효과는 keyframes가 아니라 상태 스타일이어야 한다.
- reduced motion에서 transition을 제거한다.

검색 도우미:

- 바깥 클릭으로 닫힌다.
- trigger 클릭은 바깥 클릭으로 처리하지 않는다.
- 옵션 선택/해제와 keyboard listbox를 지원한다.
- 좁은 화면에서 팝업 패널이 화면 밖으로 심하게 넘치지 않게 wrap된다.

단서 칩:

- arrow 크기는 `3.6rem`이다.
- arrow는 칩과 겹치지 않는다.
- arrow는 잘리지 않는다.
- 시작 지점에서는 왼쪽 여백이 없다.
- 끝 지점에서는 오른쪽 여백이 없다.
- arrow가 보이는 방향에만 `4.4rem` padding을 둔다.

결과:

- 검색어 입력 중 결과 영역 전체 위치 animation이 없어야 한다.
- `LayoutGroup`은 메인 결과 영역에 사용하지 않는다.
- `layout="position"`은 메인 결과 영역에 사용하지 않는다.
- 모바일에서는 카드가 1열이다.
- 데스크톱에서는 카드가 2열이다.

선택/채팅:

- 보고서 선택 개수는 프론트에서 임의 제한하지 않는다.
- 선택 개수 초과 토스트는 채팅 세션 생성 API 실패 시점에 띄운다.
- 선택 보고서가 있으면 하단 fixed CTA를 띄운다.
- 하단 CTA는 선택된 report id 전체를 전달한다.

## 21. AI 작업 지시문 예시

아래 예시는 구버전 참고용이다. 실제 AI에게 전달할 때는 `UI_SOURCE_OF_TRUTH.md`의 최신 지시문을 사용한다.

```txt
UI_SOURCE_OF_TRUTH.md를 먼저 읽고, MAIN_UI_SCREEN_SPEC.md, MAIN_UI_REPLACEMENT_HANDOFF.md, MAIN_SCREEN_SPEC.md를 최신 기준으로 발굴보고서 메인 검색 화면을 구현해줘.

반드시 포함할 기능:
- 검색어 입력과 submit
- 결과가 있는 검색어만 최근 검색어 저장
- 검색 도우미 팝업
- 지역/소재지/시대 단서 선택
- 선택 단서 칩 Swiper
- 단서 칩 활성/비활성, 개별 삭제, 전체 초기화
- 최근 검색어 Swiper
- 추천 보고서 Swiper
- 키워드별 그룹 결과
- 보고서 카드 선택/해제
- API 응답 기반 토스트
- 하단 fixed 채팅하기 CTA
- 빈 상태와 추천 검색어
- 모바일 1열 카드와 추천 1장 노출
- 접근성 aria 속성

디자인 시스템은 solvekdesignsystem-web/css의 기존 class를 우선 사용해줘.
검색바, 버튼, 칩, checkbox, icon을 새 CSS로 복제하지 말고 기존 class를 사용해줘.
검색바 focus 효과는 클릭 시 사라지는 keyframes가 아니라 focus-within 상태에서 유지되는 넓은 box-shadow로 구현해줘.
단서 Swiper arrow 버튼은 3.6rem이고, 칩과 겹치거나 잘리면 안 돼.
메인 결과 영역에는 LayoutGroup/layout position animation을 걸지 마. 스크롤 중 검색어 입력 시 콘텐츠가 검색바와 겹치며 내려오면 안 돼.
responsive.css는 index.css의 마지막에 import하고, .mb-default/.inner-default에는 margin: 0 auto를 쓰지 마.
```
