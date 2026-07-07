# SolveK Design System — AI 규칙

이 문서는 AI가 SolveK Design System 기준으로 페이지를 생성할 때 반드시 따라야 하는 규칙입니다.

> **마크업 예시의 단일 출처**: 컴포넌트 마크업은 반드시 `components/{name}/README.md`를 읽고 따른다. 이 문서의 컴포넌트 섹션은 규칙·클래스명·변형 요약만 제공한다.
> **웹 접근성 규칙**: 페이지 생성 시 반드시 `docs/accessibility.md` 를 읽고 준수한다.
> **SEO 규칙**: 페이지 생성 시 반드시 `docs/seo.md` 를 읽고 준수한다.

**스타일·상태·간격·타이포는 `css/index.css`가 불러오는 토큰·`default/`·`css/component/{name}.css`에 정의된 것만 사용**한다. HTML에는 인라인 `style`을 넣지 않으며, 내부 인라인 요소(`span`, `i` 등)에도 스타일을 우회해 붙이지 않는다.

---

## 1. 시스템 개요

- 공공기관/정부 프로젝트용 HTML/CSS 퍼블리싱 디자인 시스템
- 프레임워크 없이 순수 HTML + CSS + JS로 구성
- CSS 변수(Custom Properties) 기반 디자인 토큰 사용
- `css/index.css` 하나로 모든 토큰과 컴포넌트 CSS를 통합 호출
- 기본 폰트: Pretendard
- 기본 단위: rem (html font-size: 62.5%, 1rem = 10px)
- 접근성: KWCAG 2.1 기준 준수

### 1-1. 페이지(레이아웃) 폴더 구조

이 저장소 안에 보관하는 참조용 레이아웃은 사이트 성격에 따라 아래 폴더로 구분한다.

| 폴더 | 용도 |
|---|---|
| `solvek-web/` | 일반 웹사이트(공공기관 홈페이지 등) 레이아웃 |
| `solvek-map/` | 지도/GIS 기반 서비스 레이아웃 |
| `solvek-admin/` | 관리자 페이지 레이아웃 |

규칙:
- **페이지 생성 위치는 사용자가 정한다.** 디자인시스템 저장소 바깥에 만들 수도 있으므로, 출력 경로를 임의로 강제하지 않는다. 위 폴더는 이 저장소 안에 레이아웃을 보관할 때의 분류 기준일 뿐이다.
- 사용자가 "이 저장소 안에" 레이아웃을 만들어 달라고 했고 대상이 웹사이트/지도/관리자 중 명확하면 해당 폴더(`solvek-web`/`solvek-map`/`solvek-admin`)에 둔다. 대상이 불명확하면 사용자에게 먼저 확인한다.
- 어느 위치·폴더에 만들든 토큰·유틸 클래스·컴포넌트 마크업(`components/{name}/README.md`)·CSS(`css/index.css`) 기준은 동일하게 적용한다.
- `solvek-web/README.md`는 그 폴더의 참조 페이지가 어떤 컴포넌트로 구성되는지 안내하는 인덱스다. 마크업 단일 출처는 항상 `components/{name}/README.md`이며, `solvek-web/README.md`에 별도 마크업 예시를 추가하지 않는다.
- variant가 있는 컴포넌트(예: Breadcrumb의 webkit/admin)는 사이트 성격에 맞는 variant를 사용한다 — 관리자 페이지에서는 admin variant.

---

## 2. CSS 호출

페이지 생성 시 CSS는 하나만 호출합니다.

```html
<link rel="stylesheet" href="/css/index.css">
```

index.css 구성:
```
tokens/   → color, typography, spacing, radius
default/  → border, color, common, component, icon, layout, responsive, spacing, typography
component/ → button, input, search, textarea, checkbox, radio, chip, datepicker, select, shadow, modal, breadcrumb, meta-tag, header, footer, filter, applied-filter, pagination, board, map-control, region-select
(web 전용: header, footer, filter, applied-filter, pagination, board — solvek-web/components/{name}/ 참고 / map 전용: header, map-control, region-select — solvek-map/components/{name}/ 참고)
```

---

## 2-1. JS 호출

컴포넌트별 JS를 개별 파일로 분리하여 관리한다. 페이지 하단(`</body>` 직전)에서 필요한 파일만 호출한다.

```html
<script src="/js/modal.js"></script>
<script src="/js/datepicker.js"></script>
```

JS 파일 구조:
```
js/                          ← 공통 컴포넌트 JS
├── modal.js                 모달 열기/닫기/ESC
├── datepicker.js            flatpickr 초기화 (initPicker)
├── search-popup.js          검색 팝업 토글
├── textarea-counter.js      글자수 카운터 + 에러
├── password-toggle.js       비밀번호 보기/숨기기
├── checkbox.js              전체선택/indeterminate (initCheckAll)
├── view-toggle.js           보기 방식 전환
├── accordion.js             펼치기/접기 토글
└── filter-trigger.js        검색필터 트리거 토글

solvek-web/js/               ← 웹 전용 JS
├── header.js                GNB, 통합검색, 모바일 드로어
├── search-filter.js         검색 필터 아코디언, 기간 선택, 초기화
└── applied-filter.js        적용필터 칩 삭제/초기화

solvek-map/js/               ← 지도 전용 JS
├── map-header-search.js     지도 검색 드롭다운 + 키워드 하이라이트
├── region-select.js         지역 선택 탭/패널
└── control-panel.js         컨트롤 패널 토글
```

