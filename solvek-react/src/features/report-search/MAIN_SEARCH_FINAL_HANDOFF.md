# 메인 검색 화면 최종 전달 명세

> Deprecated: 이 문서는 구버전 참고용입니다.
> 과거 `최대 2건` 선택 제한과 선택 제한 토스트 규칙이 남아 있으므로 최신 구현 기준으로 사용하지 않습니다.
> 최신 기준은 저장소 루트의 `UI_SOURCE_OF_TRUTH.md`, `MAIN_UI_SCREEN_SPEC.md`, `MAIN_UI_REPLACEMENT_HANDOFF.md`, `MAIN_SCREEN_SPEC.md`, `PROTOTYPE_FLOW.md`, `COMPONENT_RULES.md`입니다.
> 보고서 선택 개수는 프론트에서 임의 제한하지 않고, 채팅 세션 생성 API 응답 기준으로 처리합니다.

이 문서는 발굴보고서 검색 메인 화면의 과거 구현 흐름을 보존한 참고 문서입니다. 현재 최신 구현 기준은 위 Deprecated 안내에 적힌 문서를 따릅니다.

관련 코드:

- `solvek-react/src/features/report-search/MainSearchPage.tsx`
- `solvek-react/src/features/report-search/components/ReportSearchSections.tsx`
- `solvek-react/src/features/report-search/data.ts`
- `solvek-react/src/features/report-search/types.ts`
- `solvek-react/src/features/report-search/motionConfig.ts`
- `solvek-react/src/App.tsx`

## 1. 화면 목적

메인 화면은 사용자가 발굴보고서를 검색하고, 검색 도우미 단서를 추가하고, 선택한 보고서 전체로 챗봇 화면에 진입하는 첫 화면입니다.

사용자가 할 수 있어야 하는 일:

- 보고서명, 유적명, 지역명, 유물명 등 자연어 검색어를 입력한다.
- 검색 도우미 팝업에서 `지역`, `소재지`, `시대` 단서를 추가한다.
- 선택한 단서 칩을 다시 활성화해서 키워드별 그룹 결과를 본다.
- 검색 결과 카드에서 보고서를 선택/해제한다.
- 선택한 보고서가 있으면 하단 `채팅하기` 버튼으로 챗봇 화면에 진입한다.
- 결과가 없는 검색어에서는 빈 상태와 추천 검색어를 본다.
- 검색 성공 이력이 있으면 최근 검색어와 추천 보고서를 본다.

## 2. 전체 화면 구조

최상위 구조:

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

상단부터 하단까지 표시 순서:

1. 선택 제한 토스트
2. 페이지 제목
3. 페이지 설명
4. 메인 검색바
5. 검색 도우미 팝업
6. 선택한 단서 칩 Swiper
7. 최근 검색한 보고서 Swiper
8. 추천 보고서 Swiper
9. 필터 레일
10. 결과 헤더 또는 그룹별 결과 헤더
11. 보고서 카드 그리드
12. 하단 fixed `채팅하기` CTA

레이아웃 핵심 값:

- 최상위 main은 `h-screen overflow-auto`입니다.
- 메인 섹션은 `mt-140 pb-80`을 사용합니다.
- 제목 영역은 가운데 정렬, 하단 여백 `mb-50`입니다.
- 검색 결과 영역은 검색바/단서 영역 아래 `mt-50`에 위치합니다.
- 하단 CTA는 화면 하단 fixed이며, 아래쪽 그라데이션 배경으로 리스트와 분리합니다.

## 3. 진입과 화면 전환

`App.tsx`가 화면 전환을 관리합니다.

```ts
type AppView = "search" | "chat";

const [view, setView] = useState<AppView>("search");
const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);
```

메인 화면 렌더:

```tsx
<MainSearchPage onStartChat={startChat} />
```

챗봇 진입:

```ts
const startChat = (reportIds: number[]) => {
  if (reportIds.length === 0) return;
  setSelectedReportIds(reportIds);
  setView("chat");
};
```

`MainSearchPage`는 `onStartChat?: (reportIds: number[]) => void` prop만 외부로 받습니다. 실제 서비스에서는 이 시점에 `POST /api/chat/sessions`를 호출하거나, 챗봇 화면 진입 후 세션을 생성할 수 있습니다.

## 4. 상태 모델

```ts
type ViewMode = "default" | "history" | "filtered" | "grouped" | "empty" | "recommend";

type MainSearchState = {
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

상태별 의미:

- `query`: 검색 input의 현재 문자열입니다.
- `mode`: 결과 렌더링 방식을 결정하는 화면 모드입니다.
- `searchHistory`: 최근 검색어 목록입니다. 최대 5개입니다.
- `helperOpen`: 검색 도우미 팝업 열림 여부입니다.
- `activeFilters`: 필터 레일에서 선택된 키워드 목록입니다. 현재 프로토타입에는 컴포넌트가 있지만 메인 기본 플로우에서는 검색 도우미 단서가 주 흐름입니다.
- `clues`: 검색 도우미에서 추가한 단서 목록입니다. 화면에 칩으로 표시됩니다.
- `checkedClues`: `clues` 중 사용자가 활성화한 단서 목록입니다. 그룹 결과 기준으로 사용됩니다.
- `selectedReports`: 선택된 보고서 id 목록입니다. 최대 2개입니다.
- `toastVisible`: 구버전 선택 제한 토스트 상태였습니다. 최신 구현에서는 채팅 세션 생성 API 실패 메시지용 `toastMessage` 흐름을 사용합니다.

초기값:

```ts
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

## 5. 데이터 모델

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

프로토타입 보고서 데이터:

