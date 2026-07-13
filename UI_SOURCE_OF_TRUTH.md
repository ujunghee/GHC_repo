# UI Source Of Truth

## Latest Source Rule

현재 git 자체가 UI 원본입니다. 개발자 또는 개발자 AI가 화면을 동일하게 구현해야 한다면 별도 캡처보다 이 저장소의 React 컴포넌트와 CSS를 우선해야 합니다.

단, 여기서 “UI 원본”은 GHC를 별도 앱으로 새로 만들라는 뜻이 아닙니다. 기존 챗봇의 API, 세션, 스트리밍, 파일 업로드, 대화 기록, DB 연결은 유지하고, 기존 챗봇의 표현 계층만 이 저장소의 UI로 교체하라는 뜻입니다.

챗봇, 이미지 유사후보, 지도 위 도면 이미지 배치 UX까지 포함한 최신 상세 인수인계는 아래 문서가 최우선입니다.

```txt
AI_DEVELOPER_CHATBOT_HANDOFF.md
```

원본 기준:

```txt
UI 원본 = solvek-react/src/features/** 의 React 컴포넌트
스타일 원본 = solvekdesignsystem-web/css/index.css 와 하위 CSS
아이콘/이미지 원본 = solvekdesignsystem-web/image/**
챗봇 원본 = solvek-react/src/features/report-chat/**
메인 검색 원본 = solvek-react/src/features/report-search/**
```

챗봇에서 특히 유지해야 하는 최신 기능:

- 기존 챗봇 로그인, 사용자 세션, 대화방, 대화 기록, 질문 전송, AI 응답 스트리밍, 중단/재생성/복사, 파일 업로드 기능 보존
- 기존 챗봇 UI만 `solvek-react/src/features/report-chat/` 화면으로 교체
- 기존 챗봇 API 응답을 GHC UI 타입으로 변환하는 adapter 구성
- `data.ts` mock 응답은 운영 데이터로 사용하지 않음
- 이미지 업로드 후 AI 유사후보 표시
- 후보 카드의 `지도에서 보기` 클릭 시에만 지도 위 도면 배치 시작
- 적용 전 이미지 이동/비율 유지 resize/회전/투명도/삭제/초기화
- 적용 완료 시 기존 토스트 UI로 `적용 완료` 표시
- 적용 완료 후 지도 좌표에 이미지 고정
- 적용 완료 후 `수정`/`삭제` 관리 패널 제공
- PDF에서 추출한 도면/페이지 이미지를 API로 받아 사용
- 보고서 선택 수 제한은 프론트 하드코딩 금지

이 저장소 자체가 메인 검색 화면과 챗봇 화면의 UI 원본입니다.

개발자 또는 개발자 AI는 별도 이미지 캡처가 없어도 이 git 안의 React 코드, CSS 디자인시스템, 문서를 기준으로 화면을 동일하게 복사해야 합니다.

## Core Rule

이 git을 받으면 아래처럼 판단합니다.

```txt
UI 원본 = 현재 git의 React 화면 코드
기능 원본 = 기존 챗봇의 API/DB/AI/세션/스트리밍/업로드 로직
UI 이벤트 참고 = 현재 git의 React state/handler/props 흐름
스타일 원본 = solvekdesignsystem-web/css/index.css와 연결된 class
문서 원본 = 각 *_UI_SCREEN_SPEC.md와 *_UI_REPLACEMENT_HANDOFF.md
```

외부 캡처나 별도 디자인 파일은 있으면 도움이 되지만 필수는 아닙니다. 이 저장소에 들어 있는 현재 React UI가 최종 화면 기준입니다.

## Exact Original UI Source Paths

### Main Search UI Original

메인 검색 화면의 원본 UI 코드입니다.

