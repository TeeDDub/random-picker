# 랜덤 조합 (Random Combination) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 분류별 Google Sheet에서 하나씩 뽑아 라벨 튜플로 조합하는 슬롯머신형 추첨 모드 "랜덤 조합"을 추가한다.

**Architecture:** 기존 통합 풀과 독립된 4번째 모드. 순수 로직(옵션 추출·조합 뽑기)은 `lib/`에 분리해 Vitest로 단위 테스트하고, UI(입력·추첨·히스토리)는 별도 컴포넌트로 만들어 `app/page.tsx`에 통합한다. 시트 로딩은 기존 gviz CSV 파이프라인을 재사용한다.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, react-icons. 신규: Vitest(순수 로직 단위 테스트).

## Global Constraints

- 런타임/프레임워크: Next.js 16, React 19, TypeScript — 기존 설정 유지, 버전 변경 금지.
- 스타일: 신규 UI는 기존 Nintendo 2001 크롬 유틸리티 클래스(`retro-panel`, `retro-panel-surface`, `retro-section-bar`, `retro-plate`, `retro-news-row`, `retro-hero`, `retro-display`, `retro-input`, `retro-btn`, `retro-btn-signal`, `retro-btn-carbon`, `retro-tab-active`, `retro-tab-idle`, `retro-status-error`)만 사용. 새 색/그림자 토큰 도입 금지.
- 커밋 아이덴티티: 이 저장소의 로컬 git 설정(user.name=TeeDDub)으로 커밋. 별도 지정 불필요.
- 경로 별칭: `@/` = 프로젝트 루트.
- 각 태스크 종료 시 `npm run build`가 통과해야 한다(타입 에러 0).
- 커밋은 태스크 단위로, 각 태스크 마지막 스텝에서 수행.

---

## File Structure

- `vitest.config.ts` — 신규. Vitest 설정(node 환경, `@/` 별칭, `lib/**/*.test.ts` 포함).
- `package.json` — 수정. `vitest` devDependency + `"test": "vitest run"` 스크립트.
- `lib/googleSheets.ts` — 수정. `parseCsvRows` export, 순수 `extractOptions(rows)` 추가, `fetchCategoryOptions(url)` 추가.
- `lib/combination.ts` — 신규. 순수 `pickCombination(categories)`, `canPickCombination(categories)`.
- `types/index.ts` — 수정. `CombinationCategory`, `CombinationPick`, `CombinationResult` 추가.
- `lib/localStorage.ts` — 수정. 조합용 카테고리/히스토리 get·save 헬퍼.
- `components/CombinationInput.tsx` — 신규. 분류 행 입력 UI.
- `components/CombinationPicker.tsx` — 신규. 슬롯 애니메이션 + 결과 튜플.
- `components/CombinationHistory.tsx` — 신규. 조합 히스토리 표시.
- `app/page.tsx` — 수정. 4번째 모드 "랜덤 조합" 통합.

---

### Task 1: Vitest 설정 + 옵션 추출 순수 로직

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `lib/googleSheets.ts`
- Test: `lib/googleSheets.test.ts`

**Interfaces:**
- Consumes: 기존 `parseCsvRows(csvText: string): string[][]` (현재 `lib/googleSheets.ts` 내부 const).
- Produces: `export const parseCsvRows`, `export const extractOptions(rows: string[][]): string[]`.

- [ ] **Step 1: Vitest 설치**

Run:
```bash
cd ~/prjs/random-picker && npm install -D vitest
```
Expected: 설치 성공, `package.json`의 devDependencies에 `vitest` 추가됨.

- [ ] **Step 2: `package.json`에 test 스크립트 추가**

`scripts`에 다음 줄을 추가(기존 스크립트 유지):
```json
    "test": "vitest run"
```

- [ ] **Step 3: `vitest.config.ts` 작성**

```ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': resolve(process.cwd(), '.') },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: 실패하는 테스트 작성 — `lib/googleSheets.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { extractOptions } from './googleSheets';

