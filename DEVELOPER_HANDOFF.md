# GHC Prototype Developer Handoff

## Latest AI Developer Handoff

가장 최신 챗봇 UI, 이미지 유사후보, 지도 도면 배치, PDF 이미지 추출/API 연결 지침은 아래 문서를 최우선으로 읽어야 합니다.

```txt
AI_DEVELOPER_CHATBOT_HANDOFF.md
```

개발자 또는 개발자 AI에게 “이 git 파일을 참고해서 UI 화면을 그대로 복사해서 사용해줘”라고 전달할 때는 위 문서를 함께 전달하세요. 이 문서는 현재 git의 React/CSS를 UI 원본으로 삼고, AI 챗봇 API, PDF에서 추출한 이미지, 지도 위 이미지 배치/수정/삭제 UX까지 최신 상태로 정리합니다.

중요: 기존 챗봇 화면 위에 이 UI를 덮는 작업이라면, GHC를 별도 앱으로 새로 만들거나 iframe으로 얹지 않습니다. 기존 챗봇의 로그인, 세션, 대화방, 대화 기록, 질문 전송, AI 응답 스트리밍, 중단/재생성/복사, 파일 업로드, 오류/로딩 처리, 백엔드 API, DB 연결은 유지하고 UI만 교체합니다.

최신 구현 기준:

- 화면 원본: 현재 git의 React 컴포넌트
- 스타일 원본: `solvekdesignsystem-web/css/index.css` 및 component CSS
- 챗봇 기능 원본: `solvek-react/src/features/report-chat/`
- 기존 기능 원본: 실제 챗봇 저장소의 API/DB/AI/세션/스트리밍/업로드 로직
- 통합 방식: 기존 챗봇 API 응답을 GHC UI 타입으로 변환하는 adapter 구성
- 금지 방식: 별도 앱 개발, iframe overlay, 기존 챗봇 기능 전체 재작성, `data.ts` mock 운영 사용
- 이미지 비교 후보: API가 PDF에서 추출한 도면/페이지 이미지 URL을 반환
- 지도 배치 이미지: 이미지 비교 후보의 `지도에서 보기`에서만 등장
- 지도 배치 이미지 최초 상태: 적용 완료 상태로 지도 좌표에 고정
- 관리 UX: `이미지 수정` 클릭 시에만 이동/회전/resize 편집 UI 표시, `이미지 삭제` 제공
- 채팅 첨부 이미지: 고정 preview만 제공, 이동/회전/resize 금지
- 최소화 지도 설정 popup: 헤더 drag로 위치 이동 가능
- 토스트: 기존 `복사 완료` 토스트 UI와 동일한 클래스/모션 사용
- 보고서 선택 최대 개수: 프론트에서 임의 제한 금지, API 정책으로 처리

이 저장소는 가야역사문화권 발굴보고서 검색/챗봇 프로토타입 전달본입니다. 개발자가 새 UI 화면을 다시 만들거나 개발자용 AI에게 구현을 맡길 때는 아래 읽기 순서를 전달 체크리스트로 사용합니다.

## Read Order

1. `AI_DEVELOPER_CHATBOT_HANDOFF.md`
2. `UI_SOURCE_OF_TRUTH.md`
3. `DEVELOPER_HANDOFF.md`
4. `PROTOTYPE_OVERVIEW.md`
5. `solvek-react/src/features/report-search/README.md`
6. `solvek-react/src/features/report-search/MAIN_UI_SCREEN_SPEC.md`
7. `solvek-react/src/features/report-search/MAIN_UI_REPLACEMENT_HANDOFF.md`
8. `solvek-react/src/features/report-search/PROTOTYPE_FLOW.md`
9. `solvek-react/src/features/report-search/COMPONENT_RULES.md`
10. `solvek-react/src/features/report-chat/README.md`
11. `solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md`
12. `solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md`
13. `solvek-react/src/features/report-chat/PROTOTYPE_FLOW.md`
14. `solvek-react/src/features/report-chat/COMPONENT_RULES.md`
15. `solvekdesignsystem-web/css/index.css`
16. `solvekdesignsystem-web/README.md`
17. `solvekdesignsystem-web/CLAUDE.md`

## Project Map