규칙:
- 인라인 `<script>` 금지 — 반드시 외부 JS 파일로 분리
- 공통 컴포넌트 JS는 `/js/` 경로, 사이트별 JS는 `solvek-{type}/js/` 경로
- 의존성이 있는 경우 순서대로 호출 (예: `datepicker.js` → `search-filter.js`)

---

## 3. 디자인 토큰

### 3-1. 색상 (tokens/color.css)

**사용 가능한 색상 팔레트 (전부 50~900 단계)**

| 팔레트 | CSS 변수 예시 | 주요 용도 |
|---|---|---|
| gray | `--gray-50` ~ `--gray-900` | 비활성, 보조 텍스트 |
| slate | `--slate-50` ~ `--slate-900` | 기본 텍스트, 테두리, 배경 |
| blue | `--blue-50` ~ `--blue-900` | 주요 CTA, 링크, 포커스 |
| sky-blue | `--sky-blue-50` ~ `--sky-blue-900` | 보조 강조 |
| navy | `--navy-50` ~ `--navy-900` | 진한 강조 |
| red | `--red-50` ~ `--red-900` | 에러, 경고 |
| orange | `--orange-50` ~ `--orange-900` | 주의 |
| yellow | `--yellow-50` ~ `--yellow-900` | 알림 |
| green | `--green-50` ~ `--green-900` | 성공 |
| blue-green | `--blue-green-50` ~ `--blue-green-900` | 보조 |
| teal | `--teal-50` ~ `--teal-900` | 보조 |
| teal-blue | `--teal-blue-50` ~ `--teal-blue-900` | 보조 |
| pink | `--pink-50` ~ `--pink-900` | 보조 |
| blue-purple | `--blue-purple-50` ~ `--blue-purple-900` | 보조 |
| violet | `--violet-50` ~ `--violet-900` | 보조 |
| mulberry | `--mulberry-50` ~ `--mulberry-900` | 보조 |

기본색: `--white: #fff`, `--black: #000`

**색상 유틸 클래스**

| 패턴 | 용도 | 예시 |
|---|---|---|
| `color-{palette}-{step}` | 텍스트 색상 | `color-slate-900`, `color-blue-500`, `color-red-500` |
| `bg-{palette}-{step}` | 배경 색상 | `bg-slate-50`, `bg-blue-500`, `bg-white` |
| `border-{palette}-{step}` | 테두리 색상 | `border-slate-200`, `border-blue-500`, `border-red-500` |

특수: `--overlay-50`, `--overlay-75`, `bg-popup-overlay` 오버레이 / `--scrollbar-thumb` / `--tap-highlight-slate`

**절대 금지: #fff, rgb(), hsl() 같은 하드코딩. 반드시 CSS 변수 또는 유틸 클래스 사용**

### 3-2. 타이포그래피 (tokens/typography.css)

**토큰 값**

| 토큰 | 값 |
|---|---|
| `--font-family-base` | Pretendard, -apple-system, BlinkMacSystemFont, sans-serif |
| `--font-weight-bold` | 700 |
| `--font-weight-semibold` | 600 |
| `--font-weight-medium` | 500 |
| `--font-weight-regular` | 400 |
| `--line-height-140` | 1.4 |
| `--line-height-160` | 1.6 |
| `--line-height-170` | 1.7 |
| `--letter-spacing-0` | 0 |
| `--letter-spacing-sm` | -0.2px |
| `--letter-spacing-md` | -0.3px |

**유틸 클래스 네이밍: `{타입}{순번}-{weight약자}-{px값}`**

weight 약자: `b`(bold), `sb`(semi-bold), `m`(medium), `r`(regular)

**Heading 클래스 (전체 목록)**

| 클래스 | 크기 | 굵기 |
|---|---|---|
| `heading1-b-48` | 48px | bold |
| `heading2-b-40` | 40px | bold |
| `heading3-b-36`, `heading3-m-36` | 36px | bold, medium |
| `heading4-b-32`, `heading4-sb-32`, `heading4-m-32`, `heading4-r-32` | 32px | bold, semi-bold, medium, regular |
| `heading5-b-30`, `heading5-sb-30`, `heading5-m-30`, `heading5-r-30` | 30px | bold, semi-bold, medium, regular |
| `heading6-b-28`, `heading6-sb-28`, `heading6-m-28`, `heading6-r-28` | 28px | bold, semi-bold, medium, regular |
| `heading7-sb-26`, `heading7-m-26`, `heading7-r-26` | 26px | semi-bold, medium, regular |
| `heading8-b-24`, `heading8-sb-24`, `heading8-m-24`, `heading8-r-24` | 24px | bold, semi-bold, medium, regular |
| `heading9-b-22`, `heading9-sb-22`, `heading9-m-22`, `heading9-r-22` | 22px | bold, semi-bold, medium, regular |
| `heading10-b-20`, `heading10-sb-20`, `heading10-m-20`, `heading10-r-20` | 20px | bold, semi-bold, medium, regular |

**Body 클래스 (전체 목록)**