```ts
[
  {
    id: 1,
    year: "2021",
    title: "함안 우거리 토기가마 유적",
    summary: "함안 우거리 일대 아라가야 토기가마 유적과 출토 유물을 다룬 발굴조사 보고서",
    tags: ["함안", "토기가마", "아라가야", "좌표있음"],
  },
  {
    id: 2,
    year: "2019",
    title: "김해 대성동 고분군",
    summary: "금관가야 지배층의 목곽묘와 위세품이 확인된 김해 대성동 고분군 발굴 성과",
    tags: ["김해", "고분", "금관가야", "좌표있음"],
  },
  {
    id: 3,
    year: "2020",
    title: "고령 지산동 대가야 고분군",
    summary: "대가야 왕릉급 봉토분과 순장 흔적이 확인된 고령 지산동 고분군 조사 보고",
    tags: ["고령", "고분", "대가야", "순장"],
  },
  {
    id: 4,
    year: "2018",
    title: "창녕 교동과 송현동 고분군",
    summary: "비화가야 세력의 위세품과 봉토분 축조기법을 밝힌 창녕 고분군 발굴보고서",
    tags: ["창녕", "고분", "비화가야", "좌표없음"],
  },
  {
    id: 5,
    year: "2022",
    title: "합천 옥전 고분군",
    summary: "다라국 지배층의 금동관과 대도가 출토된 합천 옥전 고분군 종합 보고서",
    tags: ["합천", "고분", "다라국", "금동관"],
  },
  {
    id: 6,
    year: "2017",
    title: "함안 성산산성",
    summary: "아라가야 축성술과 다량의 목간이 확인된 함안 성산산성 발굴조사 보고서",
    tags: ["함안", "산성", "아라가야", "목간"],
  },
  {
    id: 7,
    year: "2020",
    title: "고성 송학동 고분군",
    summary: "소가야 중심세력의 봉토분과 매장주체부 구조를 다룬 고성 송학동 고분군 보고",
    tags: ["고성", "고분", "소가야", "좌표있음"],
  },
  {
    id: 8,
    year: "2021",
    title: "김해 봉황동 유적",
    summary: "금관가야 생활상을 보여주는 패총과 주거지가 확인된 김해 봉황동 유적 보고서",
    tags: ["김해", "생활유적", "금관가야", "패총"],
  },
  {
    id: 9,
    year: "2016",
    title: "창원 다호리 유적",
    summary: "변한 시기 널무덤과 붓·칠기가 출토된 창원 다호리 유적 발굴조사 보고서",
    tags: ["창원", "널무덤", "변한", "좌표없음"],
  },
  {
    id: 10,
    year: "2019",
    title: "합천 저포리 유적",
    summary: "가야 토기가마와 주거지가 함께 확인된 합천 저포리 유적 발굴 성과 보고",
    tags: ["합천", "토기가마", "가야", "주거지"],
  },
]
```

검색 도우미 옵션:

```ts
[
  { key: "region", label: "지역", options: ["서울", "부산", "대구", "인천", "광주", "대전", "경기"] },
  { key: "location", label: "소재지", options: ["함안", "김해", "창녕", "고성", "합천", "의령", "산청"] },
  { key: "era", label: "시대", options: ["삼한시대", "가야", "삼국시대", "통일신라", "고려", "조선"] },
]
```

기타 임시 데이터:

```ts
filterChips = ["부산", "테스트123", "통일신라", "테스트456", "동일신라", "동일신라", "동일신라", "1234", "삼한시대"];
suggestions = ["좌표 있음 보고서", "토기가마", "왕흥사지 보고서"];
```

## 6. 파생 데이터 계산

### shownReports

검색 결과 목록입니다.

규칙:

- `query.trim()`이 있으면 `title`, `summary`, `tags` 중 하나라도 검색어를 포함하는 보고서만 반환합니다.
- 비교는 대소문자를 무시합니다.
- `query`가 비어 있고 `mode`가 `"filtered"` 또는 `"grouped"`면 `reportData.slice(0, 6)`을 반환합니다.
- 그 외에는 전체 `reportData`를 반환합니다.

의사 코드:

```ts
const keyword = query.trim().toLowerCase();

if (keyword) {
  reports = reportData.filter(
    report =>
      report.title.toLowerCase().includes(keyword) ||
      report.summary.toLowerCase().includes(keyword) ||
      report.tags.some(tag => tag.toLowerCase().includes(keyword))
  );
} else if (mode === "filtered" || mode === "grouped") {
  reports = reportData.slice(0, 6);
} else {
  reports = reportData;
}
```

### activeGroupKeywords

그룹 결과를 만들 기준 키워드입니다.

```ts
const activeGroupKeywords = checkedClues.length > 0 ? checkedClues : activeFilters;
```

우선순위:

1. `checkedClues`
2. `activeFilters`

### groupedReports

활성 키워드별 보고서 그룹입니다.

규칙:

- `activeGroupKeywords.length === 0`이면 빈 배열입니다.
- 기본 검색 대상은 `shownReports`입니다.
- `shownReports`가 비어 있으면 `reportData`를 fallback으로 씁니다.
- 각 키워드는 보고서의 `title`, `summary`, `tags`와 매칭합니다.
- 매칭된 보고서가 있으면 그 목록 중 앞 3건을 사용합니다.
- 매칭된 보고서가 없으면 fallback baseReports 중 앞 3건을 사용합니다.

### recommendedReports

최근 검색어 기반 추천 보고서입니다.

규칙:

