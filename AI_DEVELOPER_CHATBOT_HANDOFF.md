# AI Developer Chatbot UI Handoff

이 문서는 개발자 또는 개발자 AI에게 이 git을 기준으로 챗봇 UI를 동일하게 복사 구현하고, 실제 백엔드/API/PDF 처리 기능에 연결하기 위한 최신 인수인계 문서입니다.

핵심 원칙은 다음과 같습니다.

```txt
화면 원본 = 현재 git의 React 컴포넌트와 solvekdesignsystem-web CSS
기능 원본 = 현재 React state / props / handler 흐름
데이터 원본 = 현재 data.ts의 mock 구조를 실제 API 응답으로 치환
이미지 원본 = 보고서 PDF에서 추출한 페이지/도면 이미지 URL 또는 blob
AI 응답 원본 = 챗봇 API가 반환하는 answer, evidence, source, drawingCandidates
```

별도 캡처 이미지를 기준으로 재창작하지 말고, 이 git의 UI 코드를 그대로 원본으로 삼아야 합니다.

## 반드시 먼저 읽을 파일

1. `UI_SOURCE_OF_TRUTH.md`
2. `DEVELOPER_HANDOFF.md`
3. `solvek-react/src/features/report-chat/README.md`
4. `solvek-react/src/features/report-chat/CHAT_UI_SCREEN_SPEC.md`
5. `solvek-react/src/features/report-chat/CHAT_UI_REPLACEMENT_HANDOFF.md`
6. `solvek-react/src/features/report-chat/PROTOTYPE_FLOW.md`
7. `solvek-react/src/features/report-chat/COMPONENT_RULES.md`
8. `solvekdesignsystem-web/css/index.css`
9. `solvekdesignsystem-web/css/component/map-panel.css`
10. `solvekdesignsystem-web/css/component/search.css`
11. `solvekdesignsystem-web/css/default/component.css`
12. `solvekdesignsystem-web/css/default/icon.css`

## 실행 방법

```bash
cd solvek-react
npm install
npm run dev
```

네트워크 공유용 dev server가 필요하면 다음처럼 실행합니다.

```bash
cd solvek-react
npm exec -- parcel serve index.html --host 0.0.0.0 --port 5173 --no-cache
```

현재 사용자가 확인하던 주소 예시는 다음입니다.

```txt
http://192.168.0.75:5173/
```

## UI 원본 파일 맵

챗봇 화면은 아래 파일들이 원본입니다.

| 영역 | 원본 파일 | 설명 |
|---|---|---|
| 화면 상태/레이아웃 | `solvek-react/src/features/report-chat/ChatPage.tsx` | 좌측 보고서 패널, 중앙 챗봇, 우측 source/map 패널, resize, 검색 모달 상태를 관리 |
| 중앙 채팅 | `solvek-react/src/features/report-chat/components/ChatConversation.tsx` | 메시지, 이미지 첨부, 유사후보 카드, 근거 요약, 복사 토스트 |
| 좌측 보고서 목록 | `solvek-react/src/features/report-chat/components/ReportChatSidePanel.tsx` | 선택된 보고서 목록, 전체 선택, 체크박스, 검색 진입 |
| 보고서 검색 모달 | `solvek-react/src/features/report-chat/components/ChatSearchModal.tsx` | 챗봇 화면 안에서 보고서 추가 검색 및 선택 |
| 우측 원문 패널 | `solvek-react/src/features/report-chat/components/SourcePanel.tsx` | 원문 페이지/유사도/본문 보기 패널 |
| 우측 지도 패널 | `solvek-react/src/features/report-chat/components/MapPanel.tsx` | Leaflet 지도, 지도 설정, 레이어, 이미지 비교 도면 배치 UX |
| resize 핸들 | `solvek-react/src/features/report-chat/components/ResizeHandle.tsx` | 좌측/우측 패널 너비 조절 |
| mock 데이터/API 치환 지점 | `solvek-react/src/features/report-chat/data.ts` | assistant mock, drawingCandidates, sourceDocument, mapDocument, 패널 너비 상수 |
| 타입 | `solvek-react/src/features/report-chat/types.ts` | ChatMessage, DrawingCandidate, SourceDocument, MapDocument 등 |

공통 스타일은 아래를 원본으로 사용합니다.

