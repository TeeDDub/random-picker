# 랜덤 조합 (Random Combination) — 설계 문서

- 작성일: 2026-07-04
- 대상 저장소: `TeeDDub/random-picker` (Next.js)
- 상태: 승인됨 (구현 계획 작성 전)

## 1. 개요

여러 "분류(카테고리)"를 각각 별도의 Google Sheet URL로 받아, 각 분류에서 **독립적으로 하나씩** 뽑아 하나의 조합으로 합쳐 보여주는 슬롯머신형 추첨 기능. 기존 "랜덤 추첨"이 하나의 통합 풀에서 항목 하나를 뽑는 것과 달리, 이 기능은 N개의 분류에서 각각 하나씩 뽑아 **라벨 튜플**로 조합한다.

예시 (분류 3개):
```
음식:   초밥
장소:   홍대
가격대: 2만원 이하
```

### 사용 시나리오
- "오늘 뭐하지": `[활동] × [장소] × [시간]`
- "메뉴 정하기": `[종류] × [메뉴] × [가격대]`

## 2. 범위

### 포함 (MVP)
- 입력/추첨/팀나누기 옆의 **4번째 탭 "랜덤 조합"**
- 분류를 가변 개수(최소 2개)로 추가/삭제, 각 분류는 `이름` + `시트 URL` 한 쌍
- 각 분류 시트를 gviz CSV로 불러와 옵션 목록 추출 (기존 로더 재사용)
- 각 분류에서 독립적으로 하나씩 무작위 추첨 (값 겹침 허용)
- 릴을 동시에 돌리고 **왼쪽부터 순차로 멈추는** 슬롯머신 스태거 애니메이션
- 결과를 `분류명 → 뽑힌 값` 라벨 튜플로 표시
- 조합 전용 히스토리 (최근 5개)
- 분류/입력값을 localStorage에 저장·복원

### 제외 (다음 단계)
- 배정(중복 없는 매칭), 특정 조합 금지 등 제약
- 분류별 가중치(`이름*3`)
- 문장 템플릿 출력("A가 B를 산다")
- 조합 결과 내 이미지/유튜브 미디어 렌더 (MVP는 텍스트 라벨만)

## 3. 데이터 모델

```ts
// types/index.ts 에 추가
export interface CombinationCategory {
  id: string;          // 안정적 고유 키 (추가 시점 기반)
  name: string;        // 사용자 입력 분류명 (라벨 튜플에 사용). 예: "음식"
  url: string;         // Google Sheet URL
  options: string[];   // 불러온 옵션 목록 (시트에서 추출)
}

export interface CombinationResult {
  timestamp: number;
  picks: { name: string; value: string }[];  // 분류명 → 뽑힌 값
}
```

- 이 모드의 상태는 기존 통합 풀(`allData`)과 **완전히 별개**다.
- localStorage 키:
  - `random-picker-combination-categories` → `CombinationCategory[]` (options 포함, 재방문 시 복원)
  - `random-picker-combination-history` → `CombinationResult[]` (최근 5개)

## 4. 시트 파싱 (기존 재사용 + 유연화)

기존 `lib/googleSheets.ts`의 gviz CSV URL 변환(`convertToCsvUrl`)과 CSV 파서(`parseCsvRows`)를 재사용한다. 단, 기존 `parseCsvData`는 "번호/제목/속성" 행 구조를 전제하고 열이 2개 미만인 행을 건너뛰므로, 단순 1열 리스트 시트를 위해 전용 함수를 추가한다.

```ts
// lib/googleSheets.ts 에 추가
export const fetchCategoryOptions = async (url: string): Promise<string[]> => {
  const csvUrl = convertToCsvUrl(url);           // 기존 재사용
  const response = await fetch(csvUrl);
  if (!response.ok) throw new Error('Failed to fetch data from Google Sheets');
  const text = await response.text();
  if (text.trimStart().startsWith('<')) throw new Error('Sheet is not shared publicly');

  const rows = parseCsvRows(text);               // 기존 재사용 (export 필요)
  return rows
    .slice(1)                                    // 첫 행은 헤더로 간주하여 제외 (기존 관례와 일치)
    .map(cols => (cols[1]?.trim() || cols[0]?.trim() || ''))  // 열 2개↑이면 제목 열, 아니면 첫 열
    .filter(Boolean);
};
```

- **파싱 규칙(명시적 결정)**: 첫 행은 헤더로 간주해 옵션에서 제외한다. 이는 기존 시트 관례와 일치하며, 사용자는 옵션 위에 헤더 행을 둔다. 옵션 값은 "2번째 열(제목)이 있으면 그것, 없으면 1번째 열".
- **중복 제거 안 함**: 같은 옵션이 여러 번 있으면 그대로 유지(단순성 우선; 가중치는 범위 밖이지만 자연스러운 부수효과).
- `parseCsvRows`는 현재 `googleSheets.ts` 내부 함수이므로 `export`로 노출한다.