- `solvek-react/`: 현재 동작하는 React 프로토타입입니다.
- `UI_SOURCE_OF_TRUTH.md`: 이 git 자체가 UI 원본임을 명시하고 메인/챗봇 원본 React 파일과 CSS 경로를 안내하는 최상위 문서입니다.
- `solvek-react/src/App.tsx`: 앱 루트입니다. 메인 검색 화면과 보고서 채팅 화면 전환을 관리합니다.
- `solvek-react/src/features/report-chat/ChatPage.tsx`: 선택한 보고서 기반 채팅 화면 컨테이너입니다.
- `solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md`: 사용자가 제공한 새 챗봇 UI 화면을 CSS/React 구분/치수/반응형 기준으로 복사하기 위한 화면 정의서입니다.
- `solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md`: 사용자가 제공한 새 챗봇 UI 화면을 기능 손상 없이 덮어쓰기 위한 최우선 상세 인수인계 문서입니다.
- `solvek-react/src/features/report-chat/components/`: 채팅 본문, 선택 보고서 패널, 검색 모달, 원문/지도 패널 컴포넌트입니다.
- `solvek-react/src/features/report-search/MainSearchPage.tsx`: 발굴보고서 검색 메인 화면의 상태와 화면 흐름입니다.
- `solvek-react/src/features/report-search/MAIN_UI_SCREEN_SPEC.md`: 사용자가 제공한 새 메인 UI 화면을 CSS/React 구분/치수/반응형 기준으로 복사하기 위한 화면 정의서입니다.
- `solvek-react/src/features/report-search/MAIN_UI_REPLACEMENT_HANDOFF.md`: 새 메인 UI 화면을 기능 손상 없이 덮어쓰기 위한 인수인계 문서입니다.
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
- 키워드별 보고서 결과 그룹
- 결과 없음 상태
- 보고서 선택 후 하단 채팅 CTA
- API 응답 기반 토스트
- 선택 보고서 기반 채팅 화면
- 채팅 화면의 선택 보고서 패널
- 채팅 화면의 보고서 검색 모달
- 채팅 답변의 근거 버튼
- 오른쪽 원문 패널과 유사도 표시
- 오른쪽 지도 패널, 지도 설정, 레이어, 마커 tooltip
- 최소화 지도 설정 popup drag 이동
- 이미지 업로드 기반 AI 유사후보 카드
- 유사후보의 `지도에서 보기` 기반 도면 이미지 배치/적용/수정/삭제
- 채팅 메시지 영역과 메시지 입력 영역

현재 `채팅하기` 버튼은 선택한 보고서 id를 `App.tsx`로 넘기고, `App.tsx`가 해당 id에 맞는 `Report[]`를 찾아 `ChatPage`로 전달합니다. 실제 AI 답변/API/PDF 추출/GIS 데이터는 아직 mock 구조이며, 현재 React state/handler 흐름을 유지한 채 API 응답으로 치환해야 합니다.

기존 챗봇에 이식할 때는 위 prototype 흐름을 그대로 새 앱으로 띄우지 말고, 기존 챗봇의 세션/메시지/스트리밍/upload service를 유지한 상태에서 GHC UI 이벤트와 연결합니다. `data.ts`는 타입과 화면 예시 확인용이며 운영 데이터 원본이 아닙니다.

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
- `POST /report-groups`: 활성 키워드별 그룹 결과 반환
- `GET /reports/recommendations`: 추천 보고서
- `POST /search-history`: 최근 검색어 저장
- `POST /chat/sessions`: 선택 보고서 기반 채팅 세션 생성
- `POST /chat/messages`: 질문 전송 및 답변/근거 수신
- `POST /chat/uploads`: 챗봇 이미지 첨부 업로드
- `POST /chat/image-search`: 업로드 이미지와 보고서 PDF 추출 이미지 유사후보 검색
- `GET /reports/{id}/pages/{page}`: 원문 이미지 또는 뷰어 URL 조회
- `GET /reports/{id}/drawings/{drawingId}/image`: 지도 배치용 도면/페이지 이미지 URL 조회
- `GET /maps/reverse-geocode?lat=&lng=`: 지도 중심 좌표 기반 주소 조회