- `searchHistory`를 공백 기준으로 쪼개 키워드를 만듭니다.
- 길이가 1 이하인 단어는 제외합니다.
- 로마 숫자 패턴 `/^[IVXⅠ-Ⅻ]+$/`은 제외합니다.
- 중복 키워드는 제거합니다.
- 보고서의 `title`, `summary`, `tags` 중 하나라도 키워드를 포함하면 추천 대상입니다.
- 최대 8건만 표시합니다.

### isEmptyResult

빈 상태 표시 여부입니다.

```ts
const isEmptyResult = mode === "empty" || (query.trim() !== "" && shownReports.length === 0);
```

현재 프로토타입에서는 `mode`를 직접 `"empty"`로 바꾸는 이벤트보다 `query`와 `shownReports` 결과로 빈 상태를 판정하는 흐름이 핵심입니다.

### resultCount

결과 헤더에 표시할 개수입니다.

```ts
const resultCount = query.trim()
  ? shownReports.length
  : mode === "grouped" || mode === "filtered"
    ? 3
    : reportData.length;
```

## 7. 컴포넌트 전체 목록

### MainSearchPage

파일: `MainSearchPage.tsx`

역할:

- 메인 화면의 모든 상태를 소유합니다.
- 검색, 검색 도우미, 단서 칩, 최근 검색어, 추천 보고서, 그룹 결과, 보고서 선택, 토스트, 하단 CTA를 조율합니다.

Props:

```ts
type MainSearchPageProps = {
  onStartChat?: (reportIds: number[]) => void;
};
```

내부 핸들러:

- `toggleClue`
- `toggleClueChecked`
- `resetClues`
- `handleSearch`
- `toggleFilter`
- `chooseRecent`
- `toggleReport`
- `startChatWithReports`
- `startChatWithGroup`

### HelperMenu

파일: `components/ReportSearchSections.tsx`

역할:

- 검색 도우미 팝업 내부 UI입니다.
- 왼쪽에는 카테고리 목록, 오른쪽에는 선택한 카테고리의 옵션 목록을 표시합니다.

Props:

```ts
{
  clues: string[];
  onToggleClue: (value: string) => void;
}
```

내부 상태:

- `categoryKey`: 현재 선택한 카테고리 key입니다.
- `activeIndex`: 오른쪽 listbox에서 키보드 포커스된 option index입니다.
- `listboxRef`: 카테고리 변경 시 오른쪽 옵션 목록에 focus를 주기 위한 ref입니다.

카테고리 UI:

- 너비 `w-200`
- 높이 `18.8rem`
- 제목 `어떤 단서를 추가할까요?`
- 카테고리 버튼 높이 `3.6rem`
- 선택된 카테고리는 `bg-slate-50`
- 해당 카테고리 안에 선택된 옵션 개수가 있으면 label 옆에 blue count를 표시합니다.

옵션 UI:

- 오른쪽 패널은 카테고리를 선택한 뒤에만 나타납니다.
- 너비 `w-200`
- 높이 `18.8rem`
- `overflowY: auto`
- `role="listbox"`, option은 `role="option"`
- 선택된 옵션은 blue text와 check icon을 표시합니다.
- hover 또는 키보드 이동 중인 option은 `slate-50` 배경입니다.

### ClueChips

역할:

- 검색 도우미에서 추가한 단서를 가로 Swiper 칩으로 보여줍니다.
- 칩을 클릭하면 그룹 검색 기준으로 활성/비활성 전환합니다.
- 칩 내부 X 버튼으로 개별 삭제합니다.
- `초기화` 버튼으로 전체 삭제합니다.

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

Swiper 규칙:

- `slidesPerView="auto"`
- `spaceBetween={8}`
- `grabCursor`
- `Navigation` module 사용
- `onSwiper`, `onSlideChange`, `onResize`, `onReachBeginning`, `onReachEnd`로 좌우 끝 상태를 동기화합니다.
- `clues` 또는 `checkedClues`가 바뀌면 `swiper.update()` 후 edge 상태를 다시 계산합니다.

Arrow 버튼 규칙:

- 공통 스타일 `sliderNavButtonStyle` 사용
- 크기 `3.6rem x 3.6rem`
- `top: calc(50% - 1.8rem)`
- 흰 배경, 원형, shadow, slate border
- 왼쪽 arrow는 `!isBeginning`일 때만 표시합니다.
- 오른쪽 arrow는 `!isEnd`일 때만 표시합니다.
- 단서 칩에서는 버튼이 잘리거나 칩과 겹치지 않도록 버튼이 보이는 방향에만 padding을 줍니다.

```ts
paddingLeft: showNavigation && !isBeginning ? "4.4rem" : 0;
paddingRight: showNavigation && !isEnd ? "4.4rem" : 0;
```

칩 UI:

- `checkbox-chip-label body2-r-16`
- 내부 input은 `checkbox-chip`
- 활성 여부는 `checkedClues.includes(clue)`
- label 안에 텍스트와 X 버튼이 같이 들어갑니다.
- X 버튼은 `transparent-button-28`, 실제 크기는 `2rem x 2rem`
- X 클릭 시 `preventDefault`, `stopPropagation` 후 `onRemove(clue)` 호출

초기화 버튼:

- `chip border-slate-500 border h-36 w-fit px-12 radius-full flex align-center justify-center bg-white flex-none`
- 텍스트 `초기화`
- 클릭 시 `onReset()`

### FilterRail

역할:

- `filterChips` 배열을 checkbox chip으로 보여주는 필터 레일입니다.
- 현재 메인 기본 사용자 흐름에서는 검색 도우미 단서가 중심이고, 이 컴포넌트는 `mode === "filtered" || mode === "grouped"`일 때 렌더될 수 있는 보조/확장 UI입니다.

Props:

```ts
{
  activeFilters: string[];
  onToggle: (filter: string) => void;
}
```

이벤트:

- checkbox 변경 시 `onToggle(filter)` 호출
- 더보기 버튼은 현재 시각 요소이며 별도 로직은 없습니다.

### RecentReports

역할:

- 최근 검색어를 Swiper chip 목록으로 표시합니다.

Props:

```ts
{
  reports: string[];
  onChoose: (report: string) => void;
}
```

표시 조건:

```ts
query.trim() === "" && searchHistory.length > 0
```

Swiper 규칙:

- `slidesPerView="auto"`
- `spaceBetween={8}`
- 좌우 arrow는 `!isBeginning`, `!isEnd` 상태에 따라 표시
- RecentReports와 RecommendSlider의 arrow는 컨테이너 바깥 `left: -2rem`, `right: -2rem` 위치를 사용합니다.

칩 클릭:

- `onChoose(report)` 호출
- MainSearchPage에서는 `chooseRecent(term)`로 연결됩니다.

### RecommendSlider

역할:

- 최근 검색어 기반 추천 보고서를 Swiper로 표시합니다.

Props:

```ts
{
  reports: Report[];
  selectedReports: number[];
  onToggle: (id: number) => void;
  keyword: string;
}
```

표시 조건:

```ts
query.trim() === "" && searchHistory.length >= 5 && recommendedReports.length > 0
```

UI:

- 섹션 label `추천 보고서`
- 상단 여백 `mt-40`
- 하단 여백 `marginBottom: "4.2rem"`
- `slidesPerView={2}`
- `spaceBetween={16}`
- 각 slide는 `width: "30rem"`, `height: "auto"`

카드 클릭:

- 내부 `ReportCard`가 `onToggle(report.id)`를 호출합니다.
- 선택 제한은 일반 결과 카드와 동일하게 적용합니다.

### ResultHeader

역할:

- 결과 목록 또는 그룹 섹션의 헤더입니다.

Props:

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
- count는 blue strong
- `showChat`이 true면 오른쪽에 `채팅하기 >` 투명 버튼 표시

주의:

- 일반 결과 헤더에서는 `showChat`이 false입니다.
- 그룹 결과에서는 각 그룹 헤더마다 `showChat`이 true입니다.

### ReportCard

역할:

- 보고서 하나를 선택 가능한 카드로 표시합니다.

Props:

```ts
{
  report: Report;
  selected: boolean;
  onToggle: (id: number) => void;
  keyword: string;
}
```

마크업:

- `<motion.a href="#">`
- `aria-pressed={selected}`
- `itemScope`
- `itemType="https://schema.org/Dataset"`
- 제목 h3에는 `itemProp="name"`

클릭 이벤트:

- anchor 기본 이동을 막습니다.
- `onToggle(report.id)` 호출

선택 상태 스타일:

- 선택됨: `border border-blue-500 radius-md-8 p-16 flex flex-col bg-white gap-16 h-full`
- 기본: `border border-slate-200 radius-md-8 p-16 flex flex-col bg-white gap-16 h-full`

카드 구성:

- 제목
- 연도
- 요약
- 태그 목록

검색어 하이라이트:

- 제목과 요약은 `highlightMatch(text, keyword)`로 첫 매칭 부분만 blue mark 처리합니다.
- 태그는 검색어가 포함된 태그에 `meta-tag--active`를 적용합니다.

### ReportGrid

역할:

- 보고서 카드를 2열 그리드로 표시합니다.

Props:

```ts
{
  reports: Report[];
  selectedReports: number[];
  onToggle: (id: number) => void;
  keyword: string;
}
```

UI:

- `<ul className="grid-column-sub-8 gap-y-20">`
- 각 item은 `<li className="grid-column-4">`
- 각 카드 item은 fade-in motion을 가집니다.

### GroupedReportSections

역할:

- 활성 키워드별로 여러 결과 그룹을 표시합니다.

Props:

```ts
{
  groups: ReportGroup[];
  selectedReports: number[];
  onToggle: (id: number) => void;
  onChat?: (reports: Report[]) => void;
  keyword: string;
}
```

UI:

- 그룹 간 gap `24`
- 각 그룹은 `<section aria-label={`${group.label} 보고서 그룹`}>`
- `ResultHeader`를 `showChat` 상태로 표시
- 그룹별 `ReportGrid` 표시

그룹 헤더 채팅 이벤트:

```ts
onChat?.(group.reports)
```

MainSearchPage에서는 `startChatWithGroup`으로 연결합니다.

### EmptyState

역할:

- 검색 결과가 없는 상태를 보여주고 추천 검색어 버튼을 제공합니다.

Props:

```ts
{
  query: string;
  onSuggestion: (text: string) => void;
}
```

표시 조건:

```ts
isEmptyResult === true
```

UI:

- 아이콘 `not-file`
- 제목 `“{query || "489651"}” 를 찾을 수 없습니다`
- 설명 `아래에 항목과 비슷한 보고서를 찾고 계시나요?`
- 추천 칩 3개

추천 칩 클릭:

- `onSuggestion(suggestion)` 호출
- MainSearchPage에서는 `setQuery(text); setMode("history");`를 실행합니다.

## 8. 이벤트 상세

### 검색 도우미 열기/닫기

검색 도우미 버튼:

```tsx
<motion.button
  aria-label="검색 도우미"
  aria-haspopup="dialog"
  aria-expanded={helperOpen}
  aria-controls="helper-popup"
  data-filter-trigger
  onClick={() => setHelperOpen(open => !open)}
>
```

열림 상태:

- 버튼 class에 `active` 추가
- icon class도 `filter-icon active`
- 팝업은 `AnimatePresence`로 mount/unmount

