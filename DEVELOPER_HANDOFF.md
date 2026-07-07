# GHC Prototype Developer Handoff

이 저장소는 가야역사문화권 발굴보고서 검색/챗봇 진입 프로토타입 전달본입니다. 개발자가 새 UI 화면을 다시 만들거나, 개발자용 AI에게 구현을 맡길 때는 아래 순서대로 읽게 하세요.

## Read Order

1. `DEVELOPER_HANDOFF.md`
2. `solvek-react/src/features/report-search/PROTOTYPE_FLOW.md`
3. `solvek-react/src/features/report-search/COMPONENT_RULES.md`
4. `solvek-react/src/features/report-search/README.md`
5. `solvekdesignsystem-web/README.md`
6. `solvekdesignsystem-web/CLAUDE.md`

## Project Map

- `solvek-react/`: 현재 동작하는 React 프로토타입입니다.
- `solvek-react/src/App.tsx`: 앱 루트입니다. 메인 검색 화면과 보고서 채팅 화면 전환을 관리합니다.
- `solvek-react/src/features/report-chat/ChatPage.tsx`: 선택한 보고서 기반 채팅 화면 초안입니다.
- `solvek-react/src/features/report-search/MainSearchPage.tsx`: 발굴보고서 검색 메인 화면의 상태와 화면 흐름입니다.
- `solvek-react/src/features/report-search/components/ReportSearchSections.tsx`: 검색 도우미, 칩, 결과 카드, 추천, 빈 상태 등 화면 섹션 컴포넌트입니다.
- `solvek-react/src/features/report-search/data.ts`: 임시 보고서 데이터와 필터/추천/검색 도우미 옵션입니다.
- `solvekdesignsystem-web/`: 프로토타입에서 사용하는 CSS 디자인시스템과 아이콘 자산입니다.

## How To Run

```bash
cd solvek-react
npm install
npm run dev
```

같은 네트워크에서 PC IP로 공유하려면 Parcel dev server를 `0.0.0.0` host로 실행해야 합니다.

```bash
cd solvek-react
npm exec -- parcel serve index.html --host 0.0.0.0 --port 5173 --no-cache
```

## What To Rebuild

새 UI를 만들 때 재현해야 하는 핵심 화면은 두 개입니다.

- 발굴보고서 검색 메인 화면
- 검색 도우미 팝업
- 선택한 단서 칩
- 최근 검색어
- 추천 보고서 슬라이더
- 보고서 결과 그리드
- 결과 없음 상태
- 보고서 선택 후 하단 채팅 CTA
- 최대 2건 선택 제한 토스트
- 선택 보고서 기반 채팅 화면
- 채팅 화면의 선택 보고서 패널
- 채팅 메시지 영역과 메시지 입력 영역

현재 `채팅하기` 버튼은 선택한 보고서 id를 `App.tsx`로 넘기고, `App.tsx`가 해당 id에 맞는 `Report[]`를 찾아 `ChatPage`로 전달합니다. 실제 AI 답변 API는 아직 연결 전이며, 채팅 화면에는 백엔드 연결 전용 placeholder 응답이 들어 있습니다.

## Backend Contract Draft

현재 프론트에서 기대하는 보고서 모델입니다.

```ts
type Report = {
  id: number;
  year: string;
  title: string;
  summary: string;
  tags: string[];
};
```

예상 API:

- `GET /reports?query=&filters=&clues=`: 보고서 검색
- `GET /reports/recommendations`: 추천 보고서
- `POST /search-history`: 최근 검색어 저장
- `POST /chat/sessions`: 선택 보고서 기반 채팅 세션 생성

## Important Notes For AI Implementation

- 디자인은 반드시 `solvekdesignsystem-web/css/index.css`와 기존 class를 기준으로 재현합니다.
- 실제 화면 흐름은 React TSX가 기준입니다. 디자인시스템 MD는 class와 디자인 규칙의 보조 자료입니다.
- `solvekdesignsystem-web/README.md`와 `CLAUDE.md`에는 원본 디자인시스템의 확장 폴더 설명이 일부 남아 있습니다. 현재 전달본에는 `components/`, `docs/`, `solvek-web/` 폴더가 없으므로, 없는 파일 링크를 따라가지 말고 `css/`, `image/`, React TSX, 이 문서들을 기준으로 구현합니다.
- 결과 없음 상태에서는 선택된 보고서를 초기화하고 하단 채팅 CTA를 숨깁니다.
- 보고서 선택은 최대 2건까지 허용합니다.
