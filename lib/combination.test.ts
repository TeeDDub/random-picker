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
