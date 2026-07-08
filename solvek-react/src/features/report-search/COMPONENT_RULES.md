# Report Search Component Rules

> 최신 기준 요약입니다. 이 섹션을 우선하고, 전체 상세 명세는 `MAIN_SCREEN_SPEC.md`를 확인합니다.

## 최신 컴포넌트 책임

### MainSearchPage

메인 화면 상태와 이벤트를 소유하는 컨테이너입니다.

관리 상태:

- `query`: 검색어
- `mode`: 화면 모드
- `searchHistory`: 최근 검색어
- `helperOpen`: 검색 도우미 팝업 열림 여부
- `activeFilters`: 필터 레일 선택값
- `clues`: 검색 도우미에서 추가한 단서
- `checkedClues`: 활성화된 단서 칩
- `selectedReports`: 선택 보고서 id 목록
- `toastVisible`: 선택 제한 토스트 표시 여부

규칙:

- API 호출 또는 API 응답 매핑은 컨테이너 또는 별도 service/hook에서 처리합니다.
- 섹션 컴포넌트에는 화면 표시와 이벤트 callback만 넘깁니다.
- 보고서 선택 최대 2건 제한은 이 컨테이너에서 일관되게 처리합니다.
- 결과 없음 상태에서는 선택 보고서와 토스트를 초기화합니다.

### HelperMenu

검색 도우미 팝업입니다.

- 카테고리와 옵션 목록을 표시합니다.
- 옵션 선택 시 `onToggleClue(value)`만 호출합니다.
- 바깥 클릭 시 닫히는 처리는 상위에서 관리합니다.
- 키보드 이동과 option role을 유지합니다.

### ClueChips

검색 도우미에서 선택한 단서를 보여주는 공통 칩입니다.

- 활성 칩은 blue 상태로 표시합니다.
- 체크 아이콘은 표시하지 않습니다.
- 칩 개별 삭제와 전체 초기화를 지원할 수 있습니다.
- 전체 초기화 시 아래 콘텐츠가 부드럽게 올라오도록 transition을 유지합니다.
- 메인과 챗봇에서 공통으로 사용할 수 있는 구조를 유지합니다.

### RecentReports

최근 검색어 슬라이더입니다.

- 검색바 바로 아래에 표시합니다.
- 추천 보고서보다 위에 위치합니다.
- 항목 클릭 시 검색어 선택 callback을 호출합니다.

### RecommendSlider

추천 보고서 슬라이더입니다.

- 전체 보고서 리스트 또는 그룹 리스트 바로 위에 표시합니다.
- 아래 여백은 42px입니다.
- 보고서 선택 규칙은 `ReportGrid` 카드와 동일합니다.

### ResultHeader

결과 수와 보조 액션을 표시합니다.

- 일반 목록에서는 `총 N건`을 표시합니다.
- 그룹/필터 문맥에서는 `{키워드} N건`을 표시합니다.
- 필요한 경우 `채팅하기` 액션을 표시합니다.

### ReportGrid

보고서 카드 그리드입니다.

- 카드 클릭은 `onToggle(id)`만 호출합니다.
- 직접 선택 제한을 판단하지 않습니다.
- 검색어 하이라이트는 제목, 요약, 태그에 적용합니다.

### GroupedReportSections

키워드별 그룹 결과입니다.

- `groups: { label, reports }[]`를 받아 표시합니다.
- 그룹 헤더 오른쪽 `채팅하기`는 `onChat(group.reports)`를 호출합니다.
- 3건 이상 제한 처리와 토스트는 상위에서 처리합니다.

### EmptyState

검색 결과 없음 화면입니다.

- 검색 실패 문구와 추천 검색어 버튼을 표시합니다.
- 추천 검색어 버튼 클릭은 `onSuggestion(text)`를 호출합니다.

## 최신 CSS 규칙

- 디자인 시스템 CSS를 우선 사용합니다.
- 색상은 `blue-500`, `slate-*` 토큰 기준으로 사용합니다.
- 의미 없는 `prototype-*` 클래스는 만들지 않습니다.
- 칩 활성 상태는 색상으로만 표현하고 체크 아이콘은 넣지 않습니다.
- 추천 보고서 아래 여백은 42px입니다.
- 반응형에서는 카드 그리드가 1열로 내려가도 기능은 동일해야 합니다.

## 최신 JS 규칙