| 클래스 | 크기 | 굵기 |
|---|---|---|
| `body1-b-18`, `body1-sb-18`, `body1-m-18`, `body1-r-18` | 18px | bold, semi-bold, medium, regular |
| `body2-b-16`, `body2-sb-16`, `body2-m-16`, `body2-r-16` | 16px | bold, semi-bold, medium, regular |
| `body3-b-14`, `body3-sb-14`, `body3-m-14`, `body3-r-14` | 14px | bold, semi-bold, medium, regular |
| `body4-b-13`, `body4-sb-13`, `body4-m-13`, `body4-r-13` | 13px | bold, semi-bold, medium, regular |
| `body5-b-12`, `body5-sb-12`, `body5-m-12`, `body5-r-12` | 12px | bold, semi-bold, medium, regular |

**Line-height 예외 유틸 클래스 (`css/default/typography.css`)**

타이포 클래스에 정의된 기본 `line-height`를 덮어써야 할 때만 사용한다.

| 클래스 | line-height |
|---|---|
| `line-auto` | normal |
| `line-140` | 1.4 (`--line-height-140`) |
| `line-160` | 1.6 (`--line-height-160`) |
| `line-170` | 1.7 (`--line-height-170`) |


### 3-3. 간격 (tokens/spacing.css)

**사용 가능한 값: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 32, 40, 48, 50, 60, 80, 92, 100, 120**

CSS 변수: `var(--spacing-16)` 등
유틸 클래스:

| 패턴 | 용도 | 예시 |
|---|---|---|
| `p-{n}` | padding 전체 | `p-16` |
| `px-{n}`, `py-{n}` | padding 좌우/상하 | `px-20`, `py-8` |
| `pt-{n}`, `pb-{n}`, `pl-{n}`, `pr-{n}` | padding 방향별 | `pt-16`, `pb-10` |
| `m-{n}` | margin 전체 | `m-0` |
| `mx-{n}`, `my-{n}` | margin 좌우/상하 | `my-12` |
| `mt-{n}`, `mb-{n}`, `ml-{n}`, `mr-{n}` | margin 방향별 | `mt-20`, `mb-6` |
| `gap-{n}` | gap (flex/grid) | `gap-8`, `gap-16` |
| `gap-x-{n}`, `gap-y-{n}` | column-gap/row-gap | `gap-x-16`, `gap-y-10` |

### 3-4. 라운드 (tokens/radius.css)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-xs-2` | 0.2rem | 미세 라운드 |
| `--radius-sm-4` | 0.4rem | 작은 라운드 |
| `--radius-md-6` | 0.6rem | 중간 라운드 |
| `--radius-md-8` | 0.8rem | 기본 라운드 (input, button 등) |
| `--radius-lg-16` | 1.6rem | 큰 라운드 |
| `--radius-full` | 10rem | 완전 원형 |

유틸 클래스: `radius-xs-2`, `radius-sm-4`, `radius-md-6`, `radius-md-8`, `radius-lg-16`, `radius-full` (각 토큰과 동일한 값의 `border-radius`)

---

## 4. 레이아웃 유틸

### 레이아웃 클래스 출처 (`css/default/layout.css`)

- **그리드·플렉스·포지션·너비·높이·z-index·`inner-default`·반응형 보조 등**(이 문서 **4-1 ~ 4-5**)은 **`css/default/layout.css`**에 선언된 선택자와, 해당 소절에 나온 **이름·조합**만 사용한다. **`m-*` / `p-*` / `gap-*` 등 간격 유틸**은 **3. 디자인 토큰**(간격) 표와 시스템에 정의된 값만 사용한다.
- **무작위·추측 금지.** 위 문서·`layout.css`·토큰 표에 근거 없는 클래스명을 HTML에만 덧붙이지 않는다. **4-6 ~ 4-8** 유틸도 **표에 있는 이름**과 **`css/default/`** 안 실제 정의를 확인해 사용한다.
- **신규 클래스는 예외일 때만**: 기존 클래스 조합으로도 표현할 수 없을 때에만, **`layout.css`**(간격·타이포 등이면 해당 **`css/default/`** 파일)에 **동일 이름으로 스타일을 정의**하고 필요 시 이 문서를 보강하는 흐름을 전제로 **제안**한다. **스타일 정의 없이 임의 `class`만 추가하는 것은 금지**한다.

### 4-1. 그리드

12컬럼 그리드 시스템:

| 클래스 | 설명 |
|---|---|
| `grid-column-default` | 12컬럼 기본 그리드 |
| `grid-column-sub-4` | 4컬럼 서브 그리드 |
| `grid-column-sub-8` | 8컬럼 서브 그리드 |
| `grid-column-sub-9` | 9컬럼 서브 그리드 |
| `grid-column-{1~12}` | 컬럼 span |
| `grid-row-{1~12}` | 로우 span |

### 4-2. 반응형 (inner-default)

`inner-default`: 자동 반응형 컨테이너

| 브레이크포인트 | max-width | padding 좌우 |
|---|---|---|
| > 1441px | 168rem | 12rem |
| ≤ 1440px | 144rem | 8rem |
| ≤ 1280px | auto | 5rem |
| ≤ 1024px | auto | 4.2rem |

`display-none-tablet`: 1280px 이하에서 숨김

### 4-3. Flex

