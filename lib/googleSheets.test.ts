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