바깥 클릭 닫기:

```ts
useEffect(() => {
  if (!helperOpen) return;

  const handlePointerDown = (event: MouseEvent) => {
    const target = event.target as Node;
    if (helperPopupRef.current?.contains(target)) return;
    if ((event.target as Element).closest?.("[data-filter-trigger]")) return;
    setHelperOpen(false);
  };

  document.addEventListener("mousedown", handlePointerDown);
  return () => document.removeEventListener("mousedown", handlePointerDown);
}, [helperOpen]);
```

닫지 않는 경우:

- 팝업 내부를 클릭한 경우
- 검색 도우미 trigger를 클릭한 경우

### 검색 input 변경

```ts
onChange={(event) => {
  setQuery(event.target.value);
  if (event.target.value.trim() && event.target.value.trim() !== "489651") {
    setMode("history");
  }
}}
```

규칙:

- input 값은 즉시 `query`에 반영합니다.
- 검색어가 비어 있지 않고 `"489651"`이 아니면 `mode`를 `"history"`로 변경합니다.
- `"489651"`은 빈 상태 예시를 위한 특수 입력처럼 동작하며, mode 변경 없이도 `isEmptyResult` 계산으로 빈 상태가 표시될 수 있습니다.

### 검색 submit

검색 버튼 또는 Enter로 form submit합니다.

```ts
const handleSearch = (event?: FormEvent) => {
  event?.preventDefault();
  const nextQuery = query.trim();

  if (nextQuery) {
    const keyword = nextQuery.toLowerCase();
    const hasResults = reportData.some(report =>
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

최근 검색어 저장 규칙:

- 검색어가 비어 있으면 저장하지 않습니다.
- 검색 결과가 없는 검색어는 저장하지 않습니다.
- 중복 검색어는 기존 위치에서 제거한 뒤 맨 앞으로 이동합니다.
- 최대 5개만 유지합니다.

### 검색 도우미 카테고리 선택

카테고리 버튼 클릭:

```ts
setCategoryKey(item.key)
```

카테고리 변경 후:

- `activeIndex`를 0으로 초기화합니다.
- 오른쪽 listbox에 focus를 줍니다.

### 검색 도우미 옵션 선택

옵션 클릭 또는 키보드 Enter/Space:

```ts
const chooseOption = (option: string) => {
  if (!categoryKey) return;
  onToggleClue(option);
};
```

MainSearchPage 연결:

```ts
const toggleClue = (value: string) => {
  setClues(current =>
    current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
  );
  setCheckedClues(current => current.filter(item => item !== value));
};
```

규칙:

- 이미 추가된 option이면 `clues`에서 제거합니다.
- 새 option이면 `clues` 끝에 추가합니다.
- option이 제거될 때 `checkedClues`에서도 반드시 제거합니다.
- option 선택만으로 검색 submit은 하지 않습니다.

### 검색 도우미 키보드 이벤트

오른쪽 listbox에서 지원:

- `ArrowDown`: 다음 option으로 이동
- `ArrowUp`: 이전 option으로 이동
- `Home`: 첫 option으로 이동
- `End`: 마지막 option으로 이동
- `Enter`: 현재 option 선택/해제
- `Space`: 현재 option 선택/해제

모든 조작은 `event.preventDefault()`를 실행합니다.

### 단서 칩 활성/비활성

칩 label 클릭:

```ts
const toggleClueChecked = (value: string) => {
  setCheckedClues(current =>
    current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
  );
};
```

활성화된 단서가 있으면:

- `activeGroupKeywords`가 `checkedClues`가 됩니다.
- `groupedReports`가 생성됩니다.
- 일반 결과 대신 `GroupedReportSections`가 표시됩니다.

### 단서 칩 개별 삭제

X 버튼 클릭:

```ts
event.preventDefault();
event.stopPropagation();
onRemove(clue);
```

MainSearchPage에서는 `toggleClue(clue)`로 연결됩니다.

삭제 효과:

- `clues`에서 제거
- `checkedClues`에서도 제거
- Swiper update
- 그룹 결과 재계산

### 단서 전체 초기화

초기화 버튼 클릭:

```ts
const resetClues = () => {
  setClues([]);
  setCheckedClues([]);
};
```

초기화 후:

- 단서 칩 영역이 unmount됩니다.
- 단서 칩 자체는 height/opacity transition으로 접힙니다.
- 검색 결과 영역의 위치 이동에는 `LayoutGroup`, `layout`, `layout="position"` 애니메이션을 사용하지 않습니다.
- 스크롤을 내린 상태에서 검색어를 입력해도 결과 콘텐츠가 검색바와 겹치며 미끄러지면 안 됩니다.
- `activeFilters`가 없으면 그룹 결과도 사라집니다.

### 최근 검색어 선택

RecentReports chip 클릭:

```ts
const chooseRecent = (term: string) => {
  setQuery(term);
  setMode("history");
  setSelectedReports([]);
};
```

효과:

- input 값이 최근 검색어로 바뀝니다.
- 검색 결과가 해당 query 기준으로 필터링됩니다.
- 기존 선택 보고서를 모두 해제합니다.
- 하단 CTA도 사라집니다.

### 필터 토글

FilterRail checkbox 변경:

```ts
const toggleFilter = (filter: string) => {
  setActiveFilters(current => {
    const next = current.includes(filter)
      ? current.filter(item => item !== filter)
      : [...current, filter];

    setMode(next.length > 0 ? "grouped" : query.trim() ? "history" : "default");
    return next;
  });
};
```

효과:

- 선택된 filter가 있으면 `mode = "grouped"`
- filter가 모두 해제되면 query 여부에 따라 `"history"` 또는 `"default"`
- `checkedClues`가 없을 때 `activeFilters`가 그룹 기준이 됩니다.

### 보고서 카드 선택/해제

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

규칙:

- 이미 선택된 카드를 클릭하면 해제합니다.
- 새 id는 개수 제한 없이 추가합니다.
- 선택 가능 개수는 채팅 세션 생성 API 응답을 기준으로 처리합니다.

### 일반 하단 채팅하기

표시 조건:

```ts
selectedReports.length > 0
```

클릭:

```ts
const startChatWithReports = (reportIds: number[]) => {
  if (reportIds.length === 0) return;
  onStartChat?.(reportIds);
};
```

규칙:

- 선택된 report id 전체를 전달합니다.
- 프론트에서 앞 일부만 자르지 않습니다.

### 그룹 헤더 채팅하기

```ts
const startChatWithGroup = (reports: Report[]) => {
  const groupReportIds = reports.map(report => report.id);

  if (groupReportIds.length === 0) return;

  onStartChat?.(groupReportIds);
};
```

규칙:

- 그룹 보고서가 0건이면 아무 일도 하지 않습니다.
- 그룹 보고서가 1건 이상이면 groupReportIds 전체로 채팅 시작 흐름을 호출합니다.
- 채팅 시작 실패 사유는 API 응답 메시지로 토스트 처리합니다.

### 빈 상태 추천어 선택

```ts
onSuggestion={(text) => {
  setQuery(text);
  setMode("history");
}}
```

효과:

- query가 추천어로 바뀝니다.
- 즉시 결과 목록이 다시 계산됩니다.

### 빈 상태 진입 시 선택 초기화

```ts
useEffect(() => {
  if (!isEmptyResult) return;
  setSelectedReports(current => (current.length > 0 ? [] : current));
  setToastVisible(false);
}, [isEmptyResult]);
```

규칙:

- 검색 결과가 없으면 선택된 보고서를 모두 해제합니다.
- 하단 CTA가 사라집니다.
- 토스트도 숨깁니다.

## 9. 조건부 렌더링 규칙

### 제목

```ts
const heading =
  mode === "recommend"
    ? "이번엔 어떤 보고서로 이야기를 나눌까요?"
    : "대화할 발굴보고서를 선택하거나 입력해보세요";
