# GHC UI Prototype Handoff

## Latest AI Developer Handoff

개발자 또는 개발자 AI에게 이 git을 기준으로 UI 화면을 동일하게 복사 구현하게 하려면 아래 문서를 먼저 전달하세요.

```txt
AI_DEVELOPER_CHATBOT_HANDOFF.md
```

이 문서는 현재 React/CSS를 UI 원본으로 삼고, AI 챗봇 API, PDF에서 추출한 보고서 이미지, 유사후보, 지도 위 도면 배치/수정/삭제 UX까지 최신 상태로 설명합니다.

이 저장소는 Python 백엔드 프로젝트가 아니라, 최종 UI 화면과 사용자 이벤트 흐름을 정의한 React UI 프로토타입입니다.

백엔드 개발자 또는 AI 에이전트는 이 UI를 새로 만들거나 재구성하지 말고, 기존 Python 백엔드/API/DB/챗봇 기능을 현재 React UI에 연결하는 방식으로만 작업해야 합니다.

## UI 원본 기준

이 git 자체가 메인 검색 화면과 챗봇 화면의 UI 원본입니다. 별도 캡처가 없어도 현재 React 코드와 `solvekdesignsystem-web/css/index.css`를 기준으로 화면을 동일하게 복사할 수 있어야 합니다.

개발자 AI에게 “이 git을 토대로 UI 화면을 만들어줘”라고 전달할 때는 먼저 `UI_SOURCE_OF_TRUTH.md`를 읽게 하세요. 이 문서에 메인/챗봇 원본 React 파일 경로, CSS 원본 경로, 실행 방법, AI 지시문을 정리해두었습니다.

## 최우선 원칙

UI 화면, 컴포넌트 구조, CSS class, 사용자 이벤트 흐름은 변경하지 않습니다.

현재 React UI에서 발생하는 이벤트를 그대로 유지하고, 목업 데이터와 목업 응답만 기존 Python 백엔드 API로 교체합니다.

이 저장소의 React UI는 참고용이 아니라 실제로 그대로 사용할 최종 UI 기준입니다.

## 반드시 지켜야 할 원칙

1. UI 화면은 현재 구현된 React 화면을 그대로 사용한다.
2. 컴포넌트 구조, 레이아웃, CSS class, 디자인 시스템 사용 방식을 임의로 변경하지 않는다.
3. 검색, 필터, 보고서 선택, 채팅 시작, 채팅 입력, 근거 패널 열기/닫기 등 기존 사용자 이벤트 흐름을 변경하지 않는다.
4. 기존 `data.ts`의 목업 데이터와 목업 응답만 실제 백엔드 API 응답으로 교체한다.
5. React UI를 다시 만들지 않는다.
6. 기존 Python 백엔드 구조를 먼저 분석한 뒤, 필요한 API만 추가하거나 연결한다.
7. 대규모 리팩토링을 하지 않는다.
8. 기존 Markdown 문서의 화면 규칙과 컴포넌트 규칙을 먼저 읽고 따른다.

## 금지 사항

- 화면을 새로 만들지 않는다.
- 컴포넌트 레이아웃을 바꾸지 않는다.
- CSS class를 임의로 수정하지 않는다.
- 디자인 시스템 파일을 임의로 수정하지 않는다.
- 검색/선택/채팅/근거 패널 이벤트 흐름을 바꾸지 않는다.
- 기존 Markdown 규칙을 무시하지 않는다.
- 기존 React 컴포넌트를 대규모로 분해하거나 재작성하지 않는다.
- 백엔드 연결을 이유로 프론트 화면 동작을 단순화하지 않는다.
- 대규모 리팩토링을 하지 않는다.

## 허용 사항

- API 호출용 service 파일 추가
- API 호출용 hook 추가
- 백엔드 응답을 UI 타입에 맞추는 adapter 함수 추가
- `data.ts` 목업 데이터를 API 응답으로 대체
- 목업 응답을 실제 API 응답으로 대체
- 로딩 상태 추가
- 에러 상태 추가
- TypeScript 타입 보강

## 백엔드 개발자의 작업 범위

백엔드 개발자는 아래 작업만 수행합니다.