- 검색어 필터링 기준은 `title`, `summary`, `tags`입니다.
- 최근 검색어는 검색 성공 시에만 저장합니다.
- 최근 검색어는 중복 제거 후 최대 5개입니다.
- 보고서 선택은 최대 2건입니다.
- 초과 시 `최대 2건만 가능합니다` 토스트를 1800ms 표시합니다.
- 그룹 `채팅하기`에서 3건 이상이면 앞 2건만 선택하고 바로 이동하지 않습니다.

---

이 문서는 발굴보고서 검색 화면의 TSX 구조를 기준으로 한 컴포넌트 작성 규칙입니다. 이후 챗봇 화면, API 연동, 백엔드 전달 문서를 만들 때 이 기준을 유지합니다.

## Folder Roles

- `MainSearchPage.tsx`: 화면 단위 컨테이너입니다. 검색 상태, 선택 상태, 필터 상태, 화면 모드, 이벤트 핸들러를 관리합니다.
- `components/ReportSearchSections.tsx`: 재사용 가능한 화면 섹션과 UI 컴포넌트를 둡니다. 가능하면 props로 받은 값만 표시하고, 상위 상태를 직접 변경하지 않습니다.
- `data.ts`: 프로토타입용 임시 데이터와 옵션 목록을 둡니다. 실제 API 연동 시 가장 먼저 교체될 파일입니다.
- `types.ts`: 화면에서 공유하는 타입을 둡니다. 백엔드 응답 스키마와 맞춰야 하는 기준 파일입니다.
- `motionConfig.ts`: Framer Motion 설정값을 둡니다. 컴포넌트마다 임의의 spring/ease 값을 새로 만들지 않습니다.

## Component Responsibility

### Page Container

`MainSearchPage`는 아래 역할만 담당합니다.

- 검색어 `query` 관리
- 화면 모드 `ViewMode` 관리
- 최근 검색어, 필터, 단서, 선택 보고서 상태 관리
- 검색/선택/필터 토글 같은 이벤트 핸들러 정의
- 조건에 따라 섹션 컴포넌트를 조합

`MainSearchPage`에는 카드 마크업, 슬라이더 마크업, 빈 상태 마크업처럼 반복되는 UI 세부 구조를 직접 추가하지 않습니다. 새 UI 블록이 생기면 `components` 파일로 분리합니다.

### Section Components

`ReportSearchSections.tsx`의 exported component는 화면 섹션 단위로 유지합니다.

- `HelperMenu`: 검색 도우미 카테고리와 옵션 선택
- `ClueChips`: 선택한 단서 칩 표시, 체크, 전체 초기화
- `FilterRail`: 필터 칩 목록
- `RecentReports`: 최근 검색어 슬라이더
- `RecommendSlider`: 추천 보고서 슬라이더
- `ResultHeader`: 결과 개수와 보조 액션
- `ReportGrid`: 보고서 카드 목록
- `GroupedReportSections`: 활성 키워드별 보고서 그룹 목록
- `EmptyState`: 검색 결과 없음 상태

내부 보조 컴포넌트는 export하지 않습니다. 예: `ReportCard`, `highlightMatch`, `sliderNavButtonStyle`.

## Props Rules

- 컴포넌트 props는 명확한 이름으로 작성합니다.
- 상위 상태를 바꾸는 함수는 `onToggle`, `onChoose`, `onRemove`, `onSuggestion`처럼 `on` 접두사를 사용합니다.
- boolean props는 의미가 드러나게 작성합니다. 예: `selected`, `showChat`.
- 데이터 목록 props는 복수형을 사용합니다. 예: `reports`, `selectedReports`, `checkedClues`.
- 컴포넌트 내부에서 서버 데이터 형태를 추측하지 않습니다. 데이터 구조는 `types.ts`를 기준으로 합니다.

## State Rules

- 화면 전체 흐름에 영향을 주는 상태는 `MainSearchPage`에 둡니다.
- 슬라이더 인스턴스, 키보드 포커스 인덱스처럼 컴포넌트 내부에서만 필요한 상태는 해당 컴포넌트에 둡니다.
- `selectedReports`는 현재 최대 2개까지 허용합니다. 제한 변경 시 `toggleReport`와 토스트 문구를 같이 수정합니다.
- `clues`와 `checkedClues`는 분리합니다. `clues`는 표시할 단서 목록이고, `checkedClues`는 활성화된 단서 목록입니다.
- `checkedClues` 또는 `activeFilters`가 있으면 키워드별 `ReportGroup[]`를 만들어 그룹 결과를 표시합니다.
- `ViewMode` 값은 `types.ts`에서만 추가/수정합니다.

## Data Rules