| 스타일 영역 | 파일 |
|---|---|
| CSS entry | `solvekdesignsystem-web/css/index.css` |
| 버튼 | `solvekdesignsystem-web/css/component/button.css` |
| 검색창 | `solvekdesignsystem-web/css/component/search.css` |
| 지도 패널 | `solvekdesignsystem-web/css/component/map-panel.css` |
| 공통 토스트 | `solvekdesignsystem-web/css/default/component.css` |
| 아이콘 | `solvekdesignsystem-web/css/default/icon.css`, `solvekdesignsystem-web/image/icon/` |
| 지도/도면 샘플 | `solvekdesignsystem-web/image/sample/report-page-map.svg` |

## 화면 레이아웃 기준

### 전체 구조

챗봇 화면은 세 영역입니다.

1. 좌측 보고서 패널
2. 중앙 AI 챗봇 대화 영역
3. 우측 원문/지도 패널

우측 패널은 `rightPanelMode`에 따라 `source` 또는 `map`을 보여줍니다.

```ts
type RightPanelMode = "none" | "source" | "map";
```

우측 패널은 사용자가 source/map 버튼을 누를 때 열립니다. 패널 너비는 `data.ts`의 `sourcePanelMinWidth`, `sourcePanelMaxWidth`, `getRightPanelWidth`, `getRightPanelMaxWidth` 흐름을 유지합니다.

### 폰트 크기

사용자 요청 기준:

- 최대 폰트 크기: 16px
- 최소 폰트 크기: 13px
- 기존 디자인 시스템 클래스 사용
- 임의로 큰 hero typography를 만들지 말 것

주요 클래스:

- `body2-sb-16`
- `body2-r-16`
- `body3-sb-14`
- `body3-r-14`
- `body4-r-13`

### 버튼

기존 `button.css`의 클래스를 사용합니다.

- 기본 보조 버튼: `slate-50-button-32`
- 활성/선택 버튼: `blue-button-32`
- 아이콘 버튼: 기존 transparent/button class 조합 사용

유사후보 카드의 `지도에서 보기` 또는 `원문 보기` 버튼을 누르면:

- 해당 카드 border: `border-blue-500`
- 클릭된 버튼: `blue-button-32`
- 지도 아이콘은 활성 상태에서 흰색으로 보이도록 유지

## 챗봇 기능 흐름

### 진입

1. 메인 검색 화면에서 보고서를 선택합니다.
2. 하단 또는 그룹 헤더의 `채팅하기`를 누릅니다.
3. 선택된 report ids가 `App.tsx`로 전달됩니다.
4. `App.tsx`는 `reportData`에서 해당 reports를 찾고 `ChatPage`에 넘깁니다.
5. `ChatPage`는 좌측 패널에 선택 보고서를 표시합니다.

중요:

- 프론트에서 보고서 선택 최대 개수를 임의 제한하지 않습니다.
- 2건, 5건, 그 이상 여부는 백엔드/서버 성능/API 정책으로 결정합니다.
- 프론트는 선택한 ids 전체를 챗봇 세션 생성 API에 전달합니다.
- API가 제한 초과를 반환하면 API 메시지를 토스트로 표시합니다.

### 기본 대화

`ChatConversation`은 다음을 담당합니다.

- 추천 질문 버튼 표시
- 사용자 메시지 렌더링
- assistant 메시지 렌더링
- 이미지 첨부 preview
- 이미지 업로드 후 유사후보 응답 표시
- 근거 요약 표시
- 원문/지도 패널 열기
- 복사 완료 토스트 표시

현재 mock 흐름:

```ts
sendMessage(text, imageUrl?)
```

- `imageUrl`이 없으면 `createAssistantMessage`
- `imageUrl`이 있으면 `createImageMatchAssistantMessage`

실제 구현에서는 이 부분을 챗봇 API로 대체합니다.

## AI 챗봇 API 연결 지침

실제 서비스에서는 다음 API 계층을 예상합니다.

### 챗봇 세션 생성

```http
POST /chat/sessions
```

요청 예:

```ts
type CreateChatSessionRequest = {
  reportIds: number[];
};
```

응답 예:

```ts
type CreateChatSessionResponse = {
  sessionId: string;
  reports: Report[];
};
```

오류 예:

```ts
type ChatSessionError = {
  code:
    | "REPORT_LIMIT_EXCEEDED"
    | "SERVER_BUSY"
    | "REPORT_NOT_READY"
    | "FORBIDDEN"
    | "UNKNOWN";
  message: string;
  maxReports?: number;
};
```

