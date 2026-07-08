# Report Search Feature

발굴보고서 검색 메인 화면입니다. `App.tsx`는 앱의 루트 역할만 하고, 실제 메인 화면 코드는 이 폴더에 모아둡니다.

## File Map

- `MainSearchPage.tsx`: 검색 화면의 상태, 검색어 입력, 결과 목록, 선택 후 채팅 CTA를 제어합니다.
- `data.ts`: 현재 프로토타입용 보고서 목록, 필터 칩, 검색 도우미 옵션입니다. 추후 API 응답으로 교체할 대상입니다.
- `types.ts`: 프론트엔드에서 기대하는 보고서 데이터와 화면 상태 타입입니다.
- `motionConfig.ts`: Framer Motion 애니메이션 설정입니다.
- `components/ReportSearchSections.tsx`: 검색 도우미, 단서 칩, 결과 카드, 빈 상태 등 재사용 UI 섹션입니다.

## Backend Handoff Notes

현재 `reportData` 항목은 아래 필드를 기대합니다.

```ts
{
  id: number;
  year: string;
  title: string;
  summary: string;
  tags: string[];
}
```

메인 화면에서 필요한 API 후보는 다음과 같습니다.

- 보고서 검색: 검색어와 선택 단서를 받아 보고서 목록을 반환
- 최근 검색어: 사용자별 최근 검색어 저장 및 조회
- 추천 보고서: 최근 검색어 또는 선택 보고서를 기준으로 추천 목록 반환
- 채팅 시작: 선택한 보고서 `id` 목록을 챗봇 화면으로 전달

챗봇 화면 규칙은 `../report-chat/README.md`, `../report-chat/PROTOTYPE_FLOW.md`, `../report-chat/COMPONENT_RULES.md`를 확인합니다.

## Current UX Notes

- 보고서는 메인 화면에서 최대 2건까지 선택할 수 있습니다.
- 검색 결과가 없으면 선택 보고서와 하단 `채팅하기` CTA가 초기화됩니다.
- 단서 칩은 공통 `ClueChips`를 사용합니다.
- 단서 칩은 개별 X 삭제 대신 `초기화` 버튼으로 전체 초기화합니다.
- 칩 체크는 검색 조건의 활성/비활성 표시용입니다.
- 칩 영역이 사라질 때 아래 컨텐츠는 `LayoutGroup`으로 자연스럽게 올라옵니다.
- 반응형 보정은 디자인시스템의 `default/responsive.css` 또는 컴포넌트 구조 안에서 처리합니다.
