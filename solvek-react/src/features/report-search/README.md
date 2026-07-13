# 발굴보고서 메인 검색 화면 README

> 최신 기준 문서입니다. 새 UI를 그대로 입혀야 할 때는 `MAIN_UI_SCREEN_SPEC.md`를 먼저 읽고, 이어서 `MAIN_UI_REPLACEMENT_HANDOFF.md`를 읽습니다. 기능/API 중심 재구현은 `MAIN_SCREEN_SPEC.md`, `PROTOTYPE_FLOW.md`, `COMPONENT_RULES.md`를 함께 확인합니다.

## 목적

이 폴더는 발굴보고서 검색 메인 화면의 React 프로토타입입니다. Python 백엔드 개발자와 Claude Code 기반 AI가 같은 화면을 새로 구현할 수 있도록 기능, UI, 컴포넌트, API 기준을 문서화합니다.

## 파일 역할

- `MainSearchPage.tsx`: 검색어, 검색 도우미, 단서 칩, 최근 검색어, 추천 보고서, 결과 목록, 보고서 선택, 채팅 CTA 상태를 관리하는 메인 컨테이너입니다.
- `components/ReportSearchSections.tsx`: 메인 화면에서 쓰는 UI 섹션 컴포넌트 모음입니다.
- `data.ts`: 프로토타입용 임시 보고서 데이터와 검색 도우미 옵션입니다. 실제 개발에서는 Python API 응답으로 교체합니다.
- `types.ts`: `Report`, `ViewMode`, `HelperCategory` 타입 기준입니다.
- `motionConfig.ts`: 공통 인터랙션 값입니다.
- `MAIN_UI_SCREEN_SPEC.md`: 새 메인 UI 화면을 CSS, React 구분, 치수, 반응형, asset 기준으로 복사하기 위한 화면 정의서입니다.
- `MAIN_UI_REPLACEMENT_HANDOFF.md`: 새 메인 UI 화면을 덮어쓸 때 현재 검색/선택/채팅 CTA 기능을 보존하기 위한 인수인계 문서입니다.
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
- 보고서 선택 개수는 프론트에서 임의로 제한하지 않습니다.
- 그룹의 `채팅하기`는 그룹에 포함된 보고서 id 전체를 채팅 시작 흐름으로 전달합니다.
- 채팅 가능한 보고서 수 초과 등은 채팅 세션 생성 API 응답 메시지를 토스트로 표시합니다.
- 검색 결과가 없으면 빈 상태 화면을 보여주고 선택된 보고서와 하단 CTA를 초기화합니다.
- 선택된 보고서가 1건 이상이면 하단 fixed `채팅하기` 버튼을 표시합니다.

## Python 백엔드 API 필요 항목

- `GET /api/reports/search`: 검색어와 필터/단서를 받아 보고서 목록을 반환합니다.
- `POST /api/reports/groups`: 활성 키워드별 보고서 그룹을 반환합니다.
- `POST /api/reports/recommendations`: 최근 검색어 또는 사용자 맥락을 기준으로 추천 보고서를 반환합니다.
- `GET /api/users/{user_id}/search-history`: 최근 검색어 목록을 반환합니다.
- `POST /api/users/{user_id}/search-history`: 검색 성공 시 최근 검색어를 저장합니다.
- `POST /api/chat/sessions`: 선택된 보고서 id 목록으로 채팅 세션을 생성합니다. 허용 가능한 보고서 수와 실패 메시지는 이 API 응답을 기준으로 처리합니다.

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

새 UI를 그대로 입히는 경우:

1. `MAIN_UI_SCREEN_SPEC.md`
2. `MAIN_UI_REPLACEMENT_HANDOFF.md`
3. `MAIN_SCREEN_SPEC.md`
4. `PROTOTYPE_FLOW.md`
5. `COMPONENT_RULES.md`

기능/API 기준으로만 재구현하는 경우:

1. `MAIN_SCREEN_SPEC.md`
2. `PROTOTYPE_FLOW.md`
3. `COMPONENT_RULES.md`