describe('extractOptions', () => {
  it('첫 행을 헤더로 간주해 제외한다', () => {
    expect(extractOptions([['음식'], ['초밥'], ['국밥']])).toEqual(['초밥', '국밥']);
  });

  it('열이 2개 이상이면 제목(2번째) 열을 옵션으로 쓴다', () => {
    expect(
      extractOptions([['no', 'title'], ['1', '초밥'], ['2', '국밥']])
    ).toEqual(['초밥', '국밥']);
  });

  it('공백을 trim하고 빈 값을 제외한다', () => {
    expect(extractOptions([['h'], ['  초밥  '], ['']])).toEqual(['초밥']);
  });

  it('데이터 행이 없으면 빈 배열', () => {
    expect(extractOptions([['헤더만']])).toEqual([]);
  });
});
```

- [ ] **Step 5: 테스트 실패 확인**

Run: `npm run test`
Expected: FAIL — `extractOptions` is not exported / not a function.

- [ ] **Step 6: 구현 — `lib/googleSheets.ts` 수정**

`parseCsvRows`의 선언을 `const parseCsvRows`에서 `export const parseCsvRows`로 바꾼다. 그리고 파일에 다음 함수를 추가한다(예: `parseCsvRows` 정의 바로 아래):

```ts
/**
 * CSV 행 배열에서 분류 옵션 목록을 추출한다.
 * 첫 행은 헤더로 간주해 제외하고, 각 데이터 행은 2번째 열(제목)이 있으면
 * 그것을, 없으면 1번째 열을 옵션 값으로 쓴다. 공백은 trim, 빈 값은 제외한다.
 */
export const extractOptions = (rows: string[][]): string[] =>
  rows
    .slice(1)
    .map((cols) => (cols[1]?.trim() || cols[0]?.trim() || ''))
    .filter(Boolean);
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `npm run test`
Expected: PASS — 4개 테스트 통과.

- [ ] **Step 8: 빌드 확인**

Run: `npm run build`
Expected: Compiled successfully (타입 에러 없음).

- [ ] **Step 9: 커밋**

```bash
git add vitest.config.ts package.json package-lock.json lib/googleSheets.ts lib/googleSheets.test.ts
git commit -m "feat: 분류 옵션 추출 로직 + Vitest 설정"
```

---

### Task 2: 분류 시트 로더 `fetchCategoryOptions`

**Files:**
- Modify: `lib/googleSheets.ts`
- Test: `lib/googleSheets.test.ts`

**Interfaces:**
- Consumes: `convertToCsvUrl(url: string): string`, `parseCsvRows`, `extractOptions` (Task 1).
- Produces: `export const fetchCategoryOptions(url: string): Promise<string[]>`.

- [ ] **Step 1: 실패하는 테스트 추가 — `lib/googleSheets.test.ts` 하단에 append**

```ts
import { afterEach, vi } from 'vitest';
import { fetchCategoryOptions } from './googleSheets';

describe('fetchCategoryOptions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('공개 시트 CSV에서 옵션을 추출한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '헤더\n초밥\n국밥',
    }));
    await expect(fetchCategoryOptions('https://docs.google.com/spreadsheets/d/ABC/edit#gid=0'))
      .resolves.toEqual(['초밥', '국밥']);
  });

  it('응답이 비정상이면 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, text: async () => '' }));
    await expect(fetchCategoryOptions('https://docs.google.com/spreadsheets/d/ABC/edit'))
      .rejects.toThrow('Failed to fetch data from Google Sheets');
  });

  it('HTML(로그인 페이지)이 오면 비공개로 판단해 에러를 던진다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => '<!doctype html>...' }));
    await expect(fetchCategoryOptions('https://docs.google.com/spreadsheets/d/ABC/edit'))
      .rejects.toThrow('Sheet is not shared publicly');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test`
Expected: FAIL — `fetchCategoryOptions` is not exported.

- [ ] **Step 3: 구현 — `lib/googleSheets.ts`에 추가**

`fetchGoogleSheetsData` 아래(또는 `extractOptions` 아래)에 추가:

```ts
/**
 * 분류(카테고리) 시트를 gviz CSV로 불러와 옵션 목록을 반환한다.
 * 기존 fetchGoogleSheetsData와 동일한 CORS/비공개 시트 처리를 하되,
 * 행 구조 대신 단일 옵션 목록(extractOptions)을 뽑는다.
 */
export const fetchCategoryOptions = async (url: string): Promise<string[]> => {
  const csvUrl = convertToCsvUrl(url);
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch data from Google Sheets');
  }
  const text = await response.text();
  if (text.trimStart().startsWith('<')) {
    throw new Error('Sheet is not shared publicly');
  }
  return extractOptions(parseCsvRows(text));
};
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test`
Expected: PASS — 신규 3개 포함 전체 통과.

- [ ] **Step 5: 빌드 확인**

Run: `npm run build`
Expected: Compiled successfully.

- [ ] **Step 6: 커밋**

```bash
git add lib/googleSheets.ts lib/googleSheets.test.ts
git commit -m "feat: 분류 시트 로더 fetchCategoryOptions"
```

---

### Task 3: 타입 + localStorage 헬퍼

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/localStorage.ts`

**Interfaces:**
- Produces (types): `CombinationCategory { id: string; name: string; url: string; options: string[] }`, `CombinationPick { name: string; value: string }`, `CombinationResult { timestamp: number; picks: CombinationPick[] }`.
- Produces (localStorage): `getCombinationCategories(): CombinationCategory[]`, `saveCombinationCategories(c: CombinationCategory[]): void`, `getCombinationHistory(): CombinationResult[]`, `addToCombinationHistory(r: CombinationResult): void`, `clearCombinationHistory(): void`.

- [ ] **Step 1: 타입 추가 — `types/index.ts` 하단에 append**

```ts
export interface CombinationCategory {
  id: string;
  name: string;
  url: string;
  options: string[];
}

export interface CombinationPick {
  name: string;
  value: string;
}

export interface CombinationResult {
  timestamp: number;
  picks: CombinationPick[];
}
```

- [ ] **Step 2: localStorage 헬퍼 추가 — `lib/localStorage.ts`**

파일 상단 import에 새 타입을 추가한다(기존 import 줄 수정):
```ts
import { DataItem, GoogleSheetsData, PickHistory, CombinationCategory, CombinationResult } from '@/types';
```

`STORAGE_KEYS` 객체에 키 2개 추가:
```ts
  COMBINATION_CATEGORIES: 'random-picker-combination-categories',
  COMBINATION_HISTORY: 'random-picker-combination-history',
```

파일 하단 `clearAll` 정의 위에 헬퍼를 추가:
```ts
// Combination (랜덤 조합) 전용 저장 — 기존 통합 풀과 독립
export const getCombinationCategories = (): CombinationCategory[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMBINATION_CATEGORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load combination categories:', error);
    return [];
  }
};

export const saveCombinationCategories = (categories: CombinationCategory[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.COMBINATION_CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save combination categories:', error);
  }
};

export const getCombinationHistory = (): CombinationResult[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMBINATION_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load combination history:', error);
    return [];
  }
};

export const addToCombinationHistory = (result: CombinationResult): void => {
  if (typeof window === 'undefined') return;
  try {
    const current = getCombinationHistory();
    const next = [result, ...current].slice(0, 5); // 최근 5개
    localStorage.setItem(STORAGE_KEYS.COMBINATION_HISTORY, JSON.stringify(next));
  } catch (error) {
    console.error('Failed to save combination history:', error);
  }
};

export const clearCombinationHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.COMBINATION_HISTORY);
};
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: Compiled successfully.

- [ ] **Step 4: 커밋**

```bash
git add types/index.ts lib/localStorage.ts
git commit -m "feat: 랜덤 조합 타입 및 localStorage 헬퍼"
```

---

### Task 4: 조합 뽑기 순수 로직 `lib/combination.ts`

**Files:**
- Create: `lib/combination.ts`
- Test: `lib/combination.test.ts`

**Interfaces:**
- Consumes: `CombinationCategory`, `CombinationPick` (Task 3).
- Produces: `pickCombination(categories: CombinationCategory[]): CombinationPick[]`, `canPickCombination(categories: CombinationCategory[]): boolean`.

