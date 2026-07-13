# Claude Code Implementation Guide

이 문서는 Python 백엔드 개발자와 Claude Code가 현재 React 프로토타입을 기준으로 새 UI를 재구현하기 위한 구현 지시서입니다. 최신 챗봇/이미지/지도 배치 기준은 루트의 `AI_DEVELOPER_CHATBOT_HANDOFF.md`가 최우선입니다.

## Read This First

1. `AI_DEVELOPER_CHATBOT_HANDOFF.md`
2. `UI_SOURCE_OF_TRUTH.md`
3. `DEVELOPER_HANDOFF.md`
4. `PROTOTYPE_OVERVIEW.md`
5. `CLAUDE_CODE_IMPLEMENTATION_GUIDE.md`
6. `solvek-react/src/features/report-search/README.md`
7. `solvek-react/src/features/report-search/MAIN_UI_SCREEN_SPEC.md`
8. `solvek-react/src/features/report-search/MAIN_UI_REPLACEMENT_HANDOFF.md`
9. `solvek-react/src/features/report-search/PROTOTYPE_FLOW.md`
10. `solvek-react/src/features/report-search/COMPONENT_RULES.md`
11. `solvek-react/src/features/report-chat/README.md`
12. `solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md`
13. `solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md`
14. `solvek-react/src/features/report-chat/PROTOTYPE_FLOW.md`
15. `solvek-react/src/features/report-chat/COMPONENT_RULES.md`
16. `solvekdesignsystem-web/README.md`
17. `solvekdesignsystem-web/CLAUDE.md`

## Product Goal

가야역사문화권 발굴보고서를 검색하고, 선택한 보고서로 AI 챗봇 대화를 시작하는 UI를 만든다. 이 git 자체가 UI 원본이며, 현재 React 화면과 CSS 디자인시스템을 기준으로 동일하게 구현한다. 선택 가능한 보고서 수는 프론트에서 임의로 고정하지 않고, 채팅 세션 생성 API 응답을 기준으로 처리한다. 챗봇 답변은 근거 원문, 지도 근거, 이미지 업로드 기반 유사후보, 지도 위 도면 이미지 배치 UX로 이어질 수 있어야 한다.

핵심 사용 흐름:

1. 사용자가 메인 검색 화면에서 보고서를 검색한다.
2. 검색 도우미에서 지역, 소재지, 시대 단서를 추가한다.
3. 추가한 단서 칩을 클릭해 활성화한다.
4. 활성화된 키워드별로 결과가 그룹화되어 표시된다.
5. 사용자는 보고서를 직접 선택하거나 그룹 헤더의 `채팅하기`를 누른다.
6. 선택한 보고서 id 전체를 채팅 시작 흐름으로 넘긴다.
7. 챗봇 화면에서 선택 보고서 목록, 질문 추천, 메시지 입력, 원문/지도 패널을 사용한다.
8. 이미지를 업로드해 질문하면 AI가 PDF에서 추출한 도면/페이지 이미지 후보를 반환하고, 사용자는 후보 이미지를 지도 위에 맞춰 적용/수정/삭제할 수 있다.

## Technology Assumption

최종 개발은 Python 백엔드 개발자가 진행한다. 프론트엔드는 현재 React 프로토타입을 그대로 옮기거나, Python 웹 프레임워크 템플릿과 JavaScript로 재구현할 수 있다.

권장 백엔드 선택지:

- FastAPI + Jinja2 templates + static CSS/JS
- Django + templates + static CSS/JS
- FastAPI/Django API + 별도 프론트엔드

어떤 방식을 쓰더라도 화면 구조, CSS class, 상태 흐름은 이 문서와 React TSX를 기준으로 맞춘다.

## Required Screens

### 1. Report Search Main

역할:

- 발굴보고서 검색 진입 화면
- 검색어 입력
- 검색 도우미 팝업
- 선택 단서 칩
- 키워드별 결과 그룹
- 보고서 카드 선택
- 하단 `채팅하기` CTA
- 결과 없음 상태
- API 응답 기반 토스트

