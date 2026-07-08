# 발굴보고서 메인 검색 화면 README

> 최신 기준 문서입니다. 아래에 남아 있는 이전 본문보다 이 섹션과 `MAIN_SCREEN_SPEC.md`, `PROTOTYPE_FLOW.md`, `COMPONENT_RULES.md`를 우선합니다.

## 목적

이 폴더는 발굴보고서 검색 메인 화면의 React 프로토타입입니다. Python 백엔드 개발자와 Claude Code 기반 AI가 같은 화면을 새로 구현할 수 있도록 기능, UI, 컴포넌트, API 기준을 문서화합니다.

## 파일 역할

- `MainSearchPage.tsx`: 검색어, 검색 도우미, 단서 칩, 최근 검색어, 추천 보고서, 결과 목록, 보고서 선택, 채팅 CTA 상태를 관리하는 메인 컨테이너입니다.
- `components/ReportSearchSections.tsx`: 메인 화면에서 쓰는 UI 섹션 컴포넌트 모음입니다.
- `data.ts`: 프로토타입용 임시 보고서 데이터와 검색 도우미 옵션입니다. 실제 개발에서는 Python API 응답으로 교체합니다.
- `types.ts`: `Report`, `ViewMode`, `HelperCategory` 타입 기준입니다.
- `motionConfig.ts`: 공통 인터랙션 값입니다.
- `MAIN_SCREEN_SPEC.md`: 메인 화면 전체 기능, UI, API, CSS/JS 규칙을 정리한 상세 전달 문서입니다.
- `PROTOTYPE_FLOW.md`: 사용자 흐름과 상태 전환 규칙입니다.
- `COMPONENT_RULES.md`: 컴포넌트별 책임과 재구현 규칙입니다.

## 현재 메인 기능

- 검색어 입력 즉시 보고서 목록을 필터링합니다.
- 검색 버튼을 누르면 결과가 있는 검색어만 최근 검색어로 저장합니다.
- 최근 검색한 보고서는 검색바 바로 아래에 표시합니다.
- 최근 검색어가 5개 이상이고 추천 결과가 있으면 추천 보고서를 전체 보고서 리스트 바로 위에 표시합니다.
- 검색 도우미 팝업에서 지역, 소재지, 시대 단서를 추가합니다.
- 선택한 단서는 공통 `ClueChips`로 표시하고, 활성 칩은 blue 상태만 사용합니다.
- 칩 선택 또는 필터 선택이 있으면 결과를 키워드별 그룹으로 묶어 표시합니다.
- 보고서는 최대 2건까지만 선택할 수 있습니다.
- 그룹의 `채팅하기` 대상이 3건 이상이면 자동으로 앞 2건만 선택하고 토스트를 띄웁니다.
- 검색 결과가 없으면 빈 상태 화면을 보여주고 선택된 보고서와 하단 CTA를 초기화합니다.
- 선택된 보고서가 1건 이상이면 하단 fixed `채팅하기` 버튼을 표시합니다.

## Python 백엔드 API 필요 항목

- `GET /api/reports/search`: 검색어와 필터/단서를 받아 보고서 목록을 반환합니다.
- `POST /api/reports/groups`: 활성 키워드별 보고서 그룹을 반환합니다.
- `POST /api/reports/recommendations`: 최근 검색어 또는 사용자 맥락을 기준으로 추천 보고서를 반환합니다.
- `GET /api/users/{user_id}/search-history`: 최근 검색어 목록을 반환합니다.
- `POST /api/users/{user_id}/search-history`: 검색 성공 시 최근 검색어를 저장합니다.
- `POST /api/chat/sessions`: 선택된 보고서 id 목록으로 채팅 세션을 생성합니다.

## 데이터 기준

```ts
type Report = {
  id: number;
  year: string;
  title: string;
  summary: string;
  tags: string[];
};
```

## 구현 시 우선 읽을 문서

1. `MAIN_SCREEN_SPEC.md`
2. `PROTOTYPE_FLOW.md`
3. `COMPONENT_RULES.md`

---

## Legacy Notes

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
- 키워드별 그룹 검색: 활성 단서/필터 키워드별 보고서 그룹을 반환
- 최근 검색어: 사용자별 최근 검색어 저장 및 조회
- 추천 보고서: 최근 검색어 또는 선택 보고서를 기준으로 추천 목록 반환
- 채팅 시작: 선택한 보고서 `id` 목록을 챗봇 화면으로 전달

챗봇 화면 규칙은 `../report-chat/README.md`, `../report-chat/PROTOTYPE_FLOW.md`, `../report-chat/COMPONENT_RULES.md`를 확인합니다.

## Current UX Notes

- 보고서는 메인 화면에서 최대 2건까지 선택할 수 있습니다.
- 활성 단서 칩 또는 필터가 있으면 결과는 키워드별 그룹으로 표시합니다.
- 그룹 헤더의 `채팅하기`가 3건 이상을 대상으로 하면 앞 2건만 선택하고 토스트를 띄운 뒤 하단 `채팅하기`를 누르게 합니다.
- 검색 결과가 없으면 선택 보고서와 하단 `채팅하기` CTA가 초기화됩니다.
- 단서 칩은 공통 `ClueChips`를 사용합니다.
- 단서 칩은 개별 X 삭제 대신 `초기화` 버튼으로 전체 초기화합니다.
- 칩 체크는 검색 조건의 활성/비활성 표시용이며, 체크 아이콘 없이 blue 활성 스타일만 사용합니다.
- 칩 영역이 사라질 때 아래 컨텐츠는 `LayoutGroup`으로 자연스럽게 올라옵니다.
- 반응형 보정은 디자인시스템의 `default/responsive.css` 또는 컴포넌트 구조 안에서 처리합니다.