```

현재 기본 흐름에서는 대부분 두 번째 제목이 표시됩니다.

### 검색 도우미 팝업

표시 조건:

```ts
helperOpen === true
```

### 단서 칩 영역

표시 조건:

```ts
clues.length > 0
```

### 빈 상태

표시 조건:

```ts
isEmptyResult === true
```

빈 상태가 표시되면 RecentReports, RecommendSlider, FilterRail, ResultHeader, ReportGrid, GroupedReportSections는 표시하지 않습니다.

### 최근 검색어

표시 조건:

```ts
query.trim() === "" && searchHistory.length > 0
```

### 추천 보고서

표시 조건:

```ts
query.trim() === "" &&
searchHistory.length >= 5 &&
recommendedReports.length > 0
```

### 필터 레일

표시 조건:

```ts
mode === "filtered" || mode === "grouped"
```

### 그룹 결과

표시 조건:

```ts
groupedReports.length > 0
```

### 일반 결과

표시 조건:

```ts
!isEmptyResult && groupedReports.length === 0
```

### 하단 CTA

표시 조건:

```ts
selectedReports.length > 0
```

## 10. 애니메이션 규칙

공통 설정:

```ts
export const springSnappy = { type: "spring", stiffness: 300, damping: 32 };
export const springSoft = { type: "spring", stiffness: 240, damping: 30 };
export const fadeEase = { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] };
export const tapScale = {
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 320, damping: 28 },
};
```

검색 도우미 팝업:

- initial: `{ opacity: 0, y: -10, scale: 0.98 }`
- animate: `{ opacity: 1, y: 0, scale: 1 }`
- exit: `{ opacity: 0, y: -10, scale: 0.98 }`
- transition: `springSnappy`

오른쪽 옵션 패널:

- initial: `{ opacity: 0, x: -16 }`
- animate: `{ opacity: 1, x: 0 }`
- exit: `{ opacity: 0, x: -16 }`
- transition: `fadeEase`

단서 칩 영역:

- initial: `{ opacity: 0, height: 0, y: -4 }`
- animate: `{ opacity: 1, height: "auto", y: 0 }`
- exit: `{ opacity: 0, height: 0, y: -4 }`
- wrapper style은 `overflow: hidden`
- 단서 칩 wrapper에는 `layout` prop을 쓰지 않습니다.
- 메인 결과 영역에는 `LayoutGroup`, `layout="position"`, spring 기반 위치 보간을 쓰지 않습니다.
- 검색 input 변경, 빈 상태 전환, 일반/그룹 결과 전환은 즉시 재배치되어야 합니다.

보고서 카드 item:

- initial: `{ opacity: 0, y: 12 }`
- animate: `{ opacity: 1, y: 0 }`
- transition: `fadeEase`

토스트:

- initial: `{ opacity: 0, y: -32, x: "-50%" }`
- animate: `{ opacity: 1, y: 0, x: "-50%" }`
- exit: `{ opacity: 0, y: -24, x: "-50%" }`
- top `3.2rem`, left `50%`

하단 CTA:

- initial: `{ opacity: 0, y: 48 }`
- animate: `{ opacity: 1, y: 0 }`
- exit: `{ opacity: 0, y: 48 }`
- transition: `springSoft`

## 11. 디자인 시스템과 스타일 규칙

반드시 기존 디자인 시스템 class를 우선 사용합니다.

주요 class:

- 검색바: `main-search-wrapper`, `main-search-62`, `main-search__input`, `search-button`, `main-search-blue-icon`
- 검색 도우미 버튼: `filter-tooltip-trigger`, `filter-icon`
- 팝업: `map-search-dropdown`
- 버튼: `transparent-button-40`, `transparent-button-28`, `blue-button-48`, `border-slate-button-40`
- 칩: `chip`, `checkbox-chip-label`, `checkbox-chip`
- 아이콘: `chevron-right-slate-700`, `chevron-left-slate-700`, `chips-close-icon`, `not-file`, `toast-icon`
- 카드/레이아웃: `grid-column-sub-8`, `grid-column-4`, `radius-md-8`, `radius-full`
- 텍스트: `heading4-b-32`, `heading9-sb-22`, `body1-m-18`, `body1-sb-18`, `body2-r-16`, `body2-m-16`, `body2-sb-16`, `body3-r-14`
- 색상: `color-slate-900`, `color-slate-700`, `color-slate-500`, `color-blue-500`, `color-red-500`, `bg-white`, `bg-slate-50`, `bg-red-50`

금지/주의:

- 디자인 시스템에 있는 검색바, 버튼, 칩, 체크박스를 새 CSS로 복제하지 않습니다.
- 카드 안에 카드 구조를 만들지 않습니다.
- 메인 첫 화면은 실제 검색 UI여야 하며 랜딩 페이지처럼 만들지 않습니다.
- 단서 칩의 체크 상태에는 체크 아이콘을 표시하지 않습니다. blue border/background/text만 사용합니다.
- Swiper arrow 버튼은 칩과 겹치거나 잘리면 안 됩니다.
- arrow 버튼 크기는 현재 `3.6rem`입니다.
- 단서 칩 Swiper는 arrow가 보이는 방향에만 `4.4rem` 여백을 예약합니다.
- 검색어 입력으로 결과 영역 위치가 바뀔 때는 애니메이션을 걸지 않습니다.

## 12. 접근성 규칙

검색바:

- input은 `type="search"`입니다.
- input은 `aria-label="발굴보고서 검색어"`를 가집니다.
- 검색 도우미 버튼은 `aria-label="검색 도우미"`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls="helper-popup"`를 가집니다.
- 검색 버튼은 `aria-label="검색"`을 가집니다.