| 클래스 | CSS |
|---|---|
| `flex` | display: flex |
| `flex-col` | flex-direction: column |
| `flex-row` | flex-direction: row |
| `flex-col-reverse` | flex-direction: column-reverse |
| `flex-wrap` | flex-wrap: wrap |
| `flex-nowrap` | flex-wrap: nowrap |
| `align-center` | align-items: center |
| `align-start` | align-items: flex-start |
| `align-end` | align-items: flex-end |
| `align-baseline` | align-items: baseline |
| `align-stretch` | align-items: stretch |
| `justify-start` | justify-content: flex-start |
| `justify-center` | justify-content: center |
| `justify-end` | justify-content: flex-end |
| `justify-between` | justify-content: space-between |
| `justify-around` | justify-content: space-around |
| `flex-center` | justify-content + align-items: center |
| `flex-between` | justify-content: justify-between + align-items: center |
| `flex-1` | flex: 1 |
| `flex-auto` | flex: 1 1 auto |
| `flex-none` | flex: 0 0 auto |
| `flex-shrink-0-auto` | flex: 1 0 auto |

### 4-4. Position

| 클래스 | CSS |
|---|---|
| `relative` | position: relative |
| `absolute` | position: absolute |
| `fixed` | position: fixed |
| `sticky` | position: sticky |
| `top-0`, `top-50`, `top-100` | top 위치 |
| `left-0`, `left-50` | left 위치 |
| `right-0`, `right-16`, `right-50` | right 위치 |
| `bottom-0`, `bottom-16`, `bottom-50` | bottom 위치 |
| `translate-x-50` | translateX(-50%) |
| `translate-y-50` | translate(-50%, -50%) |
| `translate-center` | translateY(-50%) |
| `z-index-{1~10,18,20,30,100}` | z-index |

### 4-5. Width / Height

| 클래스 | 값 |
|---|---|
| `w-full` | width: 100% |
| `w-auto` | width: auto |
| `w-fit` | width: fit-content |
| `w-screen` | width: 100vw |
| `w-100` | width: 10rem |
| `h-xs` | height: 2.8rem |
| `h-sm` | height: 3.2rem |
| `h-md` | height: 4rem |
| `h-lg` | height: 4.8rem |
| `h-xl` | height: 5.6rem |
| `h-2xl` | height: 6.4rem |
| `h-3xl` | height: 7.6rem |
| `h-32`, `h-36`, `h-40`, `h-48`, `h-56`, `h-64`, `h-72`, `h-80`, `h-88`, `h-96`, `h-104`, `h-112`, `h-120`, `h-128`, `h-136` | height: 3.2rem ~ 13.6rem (px값/10) |
| `h-full` | height: 100% |
| `h-screen` | height: 100vh |

### 4-6. 기타 유틸

| 클래스 | 설명 |
|---|---|
| `hidden` | display: none |
| `block` | display: block |
| `inline-block` | display: inline-block |
| `overflow-hidden` | overflow: hidden |
| `overflow-auto` | overflow: auto |
| `cursor-pointer` | cursor: pointer |
| `text-left`, `text-center`, `text-right` | text-align |
| `text-nowrap` | white-space: nowrap |
| `object-fit-cover`, `object-fit-contain` | object-fit |
| `transition-ease` | transition: all 0.6s ease |
| `hover-slate-50` | hover 시 bg-color: slate-50 |

### 4-7. Border

| 클래스 | 설명 |
|---|---|
| `border` | 1px solid |
| `border-none` | 없음 |
| `border-t`, `border-b`, `border-l`, `border-r` | 방향별 |
| `border-{palette}-{step}` | 색상 (gray-200~900, slate-50~900, blue-500, navy-500, green-500, teal-500, yellow-500, yellow-700, orange-500, red-500) |

### 4-8. 접근성

```html
<span class="blind">스크린 리더 전용 텍스트</span>
```

---

## 5. 아이콘

| 클래스 | 설명 | 크기 |
|---|---|---|
| `arrow-icon` | 드롭다운 화살표 (gray-900, 아래 방향) | 24×24 |
| `chevron-right-white` | 우측 꺽쇠 (white) — blue/slate 계열 버튼 아이콘 | 24×24 |
| `chevron-left-white` | 좌측 꺽쇠 (white) | 24×24 |
| `chevron-right-slate-700` | 우측 꺽쇠 (slate-700) — slate-50/transparent 계열 버튼 아이콘 | 24×24 |
| `chevron-down-white` | 아래 꺽쇠 (white) | 24×24 |
| `download-02-white` | 다운로드 (white) | 24×24 |
| `arrow-right-sm-white` | 우측 화살표 small (white) | 24×24 |
| `arrow-left-sm-white` | 좌측 화살표 small (white) | 24×24 |
| `search-icon-54` | 검색 (대) | 24×24 |
| `search-icon-40` | 검색 (소) | 20×20 |
| `eye-icon` | 비밀번호 숨김 | 24×24 |
| `eye-icon.active` | 비밀번호 보임 | 24×24 |
| `calendar-icon` | 달력 | 24×24 |
| `clock-icon` | 시계 | 24×24 |
| `close-icon` | 닫기 X (CSS ::before/after 생성) | 24×24 |
| `modal__close` | 모달 닫기 X (SVG 배경, 40×40 터치 영역) | 40×40 |
| `header-login-24` | 헤더 로그인 | 24×24 |
| `header-search-24` | 헤더 통합검색 | 24×24 |
| `header-menu-24` | 헤더 모바일 메뉴 | 24×24 |