| purpose | source path |
|---|---|
| 화면 컨테이너, 상태, 검색바, 하단 CTA | `solvek-react/src/features/report-search/MainSearchPage.tsx` |
| 검색 도우미, 단서 칩, 최근 검색어, 추천, 카드, 그룹, 빈 상태 | `solvek-react/src/features/report-search/components/ReportSearchSections.tsx` |
| 임시 보고서/검색 도우미/추천 데이터 | `solvek-react/src/features/report-search/data.ts` |
| 검색 유틸/그룹 유틸 | `solvek-react/src/features/report-search/searchUtils.ts` |
| 타입 | `solvek-react/src/features/report-search/types.ts` |
| motion 설정 | `solvek-react/src/features/report-search/motionConfig.ts` |

메인 UI 이식 문서:

| purpose | document |
|---|---|
| 화면/CSS/React 구분 정의 | `solvek-react/src/features/report-search/MAIN_UI_SCREEN_SPEC.md` |
| 기능 보존 계약 | `solvek-react/src/features/report-search/MAIN_UI_REPLACEMENT_HANDOFF.md` |
| 기능/API 상세 | `solvek-react/src/features/report-search/MAIN_SCREEN_SPEC.md` |
| 흐름 | `solvek-react/src/features/report-search/PROTOTYPE_FLOW.md` |
| 컴포넌트 규칙 | `solvek-react/src/features/report-search/COMPONENT_RULES.md` |

### Chat UI Original

챗봇 화면의 원본 UI 코드입니다.

| purpose | source path |
|---|---|
| 화면 컨테이너, 패널 상태, 메시지 상태, 검색 모달 상태 | `solvek-react/src/features/report-chat/ChatPage.tsx` |
| 왼쪽 선택 보고서 패널 | `solvek-react/src/features/report-chat/components/ReportChatSidePanel.tsx` |
| 중앙 대화, 추천 질문, 메시지, 첨부, 근거 요약 | `solvek-react/src/features/report-chat/components/ChatConversation.tsx` |
| 챗봇 안 보고서 검색 모달 | `solvek-react/src/features/report-chat/components/ChatSearchModal.tsx` |
| 오른쪽 원문 패널 | `solvek-react/src/features/report-chat/components/SourcePanel.tsx` |
| 오른쪽 지도 패널 | `solvek-react/src/features/report-chat/components/MapPanel.tsx` |
| 좌우 패널 resize 핸들 | `solvek-react/src/features/report-chat/components/ResizeHandle.tsx` |
| 임시 답변/근거/원문/지도 데이터와 width 상수 | `solvek-react/src/features/report-chat/data.ts` |
| 타입 | `solvek-react/src/features/report-chat/types.ts` |

챗봇 UI 이식 문서:

| purpose | document |
|---|---|
| 화면/CSS/React 구분 정의 | `solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md` |
| 기능 보존 계약 | `solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md` |
| 흐름 | `solvek-react/src/features/report-chat/PROTOTYPE_FLOW.md` |
| 컴포넌트 규칙 | `solvek-react/src/features/report-chat/COMPONENT_RULES.md` |

### Shared Style Original

공통 디자인시스템과 asset 원본입니다.

| purpose | source path |
|---|---|
| CSS entry | `solvekdesignsystem-web/css/index.css` |
| tokens | `solvekdesignsystem-web/css/tokens/` |
| default utilities | `solvekdesignsystem-web/css/default/` |
| buttons/search/checkbox/chip/modal/meta tag | `solvekdesignsystem-web/css/component/` |
| web UI kit | `solvekdesignsystem-web/css/uikit/web/` |
| map UI kit | `solvekdesignsystem-web/css/uikit/map/` |
| icons | `solvekdesignsystem-web/image/icon/` |

## How To View The Original UI

개발자 또는 AI가 같은 화면을 확인하려면 아래 명령을 실행합니다.

```bash
cd solvek-react
npm install
npm run dev
```

기본 로컬 주소:

```txt
http://localhost:5173/
```

현재 사용자가 확인하던 네트워크 주소 예:

```txt
http://192.168.0.75:5173/
```

메인 화면에서 보고서를 선택하고 `채팅하기`를 누르면 챗봇 화면으로 이동합니다.

