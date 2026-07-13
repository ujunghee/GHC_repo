# Report Chat Prototype Flow

## Latest Flow Summary

최신 상세 기준은 루트의 `AI_DEVELOPER_CHATBOT_HANDOFF.md`를 우선합니다.

이 챗봇은 AI 기반 보고서 질의 화면이며, 특히 이미지 업로드 후 보고서 PDF에서 추출한 도면/페이지 이미지와 비교해 유사후보를 제시하고, 후보 이미지를 지도 위에 배치하는 UX를 포함합니다.

기존 챗봇 저장소에 적용할 때는 이 flow를 별도 앱으로 새로 띄우지 않습니다. 기존 챗봇의 로그인, 세션, 대화방, 대화 기록, 질문 전송, AI 응답 스트리밍, 중단/재생성/복사, 파일 업로드, API/DB 연결은 유지하고, 기존 챗봇 UI만 GHC 화면으로 교체합니다.

`data.ts` mock 흐름은 화면 검증용입니다. 운영 통합에서는 기존 챗봇 API 응답을 adapter로 변환해 이 flow에 주입합니다.

## Image Match And Map Placement Flow

1. 사용자가 채팅 입력창의 파일 첨부 버튼으로 이미지를 업로드합니다.
2. 업로드된 이미지는 채팅 입력창 안에서 고정 preview로 표시됩니다.
3. 사용자가 메시지를 전송합니다.
4. 실제 구현에서는 upload API가 `imageFileId`, `previewUrl`을 반환하고, chat/image-search API가 유사후보를 반환해야 합니다.
5. assistant 메시지는 업로드 이미지에 대한 해석 문구와 유사후보 목록을 표시합니다.
6. 유사후보 카드는 `pageLabel`, `typeLabel`, `similarity`, `reportTitle`, `title`, `thumbnailUrl`을 표시합니다.
7. 후보 카드의 `지도에서 보기`를 클릭하면 우측 지도 패널이 열립니다.
8. 클릭한 후보만 active 상태가 되며 카드 border와 버튼이 blue-500 상태가 됩니다.
9. 지도 패널은 후보의 `mapOverlayImageUrl`을 최초부터 적용 완료 상태로 지도 위에 표시합니다.
10. 적용 완료 상태의 이미지는 Leaflet pane 내부 custom DOM overlay로 지도 좌표에 고정됩니다.
11. 최초 진입 시에는 조정 핸들, 회전, 키보드 이동, X 삭제 버튼이 보이지 않습니다.
12. 우하단 관리 패널에서 `이미지 수정` 또는 `이미지 삭제`를 제공합니다.
13. `이미지 수정`을 누르면 현재 지도 위치 기준으로 편집 모드가 됩니다.
14. 편집 모드에서 사용자는 이미지를 드래그 이동, 모서리 resize, 회전, 투명도 조정, 키보드 이동할 수 있습니다.
15. resize는 이미지 비율을 유지해야 합니다.
16. 모서리 resize 점 위에서는 resize가 우선이고, 점 바깥 모서리 회전 영역에서는 cursor만 회전 아이콘으로 바뀝니다.
17. `이미지 적용 완료`를 누르면 기존 `복사 완료` 토스트와 같은 UI로 `적용 완료`가 표시됩니다.
18. 적용 완료 후 이미지는 다시 지도 좌표에 고정됩니다.
19. `이미지 삭제`를 누르면 적용된 지도 이미지 overlay와 편집 상태가 모두 제거됩니다.
20. 채팅 입력창의 첨부 preview에는 이동/회전/resize 조작을 제공하지 않습니다.

## Map Settings Popup Flow

- 확장 지도 설정 패널은 좌측 고정 패널로 표시합니다.
- 지도 설정을 최소화하면 지도 위 floating popup으로 표시합니다.
- 최소화된 지도 설정 popup은 헤더 영역을 마우스로 드래그해 이동할 수 있습니다.
- popup 안의 확장 아이콘 버튼은 기존처럼 클릭으로 동작해야 하며 drag와 충돌하면 안 됩니다.

## Expected API Flow

```txt
POST /chat/uploads
  -> imageFileId, previewUrl

POST /chat/image-search
  -> message, drawingCandidates[]

GET /reports/{reportId}/drawings/{drawingId}/image
  -> mapOverlayImageUrl

GET /reports/{reportId}/pages/{pageNumber}
  -> source page image or PDF viewer URL
```

프론트는 PDF를 직접 파싱하지 않습니다. PDF 페이지 rasterizing, 도면 crop, thumbnail 생성, 지도 배치용 이미지 생성은 서버/API 책임입니다.

## Toast Flow

토스트는 기존 공통 토스트 UI를 사용합니다.

- 원문 복사 성공: `복사 완료`
- 지도 이미지 적용 성공: `적용 완료`
- API 오류: API가 반환한 `message`
- 네트워크 오류: fallback 오류 문구

보고서 선택 개수 변경, 후보 카드 선택, 지도 패널 열기, 원문 패널 열기에는 토스트를 띄우지 않습니다.

이 문서는 `ChatPage.tsx`와 `components/` 기준의 챗봇 화면 흐름입니다.

## Entry Flow