## 5. 입력 UI

별도 컴포넌트 `components/CombinationInput.tsx` (독립·테스트 용이성 위해 인라인이 아닌 분리).

- 분류 행 리스트. 각 행: `이름` 입력칸 + `시트 URL` 입력칸 + `불러오기` 버튼 + `삭제` 버튼.
- 기본 2개 행으로 시작. "분류 추가" 버튼으로 행 추가, `삭제`로 자유롭게 제거(개수 하한 강제 없음).
- 분류 개수 하한은 UI에서 막지 않고 **추첨 활성 조건**으로만 강제한다(§6, §10). 즉 삭제는 항상 가능하되, 2개 미만이면 "돌리기"가 비활성.
- 각 행의 `불러오기`는 `fetchCategoryOptions(url)`를 호출해 해당 분류의 `options`를 채우고, 불러온 개수(예: "12개")를 행에 표시. 실패 시 행에 에러 메시지.
- 디자인: 기존 Nintendo 2001 크롬 스타일(`retro-panel`, `retro-input`, `retro-btn-*`, `retro-section-bar`) 재사용.

## 6. 추첨 & 애니메이션

새 컴포넌트 `components/CombinationPicker.tsx`.

- 전제: 분류 2개 이상 + 모든 분류의 `options.length >= 1`. 아니면 "돌리기" 비활성 + 안내 문구.
- 추첨: 각 분류에서 `options[Math.floor(Math.random() * options.length)]`로 **독립** 선택. 최종 조합을 미리 확정.
- 애니메이션(슬롯 스태거): 모든 릴이 동시에 자기 옵션들을 빠르게 순환 표시. 릴 i는 `baseDuration + i * stagger`(예: base 1500ms, stagger 400ms) 시점에 최종값으로 멈춤. 기존 룰렛의 점진 감속 타이밍/타이머 정리 패턴(`spinTimeoutRef`, 언마운트 clear, 중복 실행 가드)을 참고해 릴별로 관리.
- 릴 레이아웃: 가로 배치(슬롯머신 느낌), 화면 좁으면 세로 스택으로 반응형 전환.

## 7. 결과 (라벨 튜플)

- 모든 릴이 멈추면 최종 조합을 `분류명 → 뽑힌 값` 목록으로 강조 표시(기존 `retro-news-row`/`retro-display` 스타일 재사용).
- 텍스트 라벨만 렌더(이미지/유튜브 미디어는 범위 밖).
- 결과를 조합 히스토리에 추가.

## 8. 히스토리

새 컴포넌트 `components/CombinationHistory.tsx` (기존 `PickHistory`와 유사하되 튜플 표시).

- `CombinationResult[]`를 최근 5개까지 저장/표시. 각 항목: 타임스탬프 + 뽑힌 조합(분류명·값 나열).
- 기존 추첨 히스토리와 저장 키·컴포넌트 모두 분리.

## 9. 페이지 통합

`app/page.tsx`:
- `ViewMode` 타입에 `'combination'` 추가.
- 탭 버튼 "🎰 랜덤 조합" 추가 (기존 `retro-tab-*` 스타일).
- 조합 모드 상태(`categories`, `combinationHistory`)와 localStorage 로드/저장 effect 추가. 기존 `allData` 관련 로직과 독립.
- 조합 모드 렌더: 좌측 입력(`CombinationInput`) + 결과(`CombinationPicker`), 우측 히스토리(`CombinationHistory`) — 기존 그리드 레이아웃 관례 따름.

## 10. 엣지 케이스

- 분류 2개 미만: 추첨 비활성 + "분류를 2개 이상 추가하세요".
- 옵션 0개인 분류 존재: 추첨 비활성 + 해당 분류 표시.
- 시트 로드 실패(비공개/잘못된 URL): 기존 에러 메시지 재사용, 해당 분류 행에 표시.
- localStorage 접근 실패: 기존 앱의 try/catch 관례 따름(동작에 지장 없이 무시).

## 11. 신규/수정 파일 요약

- 신규: `components/CombinationInput.tsx`, `components/CombinationPicker.tsx`, `components/CombinationHistory.tsx`
- 신규 localStorage 헬퍼: `lib/localStorage.ts`에 조합용 get/save 추가
- 수정: `types/index.ts`(타입 추가), `lib/googleSheets.ts`(`fetchCategoryOptions` 추가, `parseCsvRows` export), `app/page.tsx`(4번째 모드 통합)

## 12. 검증

- `npm run build` 통과(타입체크 포함)
- dev 서버에서 분류 2~3개(공개 예시 시트)로 불러오기 → 추첨 → 결과·히스토리 확인
- 엣지 케이스 수동 확인(분류 1개, 빈 분류, 잘못된 URL)