## What “Copy The UI Exactly” Means

개발자 AI가 “이 git을 토대로 UI 화면을 만들어줘”라는 요청을 받으면 아래를 수행해야 합니다.

1. 이 저장소를 실행해서 현재 메인/챗봇 화면을 확인합니다.
2. 위 `Exact Original UI Source Paths`의 React 파일을 원본 UI 코드로 봅니다.
3. `solvekdesignsystem-web/css/index.css`를 원본 스타일로 봅니다.
4. 화면을 새 프로젝트나 백엔드 템플릿으로 옮길 경우, JSX/HTML 구조와 class 조합을 최대한 그대로 옮깁니다.
5. 기능은 `*_REPLACEMENT_HANDOFF.md`의 state/handler/props 계약대로 연결합니다.
6. 임의로 레이아웃을 재해석하거나 단순화하지 않습니다.

## No External Screenshot Required

이 git 안에 원본 UI 코드가 있으므로 캡처 이미지는 필수가 아닙니다.

캡처가 필요한 경우는 아래뿐입니다.

- 개발자 AI가 로컬 앱을 실행할 수 없는 경우
- 원본 React 코드가 아닌 별도 디자인 시안을 기준으로 바꾸는 경우
- 픽셀 비교 QA를 자동화하고 싶은 경우

그 외에는 이 저장소의 React 코드와 CSS를 원본으로 삼으면 됩니다.

## Do Not

- “캡처가 없으니 임의로 디자인을 새로 만든다”라고 판단하지 않습니다.
- 이 git의 React 화면을 참고용으로만 보고 새 UI를 창작하지 않습니다.
- GHC 저장소를 기존 챗봇과 분리된 별도 앱으로 새로 개발하지 않습니다.
- 기존 챗봇 화면 위에 iframe으로 얹지 않습니다.
- 기존 챗봇 API, 세션, 스트리밍, 업로드, 대화 기록 기능을 삭제하거나 전체 재작성하지 않습니다.
- `data.ts` mock 응답을 실제 API 응답처럼 사용하지 않습니다.
- 기존 CSS class를 버리고 새 스타일 체계를 만들지 않습니다.
- 메인/챗봇 컴포넌트 경계를 무시하지 않습니다.
- 보고서 선택 최대 개수를 프론트에 다시 하드코딩하지 않습니다.
- `slice(0, 2)`, `current.length >= 2`, `length > 2` 같은 임의 선택 제한을 되살리지 않습니다.

## Prompt For Developer AI

개발자가 AI에게 그대로 줄 수 있는 지시문입니다.

```txt
이 git 자체가 메인 검색 화면과 챗봇 화면의 UI 원본이다.
별도 캡처가 없어도 현재 React 코드와 CSS 디자인시스템을 기준으로 화면을 동일하게 복사해라.

먼저 UI_SOURCE_OF_TRUTH.md를 읽고,
메인은 MAIN_UI_SCREEN_SPEC.md와 MAIN_UI_REPLACEMENT_HANDOFF.md를 읽어라.
챗봇은 CHAT_UI_SCREEN_SPEC.md와 CHAT_UI_REPLACEMENT_HANDOFF.md를 읽어라.

UI는 현재 git의 React 화면과 동일하게 만들고,
기존 챗봇의 API, DB, AI, 세션, 스트리밍, 파일 업로드, 로그인, 대화 기록 기능은 유지해라.
기존 챗봇 UI만 이 git의 `solvek-react/src/features/report-chat/` 화면으로 교체해라.
GHC_repo를 별도 앱으로 새로 개발하거나 iframe으로 얹지 마라.
기존 챗봇 API 응답을 GHC UI 타입으로 변환하는 adapter를 만들어 연결해라.
검색, 단서, 보고서 선택, 채팅 진입, 채팅 입력, 파일 첨부, 원문/지도 패널, resize 기능을 삭제하지 마라.
보고서 선택 개수 제한은 프론트에 하드코딩하지 마라.
작업 후 npm run build로 검증해라.
```