> 위 표는 자주 쓰이는 아이콘 요약이며, `css/default/icon.css`에 정의된 전체 아이콘 목록·이미지 미리보기·사용법은 `components/icon/README.md`(+ `components/icon/spec.json`)를 참고한다.

---

## 6. 컴포넌트

### 마크업·스타일 단일 출처 (spec / README / CSS)

컴포넌트를 만들거나 수정할 때는 아래 세 파일을 **반드시 읽고** 따른다. 이 문서의 컴포넌트 섹션은 클래스 목록·규칙 요약만 제공하며, 마크업 예시의 단일 출처는 **`components/{name}/README.md`**다.

- **`components/{name}/spec.json`**: variant, 허용 클래스, 필수 속성·접근성 규칙 준수. 임의로 클래스명·DOM 구조 변경 금지.
- **`components/{name}/README.md`**: 마크업 예시·주석·금지 사항의 단일 출처. 반드시 읽고 그대로 맞춘다.
- **`css/component/{name}.css`**: 시각·상태(`:hover`, `:focus-visible`, `.active`, `disabled` 등)는 HTML이 아니라 CSS에만 둔다. 클래스명은 이 파일의 선택자를 근거로만 정한다 — 읽지 않고 추측으로 만들지 않는다.
- **인라인 `style` 금지.** `span`/`i`/`em` 등 내부 요소에도 `style=""`이나 spec·README·CSS에 없는 임의 클래스로 스타일 우회 금지.

> **공통 컴포넌트 vs web 전용 컴포넌트**
> - 아래 6-1~6-12는 모든 사이트에서 공통으로 쓰는 컴포넌트로, 정의는 루트 `components/{name}/`에 있다.
> - **web 레이아웃에서만 쓰는 컴포넌트(Header / Footer / Search Filter / Applied Filter / Pagination)는 `solvek-web/components/{name}/`에서 관리**한다. 마크업·규칙의 단일 출처는 `solvek-web/components/{name}/README.md` + `spec.json`이며, 사용처·목록은 `solvek-web/README.md`를 본다. (CSS는 `css/component/*.css`에 그대로 두고 `css/index.css`가 통합 호출)

### 상태 관리 공통 규칙

- **에러 상태**: `is-error`는 반드시 wrapper에만 추가. field에 직접 추가 금지.
- **hover/focus/disabled**: CSS 내부 처리. 클래스 추가 금지.
- **error-message**: 항상 DOM에 존재, CSS로 숨김/노출 처리. 인라인 스타일 금지.
- **팝업/드롭다운**: `active` 클래스 토글로만 제어.

### 6-1. Button

**네이밍: `{color}-button-{size}` 또는 `border-{color}-button-{size}`**

색상 7종:

| 접두사 | 용도 |
|---|---|
| `blue` | 주요 CTA |
| `border-blue` | 보조 액션 (blue 테두리) |
| `blue-50` | 주요 액션 보완 (blue 밝은 배경) |
| `slate` | 중립 액션 |
| `border-slate` | 중립 보조 액션 (slate 테두리) |
| `slate-50` | 약한 강조, 배경이 있는 중립 액션 |
| `transparent` | 배경 없는 텍스트형 액션 |

사이즈 5종: `48`, `40`, `36`, `32`, `28`

disabled 전용: `button-{size}` + `disabled` 속성 (색상 클래스 병용 금지)

아이콘 버튼: `icon-button-right` 또는 `icon-button-left` + `flex align-center` 필수

규칙:
- `type` 속성 반드시 명시 (button/submit/reset)
- 사이즈 없이 색상만 단독 사용 금지
- div/span으로 버튼 대체 금지

#### View Toggle (보기 방식 전환) variant

콘텐츠를 카드형/리스트형 등으로 전환해서 보는 보기 방식 토글 버튼 그룹.

**구조: `div.view-toggle[role=group][aria-label]` > `button.view-toggle__btn[aria-pressed]` > `i.{icon}-blue-icon.view-toggle__icon--active` + `i.{icon}-gray-icon.view-toggle__icon--inactive` + `span.body2-r-16.color-slate-700`**

규칙:
- 그룹 wrapper에 `role="group"` + `aria-label` 필수
- 각 버튼은 `button[type=button]` + `aria-pressed="true|false"` 필수, 한 그룹에 하나만 active
- 아이콘은 `dashboards-blue/gray-icon`, `list-blue/gray-icon` 등 정의된 클래스만 사용
- `.active` 클래스와 `aria-pressed`는 JS로 동기화 (JS 패턴 7-7 참조)

→ 마크업 예시: `components/button/README.md`

---

### 6-2. Input

**네이밍: `input-field-default-{size}` (size: 48, 40, 36)**

- 반드시 `input-wrapper`로 감쌀 것
- 에러: `is-error`는 wrapper에만, `error-message`는 항상 DOM에 존재
- 비밀번호: `eye-icon` 버튼으로 토글 (JS 섹션 참조)
- 아이콘 있는 input: `input-with-trailing-icon` 추가

→ 마크업 예시: `components/input/README.md`

### 6-3. Textarea

**클래스: `textarea-wrapper` > `textarea-field-default`**