필수 UI:

- 상단 제목: `대화할 발굴보고서를 선택하거나 입력해보세요`
- 설명: `AI는 선택한 1개 보고서를 기준으로 요약, 위치, 유구·유물 정보를 답변합니다.`
- 검색창: 필터 아이콘, 입력창, 검색 버튼
- 필터 아이콘 hover/focus tooltip: `검색 도우미`
- 검색 도우미 팝업: 카테고리 패널 + 옵션 패널
- 선택 단서 칩: 체크 아이콘 없이 blue 활성 스타일만 사용
- 그룹 결과 헤더: `{키워드} {count}건` + `채팅하기`
- 보고서 카드: 제목, 연도, 요약, 태그
- 하단 CTA: 선택 보고서가 1건 이상이면 표시
- 토스트: 채팅 세션 생성 API가 반환한 사용자 표시용 메시지

### 2. Report Chat

역할:

- 선택 보고서 기반 AI 챗봇 화면
- 왼쪽 선택 보고서 패널
- 중앙 대화/추천 질문/입력창
- 보고서 추가 검색 모달
- 오른쪽 원문 패널

필수 UI:

- 왼쪽 패널: 홈으로, 검색, 전체 선택, 보고서 체크 목록
- 왼쪽 패널 resize: 가운데 선 hover 시 `slate-200` 선과 `col-resize`
- 최소 너비 이하로 줄이면 패널 접힘
- 접힌 뒤 왼쪽 arrow 버튼으로 다시 펼침
- 중앙 헤더: 대표 보고서명 + 선택 건수
- 선택 보고서가 없으면 `보고서를 선택해주세요`
- 추천 질문 버튼 목록
- 메시지 입력창: 첨부 아이콘, 검색/전송 아이콘
- AI 답변 근거: `원문 p.12 ~ 16`, `지도`
- 원문 버튼 클릭 시 오른쪽 원문 패널 표시
- 이미지 첨부 후 전송 시 AI 유사후보 카드 표시
- 유사후보 `지도에서 보기` 클릭 시 오른쪽 지도 패널과 도면 이미지 배치 UX 표시
- 지도 이미지 적용 전에는 이동/비율 유지 resize/회전/투명도/삭제/초기화 가능
- `이미지 적용 완료` 후에는 기존 토스트 UI로 `적용 완료` 표시, 지도 좌표 고정, 수정/삭제 관리 패널 제공
- 오른쪽 상단 layout icon으로 원문/지도 패널 접기/펼치기
- 오른쪽 원문/지도 패널 resize 가능

## Search Feature Rules

### Search Query

검색 대상 필드:

- `title`
- `summary`
- `tags`

검색어가 있으면 위 필드에 포함되는 보고서를 표시한다. 검색 결과가 없으면 `EmptyState`를 표시한다.

결과 없음 처리:

- 선택 보고서 초기화
- 하단 CTA 숨김
- 토스트 닫기
- 추천 검색어 버튼 표시

### Helper Menu

검색창 왼쪽의 `filter-icon` 버튼 클릭 시 열린다.

카테고리:

- 지역
- 소재지
- 시대

동작:

- 카테고리 클릭 시 오른쪽 옵션 목록 표시
- 옵션 클릭 시 `clues`에 추가/삭제
- 팝업 외부 클릭 시 닫힘
- 키보드 조작 지원: ArrowUp, ArrowDown, Home, End, Enter, Space
- 옵션 선택 상태는 텍스트 blue 또는 배경으로 표시할 수 있다

### Clue Chips

단서가 하나 이상 있으면 검색창 아래 표시한다.

동작:

- 칩 클릭 시 활성/비활성 토글
- 활성 상태는 `border-color: blue-500`, `background: blue-50`, `color: blue-500`
- 체크 아이콘은 표시하지 않는다
- 개별 X 삭제는 쓰지 않는다
- `초기화` 버튼으로 전체 단서와 활성 상태를 초기화한다
- 칩은 가로 스크롤 가능해야 한다
- 칩 영역이 나타나거나 사라질 때 결과 컨텐츠가 자연스럽게 내려가거나 올라와야 한다

### Grouped Results

활성화된 칩이 있으면 결과를 키워드별 섹션으로 묶는다.

그룹 기준:

1. `checkedClues`가 있으면 `checkedClues` 기준
2. `checkedClues`가 없고 필터가 있으면 `activeFilters` 기준
3. 둘 다 없으면 단일 결과 목록

각 그룹은 아래 구조를 가진다.

```ts
type ReportGroup = {
  label: string;
  reports: Report[];
};
```

그룹 헤더:

- 왼쪽: `{label} {reports.length}건`
- 오른쪽: `채팅하기` + 오른쪽 chevron icon

그룹 카드:

- 2열 그리드
- 그룹 안에서 선택된 카드는 blue border
- 검색어와 매칭되는 텍스트는 blue highlight

프로토타입 데이터에 실제 매칭 결과가 없을 경우에는 화면 검증을 위해 현재 결과 후보 중 앞 3건을 임시로 표시할 수 있다. 실제 API 연결 후에는 백엔드가 그룹별 결과를 정확히 내려주는 것이 좋다.

### Report Selection And Chat Start

메인 검색 화면에서 챗봇으로 넘길 보고서 개수는 프론트에서 임의로 제한하지 않는다. 서버 성능과 백엔드 정책에 따라 채팅 세션 생성 API가 허용 여부를 판단한다.

카드 클릭:

- 선택 안 된 카드 클릭 시 선택
- 선택된 카드 클릭 시 선택 해제
- 선택 개수 초과 여부는 카드 클릭 시 판단하지 않는다

그룹 헤더의 `채팅하기`:

- 그룹의 report id 전체를 채팅 세션 생성 흐름으로 전달한다
- 프론트에서 앞 2건 또는 5건으로 자르지 않는다
- API가 실패하면 응답 메시지를 토스트로 표시한다

하단 고정 `채팅하기`:

- `selectedReports.length > 0`일 때만 표시
- 선택된 report id 전체를 채팅 세션 생성 흐름으로 전달한다

## Chat Feature Rules

### Entry

메인 검색에서 전달한 report id 배열을 기준으로 `Report[]`를 만든 뒤 챗봇 화면으로 넘긴다.

```ts
type Report = {
  id: number;
  year: string;
  title: string;
  summary: string;
  tags: string[];
};
```

Python에서는 session, query string, POST body 중 하나로 선택 보고서 id 배열을 보낼 수 있다.

권장:

- `POST /chat/sessions`
- body: `{ report_ids: number[] }`
- response: `{ session_id: string, reports: Report[] }`

### Left Report Panel

상태:

- `panelReportIds`: 왼쪽 패널에 표시할 보고서 id
- `activeReportIds`: 현재 대화 대상으로 체크된 보고서 id

규칙:

- 메인에서 넘어온 보고서가 기본 목록이다
- 검색 모달에서 보고서를 추가하면 왼쪽 패널 목록에도 추가된다
- 체크박스는 다중 선택 가능
- 단, 최소 1건은 반드시 선택 상태로 유지한다
- 전체 선택이 켜진 상태에서 다시 누르면 전체 해제가 아니라 첫 번째 보고서 1건만 남긴다
- 체크된 보고서만 AI 대화 대상으로 사용한다

### Chat Search Modal

챗봇 안에서 보고서를 추가 검색하는 모달이다.

규칙:

- 검색어 입력 시 실시간 결과 갱신
- 메인과 같은 보고서 검색 기준 사용
- 메인과 같은 검색 도우미 팝업 사용
- 메인과 같은 `ClueChips` 사용
- 검색 결과가 없으면 메인의 `EmptyState`와 같은 UI 표시
- 체크한 보고서는 결과 목록 상단으로 올라온다
- 단, 체크 시 스크롤 위치는 유지한다
- 모달 외부 클릭 시 닫힌다

### Conversation

초기 상태:

- 선택 보고서 총 건수 안내
- `도움이 필요한가요?`
- 맞춤 제안 질문 버튼

질문 전송:

- 추천 질문 클릭 또는 입력창 submit
- 사용자 메시지 추가
- AI 답변 추가
- 근거가 있으면 답변 아래 근거 요약 표시

선택 보고서가 0건인 예외 상태:

- 중앙에 `보고서를 선택해주세요`
- 입력 submit은 동작하지 않음

### Evidence Actions

답변 근거는 항목 옆에 버튼/칩 형태로 표시한다.

종류:

- `원문 p.12 ~ 16`
- `지도`

원문:

- 클릭 시 `SourcePanel` 열림
- 오른쪽 상단 layout icon도 활성화

지도:

- 현재는 placeholder
- 추후 지도 패널 또는 지도 화면 연결

### Source Panel

원문 패널은 오른쪽에서 열린다.

데이터:

```ts
type SourceDocument = {
  title: string;
  pageLabel: string;
  pageImageUrl?: string;
  similarityScore: number;
};
```

규칙:

- 유사도는 버튼이 아니라 값 표시
- 유사도 값에 따라 색상 변경
- DB 원문 이미지가 있으면 `img`로 표시
- 이미지가 없으면 `DB 원문 이미지 영역` placeholder 표시
- 이미지 영역은 패널의 남은 높이를 채워야 한다
- 패널 너비 resize 가능
- 오른쪽 상단 icon으로 접기/펼치기 가능

유사도 색상:

- 75 이상: blue
- 50 이상: green
- 30 이상: yellow
- 30 미만: orange

## Python Backend API Draft

필수 API 후보:

```txt
GET  /api/reports
POST /api/report-groups
POST /api/chat/sessions
POST /api/chat/messages
POST /api/chat/uploads
POST /api/chat/image-search
GET  /api/reports/{report_id}/pages/{page}
GET  /api/reports/{report_id}/pages/{page}/image
GET  /api/reports/{report_id}/drawings/{drawing_id}/image
GET  /api/reports/{report_id}/map
GET  /api/maps/reverse-geocode
```

### GET /api/reports

목적: 검색어, 단서, 필터 기반 보고서 목록 반환

Query:

```txt
query: string
clues: comma-separated string
filters: comma-separated string
```

Response:

```json
{
  "items": [
    {
      "id": 1,
      "year": "2021",
      "title": "함안 우거리 토기가마 유적",
      "summary": "함안 우거리 일대 토기가마 유적과 출토 유물을 다룬 보고서",
      "tags": ["함안", "토기가마", "아라가야", "좌표있음"]
    }
  ]
}
```

### POST /api/report-groups

목적: 활성 키워드별 그룹 결과 반환

Request:

```json
{
  "query": "토기",
  "keywords": ["부산", "테스트456"]
}
```

Response:

```json
{
  "groups": [
    {
      "label": "부산",
      "count": 3,
      "items": []
    }
  ]
}
```

### POST /api/chat/sessions

목적: 선택한 보고서 id 목록으로 채팅 세션 생성

Request:

```json
{
  "report_ids": [1, 10, 12]
}
```

Response:

```json
{
  "session_id": "session_001",
  "reports": []
}
```

Error response:

```json
{
  "code": "REPORT_LIMIT_EXCEEDED",
  "message": "선택 가능한 보고서는 최대 5건입니다.",
  "max_reports": 5
}
```

### POST /api/chat/messages

목적: 질문을 보내고 AI 답변과 근거 수신

Request:

```json
{
  "session_id": "session_001",
  "message": "선택한 보고서 전체를 요약해줘",
  "active_report_ids": [1, 10]
}
```

Response:

```json
{
  "message_id": 20,
  "answer": "선택한 보고서는 모두 토기가마 유적을 다룬 발굴조사 보고서입니다.",
  "has_evidence": true,
  "evidence": [
    {
      "label": "조사 위치",
      "value": "함안 우거리 일대",
      "actions": [
        {
          "type": "source",
          "label": "원문 p.12 ~ 16",
          "report_id": 1,
          "page": 12
        },
        {
          "type": "map",
          "label": "지도",
          "report_id": 1
        }
      ]
    }
  ]
}
```

### POST /api/chat/uploads

목적: 챗봇 입력창에 첨부한 이미지를 업로드하고 preview URL을 반환

Request:

```txt
multipart/form-data
file: image/*
```

Response:

```json
{
  "image_file_id": "upload_001",
  "preview_url": "/media/uploads/upload_001.png",
  "mime_type": "image/png",
  "width": 1200,
  "height": 900
}
```

### POST /api/chat/image-search

목적: 업로드 이미지와 선택 보고서 PDF에서 추출한 도면/페이지 이미지를 비교해 유사후보 반환

Request:

```json
{
  "session_id": "session_001",
  "image_file_id": "upload_001",
  "active_report_ids": [1, 10],
  "message": "이 이미지가 보고서 어디에 나오는지 찾아줘"
}
```

Response:

```json
{
  "message": "업로드한 이미지는 토기가마 도면으로 보입니다.",
  "candidates": [
    {
      "id": "drawing_001",
      "report_id": 1,
      "report_title": "함안 우거리 토기가마",
      "page_number": 32,
      "page_label": "p.032",
      "type_label": "도면",
      "title": "도면 14. 1~2호 토기가마 평면도",
      "similarity": 12,
      "thumbnail_url": "/media/reports/1/drawings/drawing_001-thumb.png",
      "map_overlay_image_url": "/media/reports/1/drawings/drawing_001-map.png",
      "source_page_image_url": "/media/reports/1/pages/32.png",
      "has_source": true
    }
  ]
}
```

PDF 페이지 rasterizing, 도면 crop, thumbnail 생성, 지도 배치용 이미지 생성은 서버/API 책임입니다. 프론트는 URL을 받아 현재 UI에 렌더링합니다.

### GET /api/reports/{report_id}/pages/{page}

목적: 원문 패널에 표시할 원문 이미지와 유사도 반환

Response:

```json
{
  "title": "함안 우거리 토기가마 유적",
  "page_label": "p.12",
  "page_image_url": "/media/report-pages/1/12.png",
  "similarity_score": 80
}
```

## CSS Rules

디자인시스템을 우선 사용한다.

필수 CSS 로드:

```html
<link rel="stylesheet" href="/static/solvekdesignsystem-web/css/index.css">
```

또는 빌드 환경에 맞게 `css/index.css`를 정적 파일로 복사해 로드한다.

### Do

- `solvekdesignsystem-web/css/index.css`를 최우선으로 사용한다
- 색상은 `var(--blue-500)`, `var(--slate-200)` 등 토큰을 사용한다
- 기존 utility class를 사용한다: `flex`, `align-center`, `gap-*`, `px-*`, `py-*`
- 기존 typography class를 사용한다: `body*`, `heading*`
- 기존 component class를 사용한다: `main-search-*`, `search-*`, `checkbox-basic`, `checkbox-chip-label`, `chip`, `blue-button-48`
- 아이콘은 `icon.css`의 class를 사용한다: `filter-icon`, `main-search-blue-icon`, `searchbar-search-icon`, `home-icon`, `layout-right-*`
- 동적 너비, resize, 이미지 object-fit처럼 상태 기반 값만 inline style 또는 JS style로 처리한다

### Do Not

