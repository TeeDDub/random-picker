import { afterEach, describe, it, expect, vi } from 'vitest';
import { extractOptions, fetchCategoryOptions } from './googleSheets';

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
