# GHC Report Search And Chat Prototype

이 문서는 가야역사문화권 발굴보고서 검색/AI 챗봇 프로토타입의 최상위 안내서입니다. 개발자 또는 개발자용 AI가 이 git을 기준으로 UI를 동일하게 만들 때는 아래 순서로 읽습니다.

## Read Order

1. `AI_DEVELOPER_CHATBOT_HANDOFF.md`
2. `UI_SOURCE_OF_TRUTH.md`
3. `DEVELOPER_HANDOFF.md`
4. `solvek-react/src/features/report-search/README.md`
5. `solvek-react/src/features/report-chat/README.md`
6. 필요한 화면별 상세 스펙: `*_UI_SCREEN_SPEC.md`, `*_UI_REPLACEMENT_HANDOFF.md`, `PROTOTYPE_FLOW.md`, `COMPONENT_RULES.md`
7. 디자인시스템: `solvekdesignsystem-web/css/index.css`, `solvekdesignsystem-web/README.md`, `solvekdesignsystem-web/CLAUDE.md`

## Project Purpose

이 프로토타입은 발굴보고서를 검색하고, 선택한 보고서 기반으로 챗봇 대화를 시작하는 화면 흐름을 검증하기 위한 전달본입니다.

- 이 git 안의 React 코드가 UI 원본입니다.
- 기존 챗봇에 적용할 때는 이 git을 별도 앱으로 새로 만들거나 iframe으로 얹지 않고, 기존 챗봇의 표현 계층만 교체합니다.
- 기존 챗봇의 로그인, 세션, 대화방, 대화 기록, 질문 전송, AI 응답 스트리밍, 중단/재생성/복사, 파일 업로드, API/DB 연결은 유지합니다.
- 기존 챗봇 API 응답은 adapter를 통해 GHC UI 타입으로 변환합니다.
- `data.ts` mock 데이터는 화면/타입 예시이며 운영 데이터로 사용하지 않습니다.
- 별도 캡처가 없어도 `UI_SOURCE_OF_TRUTH.md`의 원본 경로를 기준으로 화면을 복사합니다.
- 메인 검색 화면에서 보고서를 검색/필터/선택합니다.
- 선택한 보고서 id 전체를 메인 화면에서 챗봇 시작 흐름으로 전달합니다.
- 채팅 가능한 최대 보고서 수는 프론트에서 고정하지 않고 채팅 세션 생성 API 응답을 기준으로 처리합니다.
- 챗봇 화면에서는 전달받은 보고서 목록을 왼쪽 패널에 표시합니다.
- 챗봇 답변의 근거 버튼을 누르면 오른쪽 원문 또는 지도 패널이 열립니다.
- 이미지 업로드 질문을 보내면 AI 유사후보 카드가 표시되고, 후보의 `지도에서 보기`로 지도 위 도면 이미지 배치 UX에 진입합니다.
- 채팅 첨부 이미지는 고정 preview로만 표시하고, 이미지 이동/회전/resize는 지도 위 도면 overlay에서만 제공합니다.
- 지도 위 도면 이미지는 최초 진입부터 적용 완료 상태로 지도 좌표에 고정되며, 관리 패널의 `이미지 수정`을 눌렀을 때만 편집 모드가 열립니다.
- 최소화된 지도 설정 popup은 헤더를 드래그해 위치 이동할 수 있습니다.
- 실제 API, PDF 추출 이미지, GIS 레이어, reverse geocode는 아직 mock 구조입니다. 통합 시 `data.ts` 목업을 운영 데이터로 쓰지 말고, 기존 챗봇 API 응답을 각 컴포넌트의 state/handler 흐름에 맞게 adapter로 주입합니다.

## Repository Map

| path | role |
|---|---|
| `solvek-react/` | React 프로토타입 앱 |
| `solvek-react/src/App.tsx` | 검색 화면과 챗봇 화면 전환 |
| `solvek-react/src/features/report-search/` | 발굴보고서 검색 메인 화면 |
| `solvek-react/src/features/report-chat/` | 선택 보고서 기반 챗봇 화면 |
| `solvekdesignsystem-web/` | SolveK CSS 디자인시스템 및 아이콘 자산 |
| `AI_DEVELOPER_CHATBOT_HANDOFF.md` | 챗봇/유사후보/지도 배치/API 연결 최종 전달 문서 |
| `DEVELOPER_HANDOFF.md` | 개발자 전달용 요약 및 API 연결 메모 |

## Screen Flow

```txt
App.tsx
  ├─ MainSearchPage
  │   ├─ 검색어 입력
  │   ├─ 검색 도우미 팝업
  │   ├─ 단서 칩
  │   ├─ 키워드별 보고서 결과 그룹
  │   └─ 선택 보고서 → 채팅하기
  │
  └─ ChatPage
      ├─ 선택 보고서 패널
      ├─ 채팅 본문
      ├─ 보고서 검색 모달
      └─ 원문/지도 패널
```

## Design System Usage

화면 구현은 `solvekdesignsystem-web/css/index.css`와 기존 디자인시스템 class를 우선 사용합니다.

- 검색창: `main-search-wrapper`, `main-search-62`, `search-48`, `search-62`
- 버튼: `blue-button-48`, `transparent-button-*`
- 체크박스: `checkbox-basic`, `checkbox-chip-label`
- 칩: `chip`
- 색상/간격/타이포: `color-*`, `bg-*`, `border-*`, `px-*`, `body*`, `heading*`
- 아이콘: `filter-icon`, `searchbar-search-icon`, `home-icon`, `layout-right-*`

반응형 보정은 `solvekdesignsystem-web/css/default/responsive.css` 또는 최종 앱의 정식 CSS 위치에서 관리합니다. 삭제된 `src/prototype-responsive.css`는 다시 만들지 않습니다.

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

이미지 유사후보와 지도 배치에 필요한 핵심 타입입니다.

```ts
type DrawingCandidate = {
  id: number;
  pageLabel: string;
  typeLabel: string;
  similarity: number;
  reportTitle: string;
  title: string;
  thumbnailUrl?: string;
  mapOverlayImageUrl?: string;
  hasSource?: boolean;
};
```

## Implementation Notes

- `App.tsx`는 화면 전환만 담당합니다.
- 검색 상태와 결과 목록은 `MainSearchPage.tsx`가 관리합니다.
- 챗봇 상태와 패널 resize는 `ChatPage.tsx`가 관리합니다.
- 세부 UI는 `components/` 폴더의 컴포넌트로 분리합니다.
- 실제 API 연결 시 `data.ts`를 운영 데이터로 사용하지 말고 service/hook/adapter를 만들어 기존 챗봇 API 응답을 페이지 컨테이너에 주입합니다.
- 보고서 PDF 페이지 rasterizing, 도면 crop, thumbnail 생성, 지도 배치용 이미지 생성은 프론트가 아니라 서버/API 책임입니다.