- 의미 없는 식별용 class를 만들지 않는다
- 화면별로 중복 CSS 파일을 만들지 않는다
- `prototype-*` class를 만들지 않는다
- 기존 디자인시스템에 있는 버튼, 칩, 체크박스, 검색창을 새 CSS로 복제하지 않는다
- 색상 hex를 임의로 추가하지 않는다
- 카드 안에 카드처럼 중첩된 card UI를 만들지 않는다

### Chip CSS

`checkbox-chip-label`은 활성 상태에서 blue 스타일만 표시한다.

체크 아이콘은 표시하지 않는다.

필수 활성 스타일:

```css
.checkbox-chip-label:has(.checkbox-chip:checked) {
  border-color: var(--blue-500);
  background-color: var(--blue-50);
  color: var(--blue-500);
}
```

### Tooltip CSS

필터 아이콘 hover/focus 시 tooltip을 표시한다.

규격:

- text: `검색 도우미`
- font-size: 14px
- font-weight: regular
- height: 28px
- padding: 2px 10px
- border-radius: 8px
- background: slate-700

### Responsive CSS

반응형은 `solvekdesignsystem-web/css/default/responsive.css` 또는 최종 앱의 정식 CSS 위치에서 관리한다. 삭제된 `src/prototype-responsive.css`를 다시 만들지 않는다.

권장:

- 1024px 이하: 챗봇 좌우 패널은 overlay 또는 collapsible panel로 처리
- 768px 이하: 검색 모달과 채팅 입력창 width를 viewport에 맞춤
- 520px 이하: 검색 모달은 거의 full screen으로 처리

## JavaScript Rules

Python 템플릿 기반으로 구현하더라도 필요한 상호작용은 JavaScript로 명확히 분리한다.

### State Names

React가 아니어도 상태 이름은 아래 개념을 유지한다.

검색:

- `query`
- `helperOpen`
- `clues`
- `checkedClues`
- `activeFilters`
- `selectedReports`
- `groupedReports`
- `toastMessage`

챗봇:

- `panelReportIds`
- `activeReportIds`
- `messages`
- `isPanelOpen`
- `panelWidth`
- `isSearchOpen`
- `searchQuery`
- `searchClues`
- `checkedSearchClues`
- `isSourcePanelOpen`
- `sourcePanelWidth`

### Event Rules

- 검색 input 변경 시 결과 갱신
- 검색 submit 시 최근 검색어 저장
- 검색 도우미 trigger 클릭 시 팝업 toggle
- 팝업 외부 클릭 시 닫기
- 칩 클릭 시 활성 toggle
- 초기화 클릭 시 단서/활성 단서 모두 reset
- 카드 클릭 시 보고서 선택 toggle
- 선택 수는 프론트에서 임의 제한하지 않음
- 그룹 `채팅하기`는 그룹 보고서 id 전체로 채팅 세션 생성 시도
- 하단 `채팅하기`는 선택된 보고서 id 전체로 채팅 세션 생성 시도
- 채팅 세션 생성 API가 실패하면 응답의 사용자 표시용 메시지를 토스트로 표시
- 챗봇 왼쪽 패널 체크박스는 최소 1건 유지
- resize handle pointerdown 이후 pointermove/pointerup으로 너비 조절
- 원문 버튼 클릭 시 오른쪽 SourcePanel 열기

### Accessibility Rules

- 모든 icon-only button은 `aria-label`을 가진다
- 장식 아이콘에는 `aria-hidden="true"`를 둔다
- 검색 도우미 팝업은 `role="dialog"` 또는 listbox 구조를 가진다
- 옵션 목록은 `role="listbox"`, 옵션은 `role="option"`을 사용한다
- 모달은 `role="dialog"`와 `aria-modal="true"`를 사용한다
- resize handle은 `role="separator"`와 `aria-orientation="vertical"`을 사용한다
- checkbox는 보고서명을 포함한 `aria-label`을 가진다

## File And Component Mapping

React prototype 기준:

| Prototype file | Final implementation role |
|---|---|
| `App.tsx` | search/chat route or view switch |
| `MainSearchPage.tsx` | report search page controller |
| `ReportSearchSections.tsx` | reusable search sections/components |
| `report-search/data.ts` | replace with DB/API |
| `ChatPage.tsx` | chat page controller |
| `ReportChatSidePanel.tsx` | selected report side panel |
| `ChatConversation.tsx` | chat message UI |
| `ChatSearchModal.tsx` | report search modal inside chat |
| `SourcePanel.tsx` | source document panel |
| `ResizeHandle.tsx` | reusable panel resize handle |
| `report-chat/data.ts` | replace with chat/source APIs |

Python template suggestion:

```txt
templates/
  report_search.html
  report_chat.html
  components/
    search_bar.html
    helper_menu.html
    clue_chips.html
    report_card.html
    grouped_report_section.html
    chat_side_panel.html
    chat_conversation.html
    chat_search_modal.html
    source_panel.html

static/
  css/
    index.css
    app.css
  js/
    report_search.js
    report_chat.js
```

## Claude Code Work Prompt

개발자가 Claude Code에 줄 수 있는 프롬프트 예시:

```txt
이 저장소의 CLAUDE_CODE_IMPLEMENTATION_GUIDE.md를 최우선으로 읽고, React 프로토타입의 기능을 Python 백엔드 기반 UI로 재구현해줘.

중요 조건:
- solvekdesignsystem-web/css/index.css와 기존 class를 우선 사용한다.
- 의미 없는 식별용 class는 만들지 않는다.
- 검색 메인과 챗봇 화면의 상태 흐름은 React TSX를 기준으로 유지한다.
- 메인 검색에서 선택 가능한 보고서 수는 프론트에서 임의 제한하지 않는다.
- 그룹 헤더의 채팅하기는 그룹 보고서 id 전체로 채팅 세션 생성을 시도한다.
- 채팅 세션 생성 실패 토스트는 API 응답 메시지를 기준으로 표시한다.
- 칩 활성 상태는 blue 스타일만 쓰고 체크 아이콘은 표시하지 않는다.
- 챗봇 왼쪽 패널은 최소 1건 이상 선택 상태를 유지한다.
- 원문 패널은 DB 원문 이미지가 들어갈 수 있도록 image URL 기반으로 만든다.
- API 계약은 문서의 Python Backend API Draft를 기준으로 한다.
```

## Acceptance Checklist

검색 화면:

- 검색어 입력으로 결과가 바뀐다
- 검색 결과 없음 상태가 있다
- 검색 도우미 팝업이 열린다
- 팝업 외부 클릭 시 닫힌다
- 단서 칩이 표시된다
- 단서 칩 활성화 시 체크 아이콘 없이 blue 스타일만 표시된다
- 단서 초기화 시 컨텐츠가 자연스럽게 위로 이동한다
- 활성 키워드별 그룹 결과가 표시된다
- 그룹 헤더에 `채팅하기`가 있다
- 보고서는 프론트 임의 제한 없이 선택된다
- API가 선택 개수 초과를 반환하면 응답 메시지 토스트가 표시된다
- 하단 `채팅하기`로 챗봇 화면에 진입한다

챗봇 화면:

- 메인에서 선택한 보고서가 왼쪽 패널에 표시된다
- 왼쪽 패널 체크는 다중 선택 가능하되 최소 1건 유지
- 왼쪽 패널 resize와 접기/펼치기가 된다
- 검색 모달에서 보고서를 추가할 수 있다
- 검색 모달에서도 단서 칩과 결과 없음 상태가 동작한다
- 추천 질문 클릭 시 답변이 표시된다
- 답변 근거의 원문 버튼을 누르면 SourcePanel이 열린다
- SourcePanel은 유사도와 원문 이미지 영역을 표시한다
- SourcePanel resize와 접기/펼치기가 된다