- [ ] **Step 1: 실패하는 테스트 작성 — `lib/combination.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { pickCombination, canPickCombination } from './combination';
import { CombinationCategory } from '@/types';

const cat = (name: string, options: string[]): CombinationCategory => ({
  id: name, name, url: '', options,
});

describe('canPickCombination', () => {
  it('분류 2개 이상 + 모든 분류에 옵션이 있으면 true', () => {
    expect(canPickCombination([cat('음식', ['초밥']), cat('장소', ['홍대'])])).toBe(true);
  });
  it('분류가 1개면 false', () => {
    expect(canPickCombination([cat('음식', ['초밥'])])).toBe(false);
  });
  it('옵션이 빈 분류가 있으면 false', () => {
    expect(canPickCombination([cat('음식', ['초밥']), cat('장소', [])])).toBe(false);
  });
});

describe('pickCombination', () => {
  it('분류마다 하나씩 뽑아 이름과 값을 반환한다', () => {
    const categories = [cat('음식', ['초밥', '국밥']), cat('장소', ['홍대'])];
    const picks = pickCombination(categories);
    expect(picks).toHaveLength(2);
    expect(picks[0].name).toBe('음식');
    expect(['초밥', '국밥']).toContain(picks[0].value);
    expect(picks[1]).toEqual({ name: '장소', value: '홍대' });
  });

  it('여러 번 뽑아도 항상 해당 분류의 옵션 범위 안이다', () => {
    const categories = [cat('음식', ['A', 'B', 'C'])];
    for (let i = 0; i < 50; i++) {
      expect(['A', 'B', 'C']).toContain(pickCombination(categories)[0].value);
    }
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run test`
Expected: FAIL — `lib/combination` 모듈 없음.

- [ ] **Step 3: 구현 — `lib/combination.ts`**

```ts
import { CombinationCategory, CombinationPick } from '@/types';

/**
 * 추첨 가능 조건: 분류가 2개 이상이고, 모든 분류에 옵션이 1개 이상.
 */
export const canPickCombination = (categories: CombinationCategory[]): boolean =>
  categories.length >= 2 && categories.every((c) => c.options.length > 0);

/**
 * 각 분류에서 독립적으로 하나씩 무작위로 뽑아 (분류명 → 값) 목록을 만든다.
 * 옵션이 없는 분류는 빈 값으로 방어(정상 흐름에서는 canPickCombination로 걸러짐).
 */
export const pickCombination = (categories: CombinationCategory[]): CombinationPick[] =>
  categories.map((cat) => ({
    name: cat.name,
    value: cat.options.length
      ? cat.options[Math.floor(Math.random() * cat.options.length)]
      : '',
  }));
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: 빌드 + 커밋**

```bash
npm run build
git add lib/combination.ts lib/combination.test.ts
git commit -m "feat: 조합 뽑기 순수 로직 (pickCombination, canPickCombination)"
```
Expected: 빌드 통과 후 커밋.

---

### Task 5: 분류 입력 컴포넌트 `CombinationInput`

**Files:**
- Create: `components/CombinationInput.tsx`

**Interfaces:**
- Consumes: `CombinationCategory` (Task 3), `fetchCategoryOptions` (Task 2).
- Produces: `CombinationInput` — props `{ categories: CombinationCategory[]; onChange: (categories: CombinationCategory[]) => void }`.

- [ ] **Step 1: 컴포넌트 작성 — `components/CombinationInput.tsx`**

```tsx
'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiDownload } from 'react-icons/fi';
import { CombinationCategory } from '@/types';
import { fetchCategoryOptions } from '@/lib/googleSheets';

interface CombinationInputProps {
  categories: CombinationCategory[];
  onChange: (categories: CombinationCategory[]) => void;
}