1. 보고서 검색 API 연결
2. 보고서 목록/상세 데이터 API 연결
3. 보고서 선택 상태를 채팅 화면으로 전달
4. 기존 Python 챗봇 API와 채팅 입력/응답 연결
5. 챗봇 답변에 대한 근거 문서, 페이지, 유사도, 원문 이미지 URL 데이터 연결
6. 목업 데이터(`data.ts`)를 API 호출 결과로 대체
7. 필요한 경우 API client, service, hook, adapter 계층 추가

## 먼저 확인할 파일

### 전체 흐름

- `UI_SOURCE_OF_TRUTH.md`
- `PROTOTYPE_OVERVIEW.md`
- `DEVELOPER_HANDOFF.md`
- `CLAUDE_CODE_IMPLEMENTATION_GUIDE.md`

### React UI

- `solvek-react/src/App.tsx`
- `solvek-react/src/features/report-search/MainSearchPage.tsx`
- `solvek-react/src/features/report-search/types.ts`
- `solvek-react/src/features/report-search/data.ts`
- `solvek-react/src/features/report-chat/ChatPage.tsx`
- `solvek-react/src/features/report-chat/types.ts`
- `solvek-react/src/features/report-chat/data.ts`

### UI 규칙

- `solvek-react/src/features/report-search/MAIN_UI_SCREEN_SPEC.md`
- `solvek-react/src/features/report-search/MAIN_UI_REPLACEMENT_HANDOFF.md`
- `solvek-react/src/features/report-search/MAIN_SCREEN_SPEC.md`
- `solvek-react/src/features/report-search/COMPONENT_RULES.md`
- `solvek-react/src/features/report-search/PROTOTYPE_FLOW.md`
- `solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md`
- `solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md`
- `solvek-react/src/features/report-chat/COMPONENT_RULES.md`
- `solvek-react/src/features/report-chat/PROTOTYPE_FLOW.md`

### 디자인 시스템

- `solvekdesignsystem-web/README.md`
- `solvekdesignsystem-web/CLAUDE.md`
- `solvekdesignsystem-web/css/index.css`

## AI 작업 지시문

개발자가 AI 에이전트에게 백엔드 연결 작업을 맡길 때 아래 문장을 그대로 사용할 수 있습니다.

```txt
이 저장소는 최종 UI 화면과 사용자 이벤트 흐름을 정의한 React UI 프로토타입이다.

UI 화면, 컴포넌트 구조, CSS class, 사용자 이벤트 흐름은 변경하지 않는다.
현재 React UI에서 발생하는 이벤트를 그대로 유지하고,
목업 데이터와 목업 응답만 기존 Python 백엔드 API로 교체한다.

금지 사항:
- 화면을 새로 만들지 말 것
- 컴포넌트 레이아웃을 바꾸지 말 것
- CSS class를 임의로 수정하지 말 것
- 검색/선택/채팅/근거 패널 이벤트 흐름을 바꾸지 말 것
- 기존 md 규칙을 무시하지 말 것
- 대규모 리팩토링하지 말 것

허용 사항:
- API 호출용 service/hook 추가
- data.ts 목업 데이터를 API 응답으로 대체
- 로딩/에러 상태 추가
- 타입 보강
- 백엔드 응답을 기존 UI 타입에 맞게 adapter 함수 추가

먼저 아래 문서를 읽고 작업한다.
- UI_SOURCE_OF_TRUTH.md
- PROTOTYPE_OVERVIEW.md
- DEVELOPER_HANDOFF.md
- solvek-react/src/features/report-search/MAIN_UI_SCREEN_SPEC.md
- solvek-react/src/features/report-search/MAIN_UI_REPLACEMENT_HANDOFF.md
- solvek-react/src/features/report-search/MAIN_SCREEN_SPEC.md
- solvek-react/src/features/report-search/COMPONENT_RULES.md
- solvek-react/src/features/report-search/PROTOTYPE_FLOW.md
- solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md
- solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md
- solvek-react/src/features/report-chat/COMPONENT_RULES.md
- solvek-react/src/features/report-chat/PROTOTYPE_FLOW.md
- solvekdesignsystem-web/README.md
- solvekdesignsystem-web/CLAUDE.md
- solvekdesignsystem-web/css/index.css

작업 범위는 기존 React UI에 Python 백엔드/API/DB/챗봇 기능을 연결하는 것뿐이다.
```

## 실행 방법

```bash
cd solvek-react
npm install
npm run dev
```

## 빌드 확인

```bash
cd solvek-react
npm run build
```