- `is-error`는 wrapper에만 (textarea 테두리·counter 색·error-message 노출 자동 제어)
- 글자수 카운터: `<span class="counter">0</span>` (JS로 실시간 업데이트)

→ 마크업 예시: `components/textarea/README.md`

### 6-4. Search

4가지 variant:

| variant | 설명 | 사용 상황 |
|---|---|---|
| 선행형 (leading) | 아이콘 왼쪽 → input 오른쪽 | 모바일 검색창, GIS, 콘텐츠 내 검색 |
| 후행형 (trailing) | input 왼쪽 → 아이콘 오른쪽 | 웹 배치, 빠른 조회 |
| CTA 버튼형 | input + 버튼 조합 | 관리자 페이지, 필터/조건 검색 |
| 팝업형 | 최근 검색어 팝업 포함 | 메인 검색창, 통합 검색 |

사이즈 4종: `search-54`, `search-48`, `search-40`, `search-36`

| 사이즈 | 아이콘 | 폰트 |
|---|---|---|
| 54, 48 | `search-icon-54` | `body1-r-18` |
| 40, 36 | `search-icon-40` | `body2-r-16` / `body3-r-14` |

팝업: `search-popup`에 `active` 클래스 토글, 접근성 속성 필수 (JS 섹션 참조)

→ 마크업 예시: `components/search/README.md`

### 6-5. Checkbox

3가지 variant:

| variant | 구조 | 사용 상황 |
|---|---|---|
| basic | id/for 분리. `checkbox-basic checkbox-basic-{sm/md/lg}` | 폼, 설정, 테이블 |
| chip | label 감싸기. `checkbox-chip-label` > `checkbox-chip` | 태그, 카테고리 필터 |
| list | label 감싸기. `checkbox-list-label` > `checkbox-list` | 모바일 옵션 목록 |

- indeterminate(일부 선택): JS로만 설정 (JS 섹션 참조)
- basic형에서 label 감싸기 구조 금지 / chip·list형에서 id/for 분리 구조 금지

→ 마크업 예시: `components/checkbox/README.md`

### 6-6. Radio

3가지 variant:

| variant | 구조 | 사용 상황 |
|---|---|---|
| basic | id/for 분리. `radio-basic radio-basic-{sm/md/lg}`. 같은 `name` 필수 | 폼, 설정 |
| segment | label 감싸기. `radio-segment-label` > `radio-segment` | 탭 대체, 뷰 전환 |
| toggle | `radio-toggle-group` > `radio-toggle-label` > `radio-toggle` | ON/OFF, A/B 선택 |

→ 마크업 예시: `components/radio/README.md`

### 6-7. Select

**네이밍: `select-{size}` (size: 48, 40, 36)**

규칙:
- `select-wrapper` 없이 단독 사용 금지
- `select`에 반드시 `flex align-center` 추가 (텍스트 세로 정렬)
- `label`의 `for`와 `select`의 `id` 반드시 일치
- `aria-label` 반드시 포함
- 에러 시 `select`에 `aria-invalid="true"` 추가, `is-error`는 wrapper에만
- placeholder: `<option value="" disabled selected hidden>` 조합으로 구현

→ 마크업 예시: `components/select/README.md`

### 6-8. Datepicker

flatpickr@4.6.13 기반. 단일 날짜 / 기간 선택 2가지 variant.

추가 의존성 (페이지 head에 포함):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/l10n/ko.js"></script>
```

규칙:
- input id, label for, `data-datepicker-for` 반드시 일치
- `autocomplete="off"` 필수
- `input type="date"` 사용 금지
- 아이콘 있는 input: `input-with-trailing-icon` 추가
- JS 초기화: `initPicker('id')` / `initPicker('id', { mode: 'range' })` (JS 섹션 참조)

→ 마크업 예시: `components/datepicker/README.md`

### 6-9. Modal

2가지 타입: 일반 모달 / 이벤트성 모달 (`modal-container--event`, `modal--event`)

footer 3가지 레이아웃:

| 타입 | 구성 |
|---|---|
| type 1 | 버튼 1개 중앙 (`flex justify-center`) |
| type 2 | 버튼 2개 우측 정렬 (`flex justify-end gap-10`) |
| type 3 | 버튼 좌우 분리 (`flex justify-between`) |

규칙:
- `modal-container`에 반드시 `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 추가
- `modal__close` 버튼에 `aria-label="닫기"` 필수
- 페이지형 모달(긴 콘텐츠): `modal--page` 추가 (content max-height 1100px)
- `shadow-lg`는 `.modal`에 적용
- 열기/닫기는 JS로 처리 (JS 섹션 참조)

→ 마크업 예시: `components/modal/README.md`

### 6-10. Shadow

| 클래스 | 고도 | 대표 사용 상황 |
|---|---|---|
| `shadow-xs` | 낮음 | 기본 카드, 리스트 아이템 |
| `shadow-s` | 중간 | 드롭다운, 툴팁, 날짜 선택기 |
| `shadow-md` | 높음 | 모달, 팝업, 바텀시트 |
| `shadow-lg` | 최고 | 다이얼로그, 알림 토스트 |

규칙:
- `border`로 이미 구분된 요소에 중복 사용 금지
- 배경색이 투명한 요소에 사용 금지
- 고도 순서 역전 금지 (`shadow-xs` → `shadow-s` → `shadow-md` → `shadow-lg`)

