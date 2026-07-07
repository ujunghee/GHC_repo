# Report Search Feature

발굴보고서 검색 메인 화면입니다. `App.tsx`는 앱의 루트 역할만 하고, 실제 메인 화면 코드는 이 폴더에 모아둡니다.

## File Map

- `MainSearchPage.tsx`: 검색 화면의 상태, 검색어 입력, 결과 목록, 선택 후 채팅 CTA를 제어합니다.
- `data.ts`: 현재 프로토타입용 보고서 목록, 필터 칩, 검색 도우미 옵션입니다. 추후 API 응답으로 교체할 대상입니다.
- `types.ts`: 프론트엔드에서 기대하는 보고서 데이터와 화면 상태 타입입니다.
- `motionConfig.ts`: Framer Motion 애니메이션 설정입니다.

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

챗봇 화면이 추가되면 `App.tsx`에서 `MainSearchPage`와 `ChatPage`를 라우팅하면 됩니다.