## Important Notes For AI Implementation

- 디자인은 반드시 `solvekdesignsystem-web/css/index.css`와 기존 class를 기준으로 재현합니다.
- 실제 화면 흐름은 React TSX가 기준입니다. 디자인시스템 MD는 class와 디자인 규칙의 보조 자료입니다.
- `solvekdesignsystem-web/README.md`와 `CLAUDE.md`에는 원본 디자인시스템의 확장 폴더 설명이 일부 남아 있습니다. 현재 전달본에는 `components/`, `docs/`, `solvek-web/` 폴더가 없으므로, 없는 파일 링크를 따라가지 말고 `css/`, `image/`, React TSX, 이 문서들을 기준으로 구현합니다.
- 결과 없음 상태에서는 선택된 보고서를 초기화하고 하단 채팅 CTA를 숨깁니다.
- 보고서 선택 개수는 프론트에서 임의로 제한하지 않습니다. 서버 성능과 백엔드 정책에 따라 채팅 세션 생성 API에서 허용 범위를 판단합니다.
- 그룹 헤더의 `채팅하기`는 해당 그룹의 보고서 id 전체를 채팅 시작 흐름으로 전달합니다.
- 챗봇 화면의 좌측 패널은 메인에서 선택한 보고서만 기본 목록으로 사용합니다.
- 챗봇 화면에서는 최소 1건 이상 선택 상태를 유지합니다.
- 원문 패널의 `similarityScore`는 버튼이 아니라 AI가 찾은 근거와 원문 페이지의 유사도 표시값입니다.
- 지도 위 도면 이미지는 이미지 유사후보의 `지도에서 보기`를 눌렀을 때만 표시합니다.
- 지도 위 도면 이미지는 최초 진입부터 적용 완료 상태로 고정하고, `이미지 수정`을 눌렀을 때만 편집합니다.
- 채팅 입력창 첨부 이미지는 고정 preview이며, 편집 기능은 지도 도면 overlay에만 적용합니다.
- 최소화된 지도 설정 popup은 헤더 drag로 위치 이동할 수 있습니다.
- PDF 페이지 rasterizing, 도면 crop, thumbnail 생성, 지도 배치용 이미지 생성은 서버/API 책임입니다.

## Toast Logic

프론트가 임의로 보고서 개수를 제한해서 토스트를 띄우지 않습니다. 토스트는 API 응답 또는 명확한 클라이언트 오류가 있을 때만 표시합니다.

- 보고서 카드 선택/해제: 토스트를 띄우지 않습니다. 사용자가 여러 건을 자유롭게 선택할 수 있어야 합니다.
- 하단 `채팅하기`: 선택 id 목록 전체로 채팅 세션 생성 API를 호출합니다. API가 성공하면 채팅 화면으로 이동합니다.
- 그룹 헤더 `채팅하기`: 그룹의 보고서 id 전체로 채팅 세션 생성 API를 호출합니다. 프론트에서 앞 2건 또는 5건으로 자르지 않습니다.
- API가 선택 개수 초과를 반환할 때: API 응답의 메시지를 그대로 토스트에 표시합니다. 예: `선택 가능한 보고서는 최대 5건입니다.`
- API가 서버 처리량 부족, 파일 인덱싱 미완료, 권한 문제처럼 채팅 세션을 만들 수 없는 사유를 반환할 때: API 응답의 사용자 표시용 메시지를 토스트에 표시합니다.
- API 메시지가 없을 때: 프론트 공통 fallback 문구를 사용합니다. 예: `채팅을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.`
- 네트워크 실패 또는 timeout: `서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.` 토스트를 표시합니다.
- 결과 없음 상태: 선택 보고서와 하단 CTA만 초기화하고 토스트는 띄우지 않습니다.
- 원문 요약 복사 성공: 챗봇 답변 영역의 `복사 완료` 토스트는 별도 UX입니다. 보고서 선택 제한과 무관합니다.

권장 API 응답 형태:

```ts
type ChatSessionError = {
  code: "REPORT_LIMIT_EXCEEDED" | "SERVER_BUSY" | "REPORT_NOT_READY" | "FORBIDDEN" | "UNKNOWN";
  message: string;
  maxReports?: number;
};
```