1. 메인 검색 화면에서 보고서를 선택합니다.
2. 하단 `채팅하기` 버튼을 누릅니다.
3. `MainSearchPage`가 `onStartChat(selectedReports)`를 호출합니다.
4. `App.tsx`가 선택한 id를 저장하고 `view`를 `chat`으로 변경합니다.
5. `App.tsx`가 `reportData`에서 선택 id와 일치하는 `Report[]`를 찾아 `ChatPage`에 전달합니다.

## Chat Layout

챗봇 화면은 세 영역으로 구성됩니다.

| area | component | role |
|---|---|---|
| left | `ReportChatSidePanel` | 선택 보고서 목록 |
| center | `ChatConversation` | 대화 본문과 입력 |
| right | `SourcePanel` | AI 답변 근거 원문 |

## Left Panel Flow

왼쪽 패널은 메인 화면에서 선택한 보고서만 기본 목록으로 보여줍니다.

동작:
- `홈으로`를 누르면 검색 화면으로 돌아갑니다.
- `검색`을 누르면 `ChatSearchModal`이 열립니다.
- 전체 선택은 현재 패널 보고서 전체를 체크합니다.
- 이미 전체 선택된 상태에서 다시 누르면 첫 번째 보고서 1건만 남깁니다.
- 개별 checkbox는 다중 선택을 지원합니다.
- 마지막 1건은 해제되지 않습니다.
- 가운데 선을 드래그하면 패널 너비를 조절합니다.
- 최소 너비보다 더 줄이면 패널이 접힙니다.
- 접힌 후에는 왼쪽 arrow 버튼으로 다시 펼칩니다.

## Conversation Flow

초기 상태:
- 선택 보고서 총 건수를 안내합니다.
- `도움이 필요한가요?` 아래에 맞춤 제안 버튼을 표시합니다.

질문 전송:
- 추천 질문 버튼 클릭 또는 하단 input submit으로 질문을 전송합니다.
- 현재 프로토타입은 사용자 메시지와 임시 assistant 메시지를 추가합니다.
- 실제 API 연결 시 `sendMessage`에서 채팅 API 호출로 교체합니다.

선택 보고서가 없는 예외 상태:
- 중앙에 `보고서를 선택해주세요` 문구를 표시합니다.
- 하단 input submit은 동작하지 않습니다.

## Evidence Flow

AI 답변에 근거가 있으면 답변 아래에 근거 요약을 표시합니다.

근거 항목:
- 조사 위치
- 주요 유구
- 출토 유물
- 핵심 결과

각 항목 옆에 표시되는 action:
- `원문 p.12 ~ 16`: 원문 패널 열기
- `지도`: 추후 지도 연결 placeholder

## Source Panel Flow

1. 사용자가 답변 근거의 `원문` 버튼을 누릅니다.
2. `ChatConversation`이 `onOpenSource`를 호출합니다.
3. `ChatPage`가 `isSourcePanelOpen`을 true로 변경합니다.
4. `SourcePanel`이 오른쪽에서 열립니다.
5. 오른쪽 상단 layout icon으로 원문 패널을 접거나 펼칠 수 있습니다.

원문 패널 표시 정보:
- `similarityScore`: AI가 찾은 근거와 원문 페이지의 유사도
- `pageLabel`: 원문 페이지
- `title`: 보고서명
- `pageImageUrl`: DB 원문 이미지 URL

`pageImageUrl`이 없으면 placeholder를 표시합니다.

## Chat Search Modal Flow

검색 모달은 챗봇 화면 안에서 보고서를 추가/선택하는 용도입니다.

동작:
- 검색어 입력 시 결과가 실시간으로 바뀝니다.
- 결과 기준 데이터는 메인 검색과 같은 `reportData`입니다.
- 필터 아이콘을 누르면 검색 도우미 팝업이 열립니다.
- 팝업 바깥을 클릭하면 닫힙니다.
- 선택한 단서는 공통 `ClueChips`로 표시됩니다.
- `초기화`를 누르면 단서가 사라지고 아래 컨텐츠가 자연스럽게 위로 이동합니다.
- 검색 결과가 없으면 메인과 같은 `EmptyState`를 표시합니다.
- 보고서를 체크하면 왼쪽 패널 목록에 추가됩니다.
- 체크된 보고서는 검색 결과 상단으로 올라옵니다.
- 체크 시 스크롤 위치는 유지합니다.

## Responsive Flow

반응형 보정은 디자인시스템의 `default/responsive.css` 또는 컴포넌트 구조 안에서 처리합니다.

- `1024px 이하`: 좌측/우측 패널을 fixed overlay처럼 표시합니다.
- `768px 이하`: 검색 모달과 채팅 input 폭을 화면에 맞춥니다.
- `520px 이하`: 검색 모달은 full screen에 가깝게 표시합니다.

## API Replacement Points

| current code | real API role |
|---|---|
| `reportData` | 보고서 검색/조회 API |
| `searchedReports` | 검색 모달 결과 API |
| `createAssistantMessage` | 챗봇 답변 API |
| `answerFacts` | 답변 근거 추출 결과 |
| `sourceDocument` | 원문 페이지 이미지/유사도 API |
