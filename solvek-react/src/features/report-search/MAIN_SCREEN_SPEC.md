# 메인 검색 화면 상세 구현 명세

이 문서는 Python 백엔드 개발자와 Claude Code 기반 AI가 메인 검색 화면을 재구현할 수 있도록 작성한 상세 명세입니다. React 프로토타입의 현재 기능을 기준으로 하며, 실제 개발에서는 프레임워크가 달라도 동일한 데이터 흐름과 UX를 유지합니다.

## 1. 화면 개요

메인 화면은 발굴보고서를 찾고, 대화할 보고서를 선택하는 진입 화면입니다.

사용자 목표:

- 검색어로 보고서를 찾습니다.
- 검색 도우미에서 지역, 소재지, 시대 단서를 선택합니다.
- 선택한 키워드별로 묶인 보고서 결과를 봅니다.
- 보고서를 최대 2건 선택합니다.
- 선택한 보고서로 챗봇 화면에 진입합니다.

## 2. 레이아웃 순서

위에서 아래 순서:

1. 화면 제목과 설명
2. 검색바
3. 검색 도우미 팝업
4. 선택한 단서 칩 영역
5. 최근 검색한 보고서
6. 추천 보고서
7. 결과 헤더 또는 그룹 헤더
8. 보고서 카드 목록
9. 하단 fixed `채팅하기` CTA
10. 선택 제한 토스트

위치 규칙:

- 최근 검색한 보고서는 검색바와 단서 칩 바로 아래에 위치합니다.
- 추천 보고서는 모든 보고서 리스트 또는 그룹 리스트 바로 위에 위치합니다.
- 추천 보고서 아래에는 42px 여백을 둡니다.
- 결과 목록은 검색바 영역과 시각적으로 분리되도록 상단 여백을 둡니다.

## 3. 상태 모델

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

상태 의미:

- `query`: 검색 input 값입니다.
- `mode`: 현재 결과 렌더링 방식을 결정합니다.
- `searchHistory`: 최근 검색어입니다. 최대 5개입니다.
- `helperOpen`: 검색 도우미 팝업 표시 여부입니다.
- `activeFilters`: 필터 레일에서 선택한 키워드입니다.
- `clues`: 검색 도우미에서 추가한 칩 목록입니다.
- `checkedClues`: 칩 중 실제 그룹 검색에 활성화된 값입니다.
- `selectedReports`: 사용자가 선택한 보고서 id입니다. 최대 2개입니다.
- `toastVisible`: 선택 제한 토스트 표시 여부입니다.

## 4. 데이터 모델

```ts
type Report = {
  id: number;
  year: string;
  title: string;
  summary: string;
  tags: string[];
};

type ReportGroup = {
  label: string;
  reports: Report[];
};

type HelperCategory = {
  key: string;
  label: string;
  options: string[];
};
```