현재 `Report` 타입은 아래 필드를 사용합니다.

```ts
{
  id: number;
  year: string;
  title: string;
  summary: string;
  tags: string[];
}
```

API 연동 시에는 `reportData`를 직접 컴포넌트에서 수정하지 말고, 별도 hook 또는 service를 만든 뒤 `MainSearchPage`에서 받아 섹션 컴포넌트로 내려줍니다.

키워드 그룹 결과는 아래 구조를 기준으로 합니다.

```ts
{
  label: string;
  reports: Report[];
}
```

## Styling Rules

- 기존 디자인시스템 class를 우선 사용합니다.
- 새 인라인 스타일은 위치, 동적 애니메이션, 라이브러리 제어처럼 class로 표현하기 어려운 경우에만 사용합니다.
- 색상은 `var(--blue-500)`, `var(--slate-200)`처럼 토큰을 사용합니다.
- 아이콘은 디자인시스템 icon class를 우선 사용합니다. 예: `filter-icon`, `main-search-blue-icon`, `chevron-right-slate-700`.
- 버튼/칩/카드 스타일은 `solvekdesignsystem-web/css`에 있는 기존 component class를 재사용합니다.
- 의미 없는 식별용 class는 추가하지 않습니다. 디자인시스템 유틸 class와 실제 스타일이 연결된 class만 사용합니다.
- checkbox chip은 체크 아이콘을 표시하지 않고, 활성 상태는 blue border/background/text로만 표현합니다.

## Motion Rules

- 공통 motion 값은 `motionConfig.ts`에서 가져옵니다.
- 클릭 피드백은 기본적으로 `tapScale`을 사용합니다.
- 페이지/섹션 출입 애니메이션은 `fadeEase`, `springSnappy`, `springSoft` 중에서 선택합니다.
- 같은 성격의 UI에 서로 다른 transition 값을 새로 만들지 않습니다.
- 칩 영역처럼 컨텐츠가 사라지며 아래 영역이 이동하는 UI는 `LayoutGroup`과 `layout="position"`을 함께 사용합니다.
- 키워드 그룹 섹션도 카드 정렬 변화가 자연스럽게 보이도록 가능한 경우 layout transition을 유지합니다.

## Accessibility Rules

- 버튼에는 목적을 알 수 있는 `aria-label`을 둡니다.
- 장식 아이콘에는 `aria-hidden="true"`를 둡니다.
- 검색 도우미 팝업은 `role="dialog"`와 `aria-expanded`, `aria-controls`를 유지합니다.
- 옵션 목록은 `role="listbox"`, 항목은 `role="option"` 구조를 유지합니다.
- 키보드 조작이 필요한 목록은 `ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Space` 대응을 유지합니다.

## Backend Handoff Rules

백엔드 개발자에게 전달할 때는 아래 항목을 기준으로 설명합니다.

- 검색 요청 입력값: `query`, `clues`, `activeFilters`
- 검색 결과 출력값: `Report[]`
- 그룹 검색 출력값: `{ label: string; reports: Report[] }[]`
- 최근 검색어: `searchHistory`
- 추천 기준: 최근 검색어 또는 선택 보고서
- 채팅 시작 입력값: `selectedReports`의 report `id` 목록
- 그룹 헤더 `채팅하기`가 3건 이상일 경우에는 API 호출 전 프론트에서 앞 2건만 선택 상태로 만들고 토스트를 표시합니다.

API가 붙으면 화면 컴포넌트는 가능하면 변경하지 않고, 데이터 공급 위치만 교체합니다.

## Naming Rules

- 화면 컴포넌트: `*Page`
- 섹션 컴포넌트: 의미 중심 이름 사용. 예: `ReportGrid`, `RecentReports`
- 이벤트 핸들러: `handle*`, `toggle*`, `choose*`
- derived value: `shownReports`, `recommendedReports`, `resultCount`
- 임시 데이터: `data.ts`에 명사형 plural 또는 collection 이름 사용

## Do Not

- `App.tsx`에 화면 세부 UI를 다시 추가하지 않습니다.
- `ReportSearchSections.tsx`에서 백엔드 호출을 직접 하지 않습니다.
- 같은 데이터 타입을 여러 파일에 중복 선언하지 않습니다.
- 디자인시스템에 이미 있는 버튼, 칩, 아이콘 class를 새로 만들지 않습니다.
- 접근성 속성이나 키보드 이벤트를 제거하지 않습니다.
- 공통 `ClueChips`를 화면별로 복제하지 않습니다.