### 6-11. Breadcrumb

페이지 상단 타이틀 + 현재 위치 경로. webkit(일반) / admin 2가지 variant.

**네이밍: `breadcrumb__{element}` (BEM)**

| variant | 타이틀 | 구분자 | gap |
|---|---|---|---|
| webkit | `heading4-b-32` | `breadcrumb-arrow` 아이콘 | `gap-16` / `gap-10` |
| admin | `heading9-sb-22` | `/` 텍스트 | `gap-8` / `gap-4` |

규칙:
- `header.breadcrumb > .inner-default.breadcrumb__inner > h1.breadcrumb__title + nav.breadcrumb__nav`
- `breadcrumb__nav`에 `aria-label="현재 위치"` 필수
- `breadcrumb__list`는 `ol > li` 구조, 마지막 항목은 `span[aria-current="page"]`
- 구분자에 `aria-hidden="true"` 필수

→ 마크업 예시: `components/breadcrumb/README.md`

---

### 6-12. Chip

선택/태그 표시용 칩. `.chip` + 레이아웃 유틸리티 클래스 조합으로 구성, 텍스트만 있는 기본형과 삭제 아이콘이 있는 형태, 목록 형태 지원.

**구성: `chip border-slate-500 border h-36 w-fit px-12 radius-md-6 flex align-center justify-center bg-white` + `span.body2-r-16.color-slate-700`**

규칙:
- 삭제 가능한 칩은 `gap-6` 추가 + `chips-close-icon` 버튼(`button[type=button]` + `span.blind`로 "삭제")
- 여러 개 나열 시 `ul.flex.gap-8 > li > div.chip(...)` 구조
- 선택 입력이 필요한 태그 필터는 `components/checkbox`의 chip variant 사용, 단순 표시용은 이 컴포넌트 사용

→ 마크업 예시: `components/chip/README.md`

---

### 6-13. Meta Tag

API·데이터셋 등 정보 리소스의 카테고리 분류(대/중/소분류 등)를 표시하는 정적 태그. 분류 value만 노출하며 클릭·필터·선택 동작 없음.

**구조: `ul.meta-tag-list` > `li` > `span.meta-tag[.meta-tag--active]`**

| 유형 | 클래스 | 스타일 |
|---|---|---|
| 기본 | `meta-tag` | `slate-50` 배경 + `slate-700` 텍스트 (semibold) |
| 강조 | `meta-tag--active` | `blue-50` 배경 + `blue-500` 텍스트 (medium) |

규칙:
- `span.meta-tag`에 분류 value 텍스트만 사용 (`button`/`a` 금지, `role`/`aria-pressed` 불필요)
- 여러 depth 나열 시 `ul.meta-tag-list > li` 구조
- 조회수·등록일 등 비분류 메타, 필터/선택 UI에는 사용 금지 — 삭제 가능한 태그는 `components/chip` 사용

→ 마크업 예시: `components/meta-tag/README.md`

---

## 7. JS 패턴

> 이 시스템은 순수 JS로 동작한다. 프레임워크 없이 아래 패턴을 그대로 사용한다.
> 모든 JS는 외부 파일(`js/`, `solvek-web/js/`, `solvek-map/js/`)로 분리되어 있다. 코드 예시는 해당 파일의 실제 내용과 동일하다.

### 7-1. 모달 열기/닫기

```js
function openModal(containerId) {
  const container = document.getElementById(containerId);
  container.style.display = 'flex';
  container.focus();
  document.body.style.overflow = 'hidden';
}

function closeModal(containerId) {
  const container = document.getElementById(containerId);
  container.style.display = 'none';
  document.body.style.overflow = '';
}

// 닫기 버튼, 오버레이 클릭 연결
document.querySelectorAll('[data-modal-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
});
document.querySelectorAll('.modal-container').forEach(container => {
  container.addEventListener('click', e => {
    if (e.target === container) closeModal(container.id);
  });
});

// ESC 키 닫기
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-container').forEach(c => {
      if (c.style.display !== 'none') closeModal(c.id);
    });
  }
});
```

### 7-2. Datepicker 초기화 (flatpickr)

```js
function initPicker(inputId, options = {}) {
  const input = document.getElementById(inputId);
  const calBtn = document.querySelector(`[data-datepicker-for="${inputId}"]`);

  const picker = flatpickr(input, {
    locale: 'ko',
    dateFormat: 'Y-m-d',
    disableMobile: true,
    ...options
  });

  if (calBtn) {
    calBtn.addEventListener('click', () => picker.toggle());
  }
}

// 단일 날짜
initPicker('datepicker-id');

// 기간 선택
initPicker('datepicker-range-id', { mode: 'range' });
```

### 7-3. 체크박스 전체선택 / indeterminate

```js
function initCheckAll(masterId, itemSelector) {
  const master = document.getElementById(masterId);
  const items = document.querySelectorAll(itemSelector);

  function syncMaster() {
    const checkedCount = [...items].filter(i => i.checked).length;
    master.checked = checkedCount === items.length;
    master.indeterminate = checkedCount > 0 && checkedCount < items.length;
  }

  master.addEventListener('change', () => {
    items.forEach(item => { item.checked = master.checked; });
    syncMaster();
  });

  items.forEach(item => item.addEventListener('change', syncMaster));
  syncMaster();
}

// 사용 예
initCheckAll('checkall-master', '.item-checkbox');

// 또는 HTML에서 자동 초기화
// <input id="checkall-master" data-checkall-target=".item-checkbox">
```