export const CombinationInput: React.FC<CombinationInputProps> = ({ categories, onChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [id: string]: string }>({});

  const update = (id: string, patch: Partial<CombinationCategory>) => {
    onChange(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addCategory = () => {
    onChange([...categories, { id: Date.now().toString(), name: '', url: '', options: [] }]);
  };

  const removeCategory = (id: string) => {
    onChange(categories.filter((c) => c.id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const loadCategory = async (cat: CombinationCategory) => {
    if (!cat.url.trim()) {
      setErrors((prev) => ({ ...prev, [cat.id]: 'URL을 입력하세요' }));
      return;
    }
    setLoadingId(cat.id);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[cat.id];
      return next;
    });
    try {
      const options = await fetchCategoryOptions(cat.url);
      if (options.length === 0) throw new Error('empty');
      update(cat.id, { options });
    } catch {
      update(cat.id, { options: [] });
      setErrors((prev) => ({ ...prev, [cat.id]: '불러오기 실패 — URL과 공개 설정을 확인하세요' }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="retro-panel p-6 space-y-4">
      <h2 className="retro-section-bar -mx-6 -mt-6">🎰 랜덤 조합 — 분류 입력</h2>

      <p className="text-xs text-inksoft">
        분류마다 이름과 Google Sheet URL을 넣고 불러오세요. 각 분류에서 하나씩 뽑아 조합합니다.
      </p>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="retro-plate p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={cat.name}
                onChange={(e) => update(cat.id, { name: e.target.value })}
                placeholder="분류 이름 (예: 음식)"
                className="retro-input w-40 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={cat.url}
                onChange={(e) => update(cat.id, { url: e.target.value })}
                placeholder="Google Sheets URL"
                className="retro-input flex-1 px-3 py-2 text-sm"
              />
              <button
                onClick={() => removeCategory(cat.id)}
                className="px-3 py-2 text-brand hover:bg-[#fde5e6] rounded-[2px] transition-colors"
                title="분류 삭제"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadCategory(cat)}
                disabled={loadingId === cat.id}
                className="retro-btn retro-btn-carbon px-4 py-1.5 text-xs flex items-center gap-1"
              >
                <FiDownload size={14} />
                {loadingId === cat.id ? '불러오는 중...' : '불러오기'}
              </button>
              {cat.options.length > 0 && (
                <span className="text-xs font-bold text-inksoft">✅ {cat.options.length}개 옵션</span>
              )}
              {errors[cat.id] && (
                <span className="text-xs font-bold text-brand">{errors[cat.id]}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addCategory}
        className="retro-btn retro-btn-amber w-full px-4 py-2 text-xs flex items-center justify-center gap-1"
      >
        <FiPlus size={16} />
        분류 추가
      </button>
    </div>
  );
};
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: Compiled successfully.

- [ ] **Step 3: 커밋**

```bash
git add components/CombinationInput.tsx
git commit -m "feat: 랜덤 조합 분류 입력 컴포넌트"
```

(참고: 실제 동작은 Task 8에서 page 통합 후 dev 서버로 확인한다. 이 태스크는 컴파일 가능한 자립 컴포넌트가 산출물.)

---

### Task 6: 추첨 컴포넌트 `CombinationPicker` (슬롯 애니메이션)

**Files:**
- Create: `components/CombinationPicker.tsx`

**Interfaces:**
- Consumes: `CombinationCategory`, `CombinationPick` (Task 3), `pickCombination`, `canPickCombination` (Task 4).
- Produces: `CombinationPicker` — props `{ categories: CombinationCategory[]; onPick: (picks: CombinationPick[]) => void }`.

- [ ] **Step 1: 컴포넌트 작성 — `components/CombinationPicker.tsx`**

```tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiShuffle } from 'react-icons/fi';
import { CombinationCategory, CombinationPick } from '@/types';
import { pickCombination, canPickCombination } from '@/lib/combination';

interface CombinationPickerProps {
  categories: CombinationCategory[];
  onPick: (picks: CombinationPick[]) => void;
}

export const CombinationPicker: React.FC<CombinationPickerProps> = ({ categories, onPick }) => {
  const [spinning, setSpinning] = useState(false);
  const [display, setDisplay] = useState<string[]>([]);
  const [result, setResult] = useState<CombinationPick[] | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const spinningRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  // 언마운트 시 진행 중 타이머 정리
  useEffect(() => () => {
    clearTimers();
    spinningRef.current = false;
  }, []);

  const ready = canPickCombination(categories);

  const handleSpin = () => {
    if (!ready || spinningRef.current) return;
    spinningRef.current = true;
    setSpinning(true);
    setResult(null);

    const finalPicks = pickCombination(categories);
    setDisplay(categories.map((c) => c.options[0] ?? ''));

    const reelStopped = categories.map(() => false);
    let stoppedCount = 0;

    categories.forEach((cat, i) => {
      // 릴 i를 빠르게 순환 표시 (자기 stop 플래그가 서면 멈춤)
      const tick = () => {
        if (reelStopped[i]) return;
        setDisplay((prev) => {
          const next = [...prev];
          next[i] = cat.options[Math.floor(Math.random() * cat.options.length)];
          return next;
        });
        timersRef.current.push(setTimeout(tick, 80));
      };
      tick();

      // 왼쪽부터 순차로 멈춤(스태거)
      timersRef.current.push(
        setTimeout(() => {
          reelStopped[i] = true;
          setDisplay((prev) => {
            const next = [...prev];
            next[i] = finalPicks[i].value;
            return next;
          });
          stoppedCount += 1;
          if (stoppedCount === categories.length) {
            clearTimers();
            spinningRef.current = false;
            setSpinning(false);
            setResult(finalPicks);
            onPick(finalPicks);
          }
        }, 1200 + i * 450)
      );
    });
  };

  return (
    <div className="retro-hero p-6 space-y-6 min-h-[440px]">
      <div className="relative text-center">
        <h2 className="retro-display text-3xl">🎰 랜덤 조합</h2>
      </div>

      {!ready && (
        <div className="relative p-12 text-center text-inksoft border-2 border-dashed border-mutedindigo rounded-md">
          <FiShuffle size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">분류를 2개 이상 추가하고 각 분류를 불러오세요</p>
        </div>
      )}

      {ready && (
        <>
          {/* 릴 (가로 배치, 모바일에서 세로 스택) */}
          <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-3">
            {categories.map((cat, i) => (
              <div key={cat.id} className="flex-1 bg-white/70 rounded-[2px] p-4 text-center space-y-2 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft truncate">{cat.name || `분류 ${i + 1}`}</p>
                <p className={`text-2xl font-black text-ink truncate ${spinning ? 'animate-pulse' : ''}`}>
                  {(spinning ? display[i] : result?.[i]?.value ?? display[i] ?? cat.options[0]) || '—'}
                </p>
              </div>
            ))}
          </div>

          {/* 최종 결과 라벨 튜플 */}
          {result && !spinning && (
            <div className="relative space-y-2 animate-slide-up">
              {result.map((pick, i) => (
                <div key={i} className="retro-news-row p-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-inksoft">{pick.name || `분류 ${i + 1}`}</span>
                  <span className="text-lg font-bold text-ink">{pick.value}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`retro-btn retro-btn-signal w-full py-5 px-6 text-xl ${spinning ? 'retro-btn-busy' : ''}`}
          >
            {spinning ? '🎰 돌리는 중...' : '🎰 조합 뽑기!'}
          </button>
        </>
      )}
    </div>
  );
};
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: Compiled successfully.

- [ ] **Step 3: 커밋**

```bash
git add components/CombinationPicker.tsx
git commit -m "feat: 랜덤 조합 추첨 컴포넌트 (슬롯 스태거 애니메이션)"
```

---

### Task 7: 조합 히스토리 컴포넌트 `CombinationHistory`

**Files:**
- Create: `components/CombinationHistory.tsx`

**Interfaces:**
- Consumes: `CombinationResult` (Task 3).
- Produces: `CombinationHistory` — props `{ history: CombinationResult[]; onClear: () => void }`.

- [ ] **Step 1: 컴포넌트 작성 — `components/CombinationHistory.tsx`**

```tsx
'use client';

import React from 'react';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import { CombinationResult } from '@/types';

interface CombinationHistoryProps {
  history: CombinationResult[];
  onClear: () => void;
}

export const CombinationHistory: React.FC<CombinationHistoryProps> = ({ history, onClear }) => {
  if (history.length === 0) return null;

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="retro-panel p-6 space-y-4">
      <div className="retro-section-bar -mx-6 -mt-6 flex justify-between items-center">
        <h2 className="flex items-center gap-2">
          <FiClock size={14} />
          📜 조합 히스토리
        </h2>
        <button
          onClick={onClear}
          className="px-3 py-1 bg-[#fde5e6] hover:bg-[#fbd0d3] text-[#8f0009] rounded-[2px] transition-colors flex items-center gap-1 text-[11px] font-bold"
        >
          <FiTrash2 size={12} />
          이력 삭제
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry, index) => (
          <div key={entry.timestamp} className="retro-news-row p-4 border-l-4 border-l-signal">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-inksoft">#{history.length - index}</span>
              <span className="text-[10px] text-inksoft opacity-75">{formatTime(entry.timestamp)}</span>
            </div>
            <div className="space-y-1">
              {entry.picks.map((pick, i) => (
                <div key={i} className="text-sm text-ink">
                  <span className="font-bold text-inksoft">{pick.name || `분류 ${i + 1}`}:</span> {pick.value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: Compiled successfully.

- [ ] **Step 3: 커밋**

```bash
git add components/CombinationHistory.tsx
git commit -m "feat: 랜덤 조합 히스토리 컴포넌트"
```

---

### Task 8: 페이지 통합 (4번째 모드 "랜덤 조합")

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `CombinationInput` (Task 5), `CombinationPicker` (Task 6), `CombinationHistory` (Task 7), `CombinationCategory`/`CombinationPick`/`CombinationResult` (Task 3), 조합 localStorage 헬퍼(Task 3).

- [ ] **Step 1: import 추가 — `app/page.tsx` 상단**

기존 localStorage import 블록에 조합 헬퍼를 추가한다(기존 항목 유지, 목록 끝에 추가):
```ts
  getCombinationCategories,
  saveCombinationCategories,
  getCombinationHistory,
  addToCombinationHistory,
  clearCombinationHistory,
```
`@/types` import 줄을 수정해 새 타입을 포함:
```ts
import { DataItem, PickHistory as PickHistoryType, CombinationCategory, CombinationPick, CombinationResult } from '@/types';
```
컴포넌트 import 블록에 추가:
```ts
import { CombinationInput } from '@/components/CombinationInput';
import { CombinationPicker } from '@/components/CombinationPicker';
import { CombinationHistory } from '@/components/CombinationHistory';
```

- [ ] **Step 2: ViewMode에 'combination' 추가**

```ts
type ViewMode = 'input' | 'picker' | 'team' | 'combination';
```

- [ ] **Step 3: 상태 추가 (`Home` 컴포넌트 본문, 기존 useState 근처)**

```ts
  const [categories, setCategories] = useState<CombinationCategory[]>([]);
  const [combinationHistory, setCombinationHistory] = useState<CombinationResult[]>([]);
```

- [ ] **Step 4: 마운트 로드 effect에 조합 상태 로드 추가**

기존 마운트 `useEffect`(`setMounted(true)` 하는 것) 안 마지막에 추가:
```ts
    setCategories(getCombinationCategories());
    setCombinationHistory(getCombinationHistory());
```

- [ ] **Step 5: 저장 effect 추가 (기존 저장 effect들 근처)**

```ts
  // 조합 분류를 localStorage에 저장
  useEffect(() => {
    if (mounted) {
      saveCombinationCategories(categories);
    }
  }, [categories, mounted]);
```

- [ ] **Step 6: 핸들러 추가 (기존 handlePick 근처)**

```ts
  // 조합 추첨 결과를 히스토리에 저장
  const handleCombinationPick = (picks: CombinationPick[]) => {
    const result: CombinationResult = { timestamp: Date.now(), picks };
    addToCombinationHistory(result);
    setCombinationHistory(getCombinationHistory());
  };

  const handleClearCombinationHistory = () => {
    if (confirm('조합 히스토리를 삭제하시겠습니까?')) {
      clearCombinationHistory();
      setCombinationHistory([]);
    }
  };
```

- [ ] **Step 7: 탭 버튼 추가**

`팀나누기` 탭 버튼(`onClick={() => setViewMode('team')}` 블록) 바로 다음에 추가:
```tsx
          <button
            onClick={() => setViewMode('combination')}
            className={`retro-btn px-8 py-3 text-sm flex items-center gap-2 ${
              viewMode === 'combination' ? 'retro-tab-active' : 'retro-tab-idle'
            }`}
          >
            🎰 랜덤 조합
          </button>
```
(참고: 조합 모드는 `allData`에 의존하지 않으므로 disabled 조건이 없다.)

- [ ] **Step 8: 렌더 분기 추가**

기존 뷰 분기의 팀 분기(`) : (` 다음 `<div className="animate-fade-in"><TeamDivider .../></div>` 또는 유사)의 삼항을 확장한다. 현재 마지막이 `viewMode === 'team'` 렌더인 구조라면, 그 뒤에 조합 분기를 잇는다. 구체적으로, 팀 렌더를 감싼 삼항의 `else`가 팀이라면 아래처럼 팀을 명시 조건으로 바꾸고 조합을 추가한다:

기존(예시):
```tsx
        ) : (
          <div className="animate-fade-in">
            <TeamDivider data={allData} />
          </div>
        )}
```
변경 후:
```tsx
        ) : viewMode === 'team' ? (
          <div className="animate-fade-in">
            <TeamDivider data={allData} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 animate-fade-in">
              <CombinationPicker categories={categories} onPick={handleCombinationPick} />
              <CombinationInput categories={categories} onChange={setCategories} />
            </div>
            <div className="animate-fade-in">
              <CombinationHistory history={combinationHistory} onClear={handleClearCombinationHistory} />
            </div>
          </div>
        )}
```

- [ ] **Step 9: 빌드 확인**

Run: `npm run build`
Expected: Compiled successfully (타입 에러 0).

- [ ] **Step 10: dev 서버 수동 검증 (엔드투엔드 + 엣지 케이스)**

Run: `PORT=3100 npm run dev` 후 브라우저에서 `http://localhost:3100`:
1. "🎰 랜덤 조합" 탭 클릭 → 추첨 영역에 "분류를 2개 이상 추가하고 불러오세요" 안내 표시(엣지: 분류 0개).
2. 분류 입력에서 "분류 추가"로 2개 만들고, 이름("음식", "장소") + 공개 시트 URL 입력 후 각각 "불러오기" → "✅ N개 옵션" 표시.
   - 테스트용 공개 시트 예: `https://docs.google.com/spreadsheets/d/143o2Ery3xEZZnQoc3_kbbUCTgLolLgPFsGUtHJuygro/edit?gid=0#gid=0` (또는 본인 소유 공개 시트).
3. 한 분류만 불러온 상태 → "조합 뽑기" 비활성 확인(엣지: 빈 분류 존재).
4. 두 분류 모두 불러오면 "🎰 조합 뽑기!" 활성 → 클릭 → 릴이 왼쪽부터 순차로 멈추고 결과 라벨 튜플 표시.
5. 우측 "조합 히스토리"에 결과가 쌓이는지, "이력 삭제" 동작 확인.
6. 잘못된 URL로 불러오기 → 해당 분류 행에 "불러오기 실패..." 에러 표시(엣지: 로드 실패).
7. 새로고침 → 분류/URL/옵션이 복원되는지 확인(localStorage).

정리: `lsof -ti:3100 | xargs kill`

Expected: 위 1~7 모두 기대대로 동작.

- [ ] **Step 11: 커밋**

```bash
git add app/page.tsx
git commit -m "feat: 랜덤 조합 모드 페이지 통합"
```

---

## Self-Review 결과

- **스펙 커버리지**: §2 4번째 탭(Task 8) · §3 데이터 모델(Task 3) · §4 파싱(Task 1·2) · §5 입력 UI(Task 5) · §6 추첨·애니메이션(Task 4·6) · §7 라벨 튜플(Task 6) · §8 히스토리(Task 3·7) · §9 페이지 통합(Task 8) · §10 엣지 케이스(Task 6 not-ready 분기 + Task 8 Step 10 수동 검증) — 모두 대응됨.
- **플레이스홀더**: 없음(모든 코드/명령/기대값 명시).
- **타입 일관성**: `CombinationCategory`/`CombinationPick`/`CombinationResult`가 Task 3에서 정의되고 이후 태스크에서 동일 시그니처로 소비됨. `pickCombination`/`canPickCombination`/`fetchCategoryOptions`/`extractOptions` 이름·시그니처 태스크 간 일치.
- **범위**: 단일 기능(랜덤 조합 모드) — 단일 계획으로 적정.