검색 도우미:

- 팝업은 `role="dialog"`입니다.
- 팝업은 `aria-label="검색 도우미 단서 추가"`를 가집니다.
- 카테고리 버튼은 `aria-haspopup="listbox"`와 `aria-expanded`를 가집니다.
- 활성 카테고리 버튼은 `aria-controls="helper-detail-listbox"`를 가집니다.
- 옵션 목록은 `role="listbox"`입니다.
- 옵션 목록은 `aria-multiselectable="true"`입니다.
- 옵션은 `role="option"`입니다.
- 옵션 선택 상태는 `aria-selected`입니다.
- 키보드 이동 대상은 `aria-activedescendant`로 연결합니다.

단서 칩:

- 영역은 `aria-label="선택한 단서"`입니다.
- 각 checkbox input은 `aria-label={clue}`를 가집니다.
- 삭제 버튼은 `aria-label={`${clue} 삭제`}`를 가집니다.
- 초기화 버튼은 `aria-label="선택한 단서 초기화"`를 가집니다.

Swiper arrow:

- 최근 검색: `이전 최근 검색`, `다음 최근 검색`
- 추천 보고서: `이전 추천 보고서`, `다음 추천 보고서`
- 단서: `이전 단서`, `다음 단서`

결과:

- 보고서 카드는 `aria-pressed={selected}`를 가집니다.
- 토스트는 `role="status"`를 가집니다.
- 장식 icon은 `aria-hidden="true"`입니다.

## 13. 백엔드 API 연결 권장안

현재 프로토타입은 로컬 `reportData`로 동작합니다. 실제 서비스에서는 아래 API로 치환합니다.

### 보고서 검색

```http
GET /api/reports/search?query=토기&clues=함안,가야&filters=부산
```

요청 파라미터:

- `query`: 검색어
- `clues`: 검색 도우미에서 추가된 단서 목록
- `checked_clues`: 활성화된 단서 목록
- `filters`: 필터 레일 선택값
- `limit`
- `offset`

응답:

```json
{
  "reports": [
    {
      "id": 1,
      "year": "2021",
      "title": "함안 우거리 토기가마 유적",
      "summary": "함안 우거리 일대 아라가야 토기가마 유적과 출토 유물을 다룬 발굴조사 보고서",
      "tags": ["함안", "토기가마", "아라가야", "좌표있음"]
    }
  ],
  "total": 1
}
```

### 키워드별 그룹 결과

```http
POST /api/reports/groups
```

요청:

```json
{
  "query": "토기",
  "keywords": ["함안", "가야"],
  "limit_per_group": 3
}
```

응답:

```json
{
  "groups": [
    {
      "label": "함안",
      "reports": []
    },
    {
      "label": "가야",
      "reports": []
    }
  ]
}
```

### 최근 검색어

```http
GET /api/users/{user_id}/search-history
POST /api/users/{user_id}/search-history
```

저장 조건:

- 검색어가 비어 있지 않아야 합니다.
- 검색 결과가 1건 이상이어야 합니다.
- 중복 검색어는 맨 앞으로 이동합니다.
- 최대 5개만 유지합니다.

### 추천 보고서

```http
POST /api/reports/recommendations
```

요청:

```json
{
  "recent_queries": ["토기", "가야", "함안"],
  "limit": 8
}
```

