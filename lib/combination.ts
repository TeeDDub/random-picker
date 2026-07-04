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