Python Pydantic 예시:

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
```

## 5. API 설계 권장안

### 보고서 검색

```http
GET /api/reports/search?query=토기&clues=부산,가야&filters=서울
```

응답:

```json
{
  "reports": [
    {
      "id": 1,
      "year": "2021",
      "title": "함안 우거리 토기가마 유적",
      "summary": "함안 우거리 일대 토기가마 유적과 출토 유물을 다룬 보고서",
      "tags": ["함안", "토기가마", "가야", "좌표있음"]
    }
  ]
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
  "keywords": ["부산", "테스트456"]
}
```

응답:

```json
{
  "groups": [
    { "label": "부산", "reports": [] },
    { "label": "테스트456", "reports": [] }
  ]
}
```

### 최근 검색어

```http
GET /api/users/{user_id}/search-history
POST /api/users/{user_id}/search-history
```

규칙:

- 결과가 있는 검색어만 저장합니다.
- 중복 검색어는 제거 후 맨 앞으로 이동합니다.
- 최대 5개까지만 반환합니다.

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

## 6. 검색바 UI

구성:

- 왼쪽 검색 도우미 아이콘 버튼
- 가운데 검색 input
- 오른쪽 검색 버튼

규칙:

- 검색 도우미 아이콘은 hover 시 툴팁 `검색 도우미`를 표시합니다.
- 검색 도우미 버튼은 팝업이 열리면 active 상태가 됩니다.
- input은 사용자가 입력하는 즉시 `query`를 갱신합니다.
- 검색 버튼은 form submit을 발생시킵니다.

## 7. 검색 도우미 UI

검색 도우미는 사용자가 자연어 검색을 더 쉽게 만들도록 단서를 고르는 보조 팝업입니다.

카테고리 예시:

```json
[
  { "key": "region", "label": "지역", "options": ["서울", "부산", "대구"] },
  { "key": "location", "label": "소재지", "options": ["함안", "김해"] },
  { "key": "era", "label": "시대", "options": ["가야", "통일신라"] }
]
```

규칙:

- 팝업 바깥 클릭 시 닫습니다.
- 옵션을 선택하면 단서 칩 영역에 추가합니다.
- 선택된 옵션을 다시 누르면 제거합니다.
- 옵션 선택만으로 검색을 submit하지 않습니다.
- `ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Space` 키보드 조작을 지원합니다.

## 8. 단서 칩 UI

칩 상태:

- 기본: 흰 배경, slate border/text
- 활성: blue border, 연한 blue 배경, blue text

규칙:

- 체크 아이콘은 없습니다.
- 칩이 많으면 가로 스크롤합니다.
- 좌우 arrow 대신 스와이퍼/마우스 드래그 포인터를 사용할 수 있습니다.
- 초기화 버튼은 칩 전체를 지웁니다.
- 칩이 사라질 때 아래 콘텐츠가 갑자기 튀지 않도록 height/layout transition을 둡니다.

## 9. 최근 검색한 보고서 UI

표시 조건:

```txt
query가 비어 있고 searchHistory.length > 0
```

위치:

```txt
검색바/단서 칩 바로 아래
```

동작:

- 항목 클릭 시 검색어를 해당 최근 검색어로 바꿉니다.
- 선택된 보고서를 모두 해제합니다.

## 10. 추천 보고서 UI

표시 조건:

```txt
query가 비어 있고 searchHistory.length >= 5이고 recommendedReports.length > 0
```

위치:

```txt
보고서 리스트 바로 위
```

여백:

```txt
추천 보고서 아래 margin-bottom: 42px
```

동작:

- 보고서 카드는 일반 결과 카드와 동일하게 선택/해제됩니다.
- 최대 2건 선택 제한도 동일하게 적용합니다.

## 11. 결과 카드 UI

카드 구성:

- 제목
- 연도
- 요약
- 태그

선택 상태:

- 선택됨: blue border와 연한 blue 배경
- 기본: slate border와 흰 배경

검색어 하이라이트:

- 검색어가 제목/요약/태그에 포함되면 해당 부분만 blue로 표시합니다.

## 12. 그룹 결과 UI

표시 조건:

```txt
checkedClues.length > 0 또는 activeFilters.length > 0
```

그룹 생성 기준:

```txt
checkedClues 우선, 없으면 activeFilters 사용
```

각 그룹은 다음처럼 표시합니다.

```txt
부산 3건                         채팅하기 >
[보고서 카드] [보고서 카드]
[보고서 카드]
```

그룹별 보고서는 최대 3건씩 보여줄 수 있습니다. 실제 API에서는 페이지네이션 또는 더보기 정책을 추가해도 됩니다.

## 13. 선택 제한과 토스트

선택 제한:

```txt
최대 2건
```

초과 시:

- 새 선택을 무시합니다.
- 토스트를 1800ms 표시합니다.

토스트:

```txt
최대 2건만 가능합니다
```

그룹 `채팅하기` 예외:

- 그룹 보고서가 3건 이상이면 앞 2건만 선택합니다.
- 토스트를 띄웁니다.
- 사용자가 하단 CTA를 직접 눌러 이동해야 합니다.

## 14. 하단 채팅 CTA

표시 조건:

```txt
selectedReports.length > 0
```

클릭:

```ts
onStartChat(selectedReports.slice(0, 2))
```

Python 백엔드에서는 이 시점에 채팅 세션 생성 API를 호출하거나, 프론트에서 먼저 화면 전환 후 챗봇 화면에서 세션을 생성할 수 있습니다.

## 15. CSS 구현 규칙

- 디자인 시스템 CSS를 먼저 사용합니다.
- 색상은 CSS variable 또는 디자인 시스템 class를 사용합니다.
- 새 클래스는 의미가 분명할 때만 추가합니다.
- 의미 없는 `prototype-*` 같은 이름은 사용하지 않습니다.
- 레이아웃 간격은 기존 spacing utility를 우선 사용합니다.
- 없는 간격만 제한적으로 inline style 또는 새 utility로 추가합니다.
- 체크박스/칩/검색바/아이콘은 디자인 시스템 컴포넌트 CSS와 맞춥니다.

## 16. JS 구현 규칙

- UI 상태와 API 상태를 분리합니다.
- 검색 결과가 없는 상태에서는 선택 보고서를 초기화합니다.
- 최근 검색어 저장은 검색 성공 이후에만 실행합니다.
- 키워드 그룹 결과는 프론트에서 임시 생성할 수 있지만, 실제 서비스에서는 백엔드가 그룹 구조로 내려주는 것이 좋습니다.
- 슬라이더는 Swiper 같은 검증된 라이브러리를 사용하거나, 단순 horizontal scroll로 대체할 수 있습니다.
- 접근성 속성은 유지합니다.

## 17. 접근성 규칙

- 검색 input에는 명확한 `aria-label`을 둡니다.
- 검색 도우미 버튼에는 `aria-expanded`, `aria-haspopup`, `aria-controls`를 둡니다.
- 팝업은 `role="dialog"`를 사용합니다.
- 옵션 목록은 `role="listbox"`와 `role="option"` 구조를 유지합니다.
- 장식 아이콘은 `aria-hidden="true"`를 둡니다.
- 토스트는 `role="status"`를 사용합니다.

## 18. Claude Code 작업 지시 예시

```txt
solvek-react/src/features/report-search/MAIN_SCREEN_SPEC.md를 기준으로
Python 백엔드 API와 연결 가능한 발굴보고서 메인 검색 화면을 구현해줘.
보고서 검색, 검색 도우미 단서, 최근 검색어, 추천 보고서, 키워드별 그룹 결과,
최대 2건 선택 제한, 하단 채팅 CTA 규칙을 반드시 유지해줘.
디자인은 solvekdesignsystem-web/css의 토큰과 컴포넌트 클래스를 우선 사용해줘.
```