응답:

```json
{
  "reports": []
}
```

### 채팅 세션 생성

```http
POST /api/chat/sessions
```

요청:

```json
{
  "report_ids": [1, 2]
}
```

응답:

```json
{
  "session_id": "chat_001",
  "report_ids": [1, 2]
}
```

## 14. Python 모델 예시

```py
from pydantic import BaseModel

class Report(BaseModel):
    id: int
    year: str
    title: str
    summary: str
    tags: list[str]

class ReportGroup(BaseModel):
    label: str
    reports: list[Report]

class SearchResponse(BaseModel):
    reports: list[Report]
    total: int

class GroupRequest(BaseModel):
    query: str = ""
    keywords: list[str]
    limit_per_group: int = 3

class GroupResponse(BaseModel):
    groups: list[ReportGroup]

class ChatSessionRequest(BaseModel):
    report_ids: list[int]
```

## 15. 구현 체크리스트

메인 구조:

- `main.bg-slate-50.h-screen.overflow-auto`를 유지합니다.
- 제목, 설명, 검색바, 단서 칩, 결과 영역, 하단 CTA 순서를 유지합니다.
- 검색 UI가 첫 화면의 중심이어야 합니다.

검색:

- input 변경 시 즉시 query를 갱신합니다.
- submit 시 결과가 있는 검색어만 최근 검색어에 저장합니다.
- 검색 대상 필드는 `title`, `summary`, `tags`입니다.
- 검색 결과가 없으면 EmptyState를 표시합니다.

검색 도우미:

- trigger의 active 상태와 `aria-expanded`를 동기화합니다.
- 바깥 클릭으로 닫습니다.
- 카테고리 선택 후 오른쪽 옵션 패널을 표시합니다.
- 옵션 선택/해제를 지원합니다.
- 키보드 조작을 지원합니다.

단서 칩:

- `clues.length > 0`일 때만 표시합니다.
- 칩 클릭은 `checkedClues`를 토글합니다.
- X 버튼은 해당 단서를 삭제합니다.
- 초기화 버튼은 모든 단서와 활성 단서를 삭제합니다.
- Swiper arrow는 3.6rem 크기입니다.
- arrow가 보이는 방향에만 칩 영역 여백을 둡니다.
- 단서 칩 자체의 접힘/펼침은 허용하지만, 아래 결과 영역이 스프링으로 위치 보간되면 안 됩니다.

결과:

- `checkedClues`가 있으면 그룹 결과를 표시합니다.
- `checkedClues`가 없고 `activeFilters`가 있으면 필터 기준 그룹 결과를 표시합니다.
- 그룹별 최대 3건을 표시합니다.
- 그룹 헤더에는 `채팅하기` 액션을 둡니다.
- 일반 결과는 2열 카드 그리드로 표시합니다.

선택/채팅:

- 보고서 선택 개수는 프론트에서 임의 제한하지 않습니다.
- 선택 개수 초과 토스트는 카드 선택 시점이 아니라 채팅 세션 생성 API 실패 시점에 표시합니다.
- 선택된 보고서가 있으면 하단 CTA를 표시합니다.
- 하단 CTA 클릭 시 최대 2개 id를 전달합니다.
- 빈 상태 진입 시 선택 보고서와 토스트를 초기화합니다.

추천/최근:

- 최근 검색어는 query가 비어 있고 history가 있을 때 표시합니다.
- 최근 검색어 선택 시 query를 바꾸고 선택 보고서를 초기화합니다.
- 추천 보고서는 query가 비어 있고 최근 검색어가 5개 이상이며 추천 결과가 있을 때 표시합니다.

접근성:

- 검색 input, trigger, popup, listbox, option, toast, arrow button의 aria 속성을 유지합니다.
- 장식 icon은 `aria-hidden` 처리합니다.

## 16. AI 작업 지시문 예시

아래 예시는 구버전 참고용입니다. 실제 개발자용 AI에게 전달할 때는 `UI_SOURCE_OF_TRUTH.md`의 최신 지시문을 사용합니다.

```txt
UI_SOURCE_OF_TRUTH.md를 먼저 읽고, MAIN_UI_SCREEN_SPEC.md, MAIN_UI_REPLACEMENT_HANDOFF.md, MAIN_SCREEN_SPEC.md를 최신 기준으로 발굴보고서 메인 검색 화면을 구현해줘.

반드시 포함할 기능:
- 검색어 입력 및 submit
- 검색 결과 필터링
- 결과가 있는 검색어만 최근 검색어 저장
- 검색 도우미 팝업
- 지역/소재지/시대 단서 선택
- 선택 단서 칩 Swiper
- 단서 칩 활성/비활성
- 단서 개별 삭제와 전체 초기화
- 최근 검색어 Swiper
- 추천 보고서 Swiper
- 키워드별 그룹 결과
- 보고서 카드 선택/해제
- API 응답 기반 토스트
- 하단 fixed 채팅하기 CTA
- 빈 상태와 추천 검색어
- 접근성 aria 속성

디자인은 solvekdesignsystem-web/css의 기존 토큰, utility, component class를 우선 사용해줘.
검색바, 버튼, 칩, checkbox, icon을 새 CSS로 복제하지 말고 기존 디자인 시스템 class를 써줘.
Swiper arrow 버튼은 3.6rem이고, 단서 칩 arrow는 잘리거나 칩과 겹치면 안 돼.
검색어 입력이나 결과 전환 시 메인 결과 영역에는 LayoutGroup/layout position 애니메이션을 쓰지 마. 스크롤 중 검색해도 콘텐츠가 검색바와 겹치며 내려오면 안 돼.
```
