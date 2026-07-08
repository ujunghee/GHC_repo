# GHC Report Search And Chat Prototype

이 문서는 가야역사문화권 발굴보고서 검색/챗봇 프로토타입의 최상위 안내서입니다. 개발자 또는 개발자용 AI가 새 UI를 다시 만들 때는 이 문서를 먼저 읽고, 아래 문서를 순서대로 확인합니다.

## Read Order

1. `PROTOTYPE_OVERVIEW.md`
2. `DEVELOPER_HANDOFF.md`
3. `solvek-react/src/features/report-search/README.md`
4. `solvek-react/src/features/report-search/PROTOTYPE_FLOW.md`
5. `solvek-react/src/features/report-search/COMPONENT_RULES.md`
6. `solvek-react/src/features/report-chat/README.md`
7. `solvek-react/src/features/report-chat/PROTOTYPE_FLOW.md`
8. `solvek-react/src/features/report-chat/COMPONENT_RULES.md`
9. `solvekdesignsystem-web/README.md`
10. `solvekdesignsystem-web/CLAUDE.md`

## Project Purpose

이 프로토타입은 발굴보고서를 검색하고, 선택한 보고서 기반으로 챗봇 대화를 시작하는 화면 흐름을 검증하기 위한 전달본입니다.

- 메인 검색 화면에서 보고서를 검색/필터/선택합니다.
- 선택한 보고서는 최대 2건까지 메인 화면에서 챗봇으로 전달합니다.
- 챗봇 화면에서는 전달받은 보고서 목록을 왼쪽 패널에 표시합니다.
- 챗봇 답변의 근거 버튼을 누르면 오른쪽 원문 패널이 열립니다.
- 실제 API와 DB 원문 이미지는 아직 연결 전이며, `data.ts`의 임시 데이터로 구조를 잡았습니다.

## Repository Map

| path | role |
|---|---|
| `solvek-react/` | React 프로토타입 앱 |
| `solvek-react/src/App.tsx` | 검색 화면과 챗봇 화면 전환 |
| `solvek-react/src/features/report-search/` | 발굴보고서 검색 메인 화면 |
| `solvek-react/src/features/report-chat/` | 선택 보고서 기반 챗봇 화면 |
| `solvek-react/src/prototype-responsive.css` | 프로토타입 전용 반응형 보정 |
| `solvekdesignsystem-web/` | SolveK CSS 디자인시스템 및 아이콘 자산 |
| `DEVELOPER_HANDOFF.md` | 개발자 전달용 요약 및 API 연결 메모 |

## Screen Flow

```txt
App.tsx
  ├─ MainSearchPage
  │   ├─ 검색어 입력
  │   ├─ 검색 도우미 팝업
  │   ├─ 단서 칩
  │   ├─ 보고서 결과 목록
  │   └─ 선택 보고서 → 채팅하기
  │
  └─ ChatPage
      ├─ 선택 보고서 패널
      ├─ 채팅 본문
      ├─ 보고서 검색 모달
      └─ 원문 패널
```

## Design System Usage

화면 구현은 `solvekdesignsystem-web/css/index.css`와 기존 디자인시스템 class를 우선 사용합니다.

- 검색창: `main-search-wrapper`, `main-search-62`, `search-48`, `search-62`
- 버튼: `blue-button-48`, `transparent-button-*`
- 체크박스: `checkbox-basic`, `checkbox-chip-label`
- 칩: `chip`
- 색상/간격/타이포: `color-*`, `bg-*`, `border-*`, `px-*`, `body*`, `heading*`
- 아이콘: `filter-icon`, `searchbar-search-icon`, `home-icon`, `layout-right-*`

프로토타입에서만 필요한 반응형 보정은 `prototype-*` class와 `src/prototype-responsive.css`에 모았습니다.

## Data Handoff

현재 공통 보고서 데이터 타입은 검색 기능의 `Report` 타입을 기준으로 합니다.

```ts
type Report = {
  id: number;
  year: string;
  title: string;
  summary: string;
  tags: string[];
};
```

챗봇 원문 패널에서 필요한 임시 데이터 타입입니다.

```ts
type SourceDocument = {
  title: string;
  pageLabel: string;
  pageImageUrl?: string;
  similarityScore: number;
};
```

## Implementation Notes

- `App.tsx`는 화면 전환만 담당합니다.
- 검색 상태와 결과 목록은 `MainSearchPage.tsx`가 관리합니다.
- 챗봇 상태와 패널 resize는 `ChatPage.tsx`가 관리합니다.
- 세부 UI는 `components/` 폴더의 컴포넌트로 분리합니다.
- 실제 API 연결 시 `data.ts`를 직접 수정하기보다 service/hook을 만들어 페이지 컨테이너에서 데이터를 주입합니다.