토스트는 `error.message`를 그대로 우선 표시합니다. 메시지가 없을 때만 fallback 문구를 사용합니다.

### 메시지 전송

```http
POST /chat/messages
```

요청 예:

```ts
type SendChatMessageRequest = {
  sessionId: string;
  text: string;
  reportIds: number[];
  imageFileId?: string;
};
```

응답 예:

```ts
type ChatAnswerResponse = {
  id: string;
  answer: string;
  evidence?: AnswerFact[];
  sourceDocuments?: SourceDocument[];
  drawingCandidates?: DrawingCandidate[];
};
```

현재 `ChatMessage`와 매핑합니다.

```ts
type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  imageUrl?: string;
  hasEvidence?: boolean;
  drawingCandidates?: DrawingCandidate[];
};
```

### 이미지 업로드

```http
POST /chat/uploads
```

요청은 multipart/form-data를 권장합니다.

응답 예:

```ts
type UploadImageResponse = {
  imageFileId: string;
  previewUrl: string;
  mimeType: string;
  width: number;
  height: number;
};
```

프론트는 현재 object URL을 사용하지만 실제 구현에서는 `previewUrl`을 표시합니다.

## 이미지 비교 및 유사후보 UX

이미지를 업로드하고 메시지를 보내면 assistant는 유사후보를 반환합니다.

현재 타입:

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

실제 API에서는 PDF에서 추출한 도면/페이지 이미지를 썸네일과 지도 배치용 이미지로 내려줘야 합니다.

```ts
type DrawingCandidateFromApi = {
  id: string;
  reportId: number;
  reportTitle: string;
  pageNumber: number;
  pageLabel: string;
  typeLabel: "도면" | "사진" | "표" | string;
  title: string;
  similarity: number;
  thumbnailUrl: string;
  mapOverlayImageUrl: string;
  sourcePageImageUrl?: string;
  hasSource: boolean;
  geoReference?: {
    center?: { lat: number; lng: number };
    bounds?: {
      northWest: { lat: number; lng: number };
      southEast: { lat: number; lng: number };
    };
  };
};
```

### PDF 이미지 추출

실제 서비스에서는 이미지 후보를 다음 방식 중 하나로 생성합니다.

- 보고서 PDF 페이지를 서버에서 rasterize하여 page image 생성
- 페이지 안의 도면 영역을 OCR/layout 분석으로 crop
- crop 이미지를 thumbnailUrl로 제공
- 지도 위에 올릴 고해상도 crop 또는 page image를 `mapOverlayImageUrl`로 제공
- 원문 보기에는 PDF viewer URL 또는 page image URL 제공

프론트에서 PDF를 직접 분석하지 말고, 서버/API가 추출한 URL을 받아 렌더링하는 구조가 적합합니다.

## 유사후보 카드 UI

`ChatConversation.tsx`의 `DrawingCandidateSummary`가 원본입니다.

구성:

- 썸네일 영역
- `pageLabel | typeLabel | 유사도 n%`
- 보고서명
- 후보 도면 제목
- `지도에서 보기` 버튼
- 후보에 따라 `원문 보기` 버튼

동작:

- `지도에서 보기` 클릭 시 해당 후보 카드 border가 blue-500
- 클릭한 버튼이 blue-500
- 지도 아이콘은 활성 시 흰색
- `onOpenMap(candidate)` 호출
- `ChatPage`가 `MapOverlayRequest`를 생성하고 `MapPanel`에 전달

## 지도 패널

`MapPanel.tsx`가 원본입니다.

지도는 Leaflet 기반입니다.

기능:

- 기본 지도 표시
- 지도 타입 토글
- 지도 설정 패널
- 레이어 체크 tree
- 활성 레이어 최대 5개 관리
- Pin.svg 마커
- 마커 hover tooltip
- 우측 지도 도구 버튼
- 우측/좌측 패널 위에 떠 있는 지도 설정 UI
- source/map 패널 resize
- 이미지 비교 후보를 지도 위에 배치

## 지도 이미지 배치 UX

이미지는 항상 보이면 안 됩니다. 이미지 비교 플로우에서만 등장합니다.

정상 흐름:

1. 사용자가 이미지 업로드
2. 메시지 전송
3. AI가 유사후보 반환
4. 사용자가 후보 카드의 `지도에서 보기` 클릭
5. 우측 패널이 `map`으로 열림
6. 해당 후보의 `mapOverlayImageUrl` 또는 fallback 이미지가 지도 위에 편집 가능한 상태로 표시
7. 사용자가 이미지 위치/크기/회전/투명도를 조정
8. `이미지 적용 완료` 클릭
9. `적용 완료` 토스트 표시
10. 이미지가 지도 좌표에 고정된 상태로 전환
11. 관리 패널에서 `수정` 또는 `삭제` 가능

### 적용 전 편집 상태

적용 전 이미지는 React overlay입니다.

지원 기능:

- 드래그 이동
- 키보드 방향키 이동
- Shift + 방향키 더 크게 이동
- Delete/Backspace 삭제
- 모서리 resize
- 모서리 근처 rotation cursor
- 투명도 slider
- 미세 조정 버튼
- 크기 +/- 버튼
- 회전 버튼
- 초기화
- 이미지 삭제
- 이미지 적용 완료

리사이즈는 이미지 비율을 유지합니다.

모서리의 resize 점 위에서는 resize가 우선입니다. 점 바깥 모서리 회전 영역에 마우스를 올리면 cursor만 회전 아이콘으로 바뀝니다. 화면에 별도 회전 아이콘은 표시하지 않습니다.

회전 커서 파일:

- `solvekdesignsystem-web/image/icon/divert-right.svg`
- `solvekdesignsystem-web/image/icon/divert-right-ne.svg`
- `solvekdesignsystem-web/image/icon/divert-right-sw.svg`
- `solvekdesignsystem-web/image/icon/divert-right-se.svg`

### 적용 완료 상태

적용 완료 후 이미지는 편집 overlay가 아닙니다.

현재 구현은 Leaflet pane 내부에 커스텀 DOM overlay를 생성합니다.

이유:

- 화면 좌표에 붙이면 지도 이동/확대 시 이미지가 흔들림
- 일반 React absolute overlay는 지도 애니메이션보다 늦게 위치를 재계산함
- Leaflet pane에 들어가야 지도와 같은 좌표계에서 움직임
- 단, Leaflet `imageOverlay`처럼 갑자기 다른 이미지 레이어로 갈아끼운 느낌을 피하기 위해 커스텀 DOM overlay 사용

적용 완료 후:

- 지도 좌표에 고정
- 지도 이동/확대/축소 시 지도와 함께 이동/수축
- 조정 핸들 숨김
- 드래그/키보드 이동 비활성
- 회전/삭제 X 버튼 비활성
- 우하단 `이미지 적용 완료 / 지도 위치에 고정됨` 관리 패널 표시
- `수정`: 현재 지도 위치 기준으로 다시 편집 overlay로 전환
- `삭제`: Leaflet pane DOM overlay 제거

### 지도 이미지 적용 토스트

`이미지 적용 완료` 클릭 시 기존 `복사 완료` 토스트 UI와 동일한 클래스를 사용합니다.

클래스:

```txt
toast active bg-blue-50 radius-md-8 shadow-lg px-16 py-8 flex align-center gap-6 z-index-10
```

motion:

```ts
initial={{ opacity: 0, y: -32, x: "-50%" }}
animate={{ opacity: 1, y: 0, x: "-50%" }}
exit={{ opacity: 0, y: -24, x: "-50%" }}
transition={springSoft}
```

지도 패널 안에서 보이도록 인라인 style로 `position: absolute`, `zIndex: 1300`, `top: 3.2rem`, `left: 50%`를 지정합니다.

## 토스트 정책

보고서 선택 개수 제한을 프론트에서 임의로 토스트하지 않습니다.

토스트가 뜨는 경우:

- 원문 요약 복사 성공: `복사 완료`
- 지도 이미지 적용 완료: `적용 완료`
- API가 명시적으로 오류를 반환한 경우: API message 표시
- 네트워크 실패/timeout: fallback 오류 표시

토스트가 뜨지 않는 경우:

- 보고서 체크/해제
- 보고서 2건/5건 선택
- 결과 없음 상태
- 유사후보 카드 선택
- 지도 패널 열기
- 원문 패널 열기

## 원문 패널

`SourcePanel.tsx`가 원본입니다.

실제 API는 아래 형태를 반환해야 합니다.

```ts
type SourceDocument = {
  title: string;
  pageLabel: string;
  pageImageUrl?: string;
  similarityScore: number;
};
```