### 7-4. 비밀번호 보기/숨기기 토글

```js
document.querySelectorAll('.eye-icon').forEach(icon => {
  icon.closest('button').addEventListener('click', () => {
    const wrapper = icon.closest('.input-wrapper, .relative');
    const input = wrapper.querySelector('input[type="password"], input[type="text"]');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.classList.toggle('active', isHidden);
  });
});
```

### 7-5. 검색 팝업 토글

```js
document.querySelectorAll('.search-wrapper').forEach(wrapper => {
  const input = wrapper.querySelector('.search-input');
  const popup = wrapper.querySelector('.search-popup');

  input?.addEventListener('focus', () => popup?.classList.add('active'));

  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) popup?.classList.remove('active');
  });
});
```

### 7-6. Textarea 글자수 카운터

```js
document.querySelectorAll('.textarea-wrapper').forEach(wrapper => {
  const textarea = wrapper.querySelector('textarea');
  const counter = wrapper.querySelector('.counter');
  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    counter.textContent = textarea.value.length;
  });
});
```

### 7-7. View Toggle 보기 전환

```js
document.querySelectorAll('.view-toggle').forEach((group) => {
  group.querySelectorAll('.view-toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.view-toggle__btn').forEach((item) => {
        item.classList.remove('active');
        item.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    });
  });
});
```

### 7-8. 펼치기/접기 토글 (button-arrow-icon)

```js
document.querySelectorAll('[aria-expanded]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.classList.toggle('active', !expanded);
  });
});
```

### 7-9. 검색필터 트리거 토글 (filter-icon)

```js
document.querySelectorAll('[data-filter-trigger]').forEach((btn) => {
  const icon = btn.querySelector('.filter-icon');
  btn.addEventListener('click', () => {
    const pressed = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!pressed));
    btn.classList.toggle('active', !pressed);
    icon?.classList.toggle('active', !pressed);
  });
});
```

---

## 8. 절대 금지 사항

1. **색상 하드코딩** — #fff, rgb(), hsl() 등 사용 금지. 반드시 CSS 변수 또는 유틸 클래스
2. **정의되지 않은 임의 클래스 생성** — **토큰·색·타이포·간격(`mb-*` 등)**은 이 문서 **3. 디자인 토큰**에 나온 것만. **그리드·flex·position·너비·높이·z-index·`inner-default` 등**(4-1~4-5)은 **`css/default/layout.css`**와 이 문서 **4**절에 근거한 클래스만. **컴포넌트**는 `spec.json`, `css/component/{name}.css`, `README.md` 세 곳에 근거한 클래스만
3. **인라인 스타일** — `style` 속성 금지(루트·내부 인라인 요소 모두)
4. **wrapper 없이 폼 컴포넌트 단독 사용** — input, textarea, select는 반드시 wrapper로 감싸야 함
5. **is-error를 field에 직접 추가** — 반드시 wrapper에만 추가
6. **hover/focus 상태를 클래스로 추가** — CSS 내부 처리됨
7. **div/span으로 button, input 대체** — 시맨틱 태그 사용
8. **input type="date" 사용** — 반드시 flatpickr datepicker 사용
9. **토큰에 없는 값 사용** — spacing, font-size, radius 등 정의된 토큰만 사용
10. **basic형 checkbox/radio에서 label 감싸기 구조 사용** — 반드시 id/for 분리
11. **chip/list/segment/toggle형에서 id/for 분리 구조 사용** — 반드시 label 감싸기
12. **radio에서 name 속성 누락** — 같은 그룹은 반드시 동일 name
13. **내부 인라인 요소에 스타일 우회** — `span`/`i` 등에 `style`이나 spec·README·CSS에 없는 임의 클래스 금지
14. **레이아웃·유틸 클래스 무작위 추가** — 4-1~4-5·`layout.css` 범위 이름을 추측해 붙이지 않는다
15. **컴포넌트 마크업을 README 없이 작성** — 반드시 `components/{name}/README.md`를 읽고 따른다

---

## 9. 페이지 생성 시 기본 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목 | 솔브케이</title>

  <!-- 기본 메타 -->
  <meta name="description" content="페이지 설명">
  <meta name="keywords" content="ui, ux, publishing, solvek">
  <meta name="author" content="Solvek">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="페이지 제목 | 솔브케이">
  <meta property="og:description" content="페이지 설명">
  <!-- <meta property="og:image" content="https://example.com/image.jpg"> -->
  <!-- <meta property="og:url" content="https://example.com/page"> -->

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="페이지 제목 | 솔브케이">
  <meta name="twitter:description" content="페이지 설명">
  <!-- <meta name="twitter:image" content="https://example.com/image.jpg"> -->

  <link rel="stylesheet" href="/css/index.css">
</head>
<body>
  <div class="inner-default">
    <!-- 컨텐츠 -->
  </div>

  <!-- 필요한 JS만 호출 -->
  <!-- <script src="/js/modal.js"></script> -->
  <!-- <script src="/js/datepicker.js"></script> -->
</body>
</html>
```