원문 보기:

- 후보 카드의 `원문 보기` 클릭
- 우측 패널을 source로 열기
- 선택한 후보의 source page 또는 PDF viewer URL 표시
- 현재 prototype은 placeholder/mock image 구조

## 지도/주소/마커

현재 지도는 Leaflet입니다.

마커:

- `solvekdesignsystem-web/image/icon/Pin.svg` 사용
- hover 시 주소와 보고서 정보 tooltip 표시
- tooltip 텍스트는 넘치지 않게 CSS에서 wrap 처리

주소:

- 지도 중심 좌표 변경 시 reverse geocoding으로 `displayLocation`을 갱신하는 구조
- 실제 API에서는 지도 중심 좌표 또는 후보 geoReference 기준 주소를 반환
- 좌표 문자열만 표시하지 말고 `함안 윤내리 1443 번지` 같은 주소형 문자열을 우선 표시

## z-index 정책

레이어 우선순위:

1. 검색 모달/검색 팝업
2. resize handle
3. 지도 안 UI, 지도 설정 패널, 지도 도구, 이미지 조정/관리 패널
4. 지도 이미지 overlay
5. 지도 canvas/tile

기존 주요 값:

- 검색 팝업: 1300 계열
- resize handle: 1200 계열
- 지도 UI 패널: 900
- 지도 편집 이미지 overlay: 700
- 지도 canvas: 0

토스트는 지도 패널 안에서 `zIndex: 1300`로 표시합니다.

## 백엔드/API 치환 지점

| 현재 mock/프론트 코드 | 실제 치환 대상 |
|---|---|
| `createAssistantMessage` | AI 챗봇 답변 API |
| `createImageMatchAssistantMessage` | 이미지 기반 유사 도면 검색 API |
| `drawingCandidates` | PDF 추출/벡터 검색 기반 후보 API |
| `sourceDocument` | PDF page viewer/source API |
| `mapDocument` | GIS/map layer metadata API |
| `reportData` | 보고서 검색 API |
| object URL preview | upload API `previewUrl` |
| `mapOverlayImageUrl ?? sample svg` | PDF에서 추출한 도면/페이지 이미지 URL |

## 추천 API 목록

```http
GET /reports
POST /chat/sessions
POST /chat/messages
POST /chat/uploads
POST /chat/image-search
GET /reports/{reportId}/pages/{pageNumber}
GET /reports/{reportId}/pages/{pageNumber}/image
GET /reports/{reportId}/drawings/{drawingId}/image
GET /maps/layers
GET /maps/reverse-geocode?lat=&lng=
```

이미지 검색 API 예:

```ts
type ImageSearchRequest = {
  sessionId: string;
  imageFileId: string;
  reportIds: number[];
  text?: string;
};

type ImageSearchResponse = {
  message: string;
  candidates: DrawingCandidateFromApi[];
};
```

## 개발자 AI에게 줄 프롬프트

```txt
이 git 자체가 UI 원본이다.
캡처 이미지가 없어도 현재 React 컴포넌트와 solvekdesignsystem-web CSS를 기준으로 화면을 동일하게 복사 구현해라.

먼저 AI_DEVELOPER_CHATBOT_HANDOFF.md, UI_SOURCE_OF_TRUTH.md, DEVELOPER_HANDOFF.md를 읽어라.
챗봇 화면은 ChatPage.tsx, ChatConversation.tsx, MapPanel.tsx, SourcePanel.tsx, ReportChatSidePanel.tsx를 원본으로 봐라.
스타일은 solvekdesignsystem-web/css/index.css와 component CSS를 원본으로 봐라.

기능은 현재 state/props/handler 흐름을 유지하되 mock data.ts는 실제 API 응답으로 치환해라.
이미지 비교 후보는 PDF에서 추출한 도면/페이지 이미지 URL을 API로 받아서 표시해라.
지도 배치 이미지는 이미지 비교 후보에서 '지도에서 보기'를 눌렀을 때만 나타나야 한다.
이미지 적용 완료 후에는 지도 좌표에 고정되고, 수정/삭제 관리 UX를 제공해야 한다.

보고서 선택 최대 개수는 프론트에서 하드코딩하지 마라.
API 오류가 있을 때만 API message를 토스트로 표시해라.

작업 후 npm run build로 검증해라.
```

