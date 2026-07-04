import { DataItem, GoogleSheetsData, PickHistory, CombinationCategory, CombinationResult } from '@/types';

const STORAGE_KEYS = {
  ALL_DATA: 'random-picker-all-data',
  GOOGLE_SHEETS_INFO: 'random-picker-google-sheets-info',
  PICK_HISTORY: 'random-picker-history',
  REMOVE_SAME_TITLE: 'random-picker-remove-same-title',
  COMBINATION_CATEGORIES: 'random-picker-combination-categories',
  COMBINATION_HISTORY: 'random-picker-combination-history',
} as const;

// All Data Management (통합 데이터)
export const getAllData = (): DataItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ALL_DATA);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load data:', error);
    return [];
  }
};

export const saveAllData = (data: DataItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.ALL_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ALL_DATA);
};

// Google Sheets Info Management
export const getGoogleSheetsInfo = (): GoogleSheetsData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEETS_INFO);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load Google Sheets info:', error);
    return null;
  }
};

export const saveGoogleSheetsInfo = (info: GoogleSheetsData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEETS_INFO, JSON.stringify(info));
  } catch (error) {
    console.error('Failed to save Google Sheets info:', error);
  }
};

export const clearGoogleSheetsInfo = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.GOOGLE_SHEETS_INFO);
};

// Pick History Management
export const getPickHistory = (): PickHistory[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PICK_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load pick history:', error);
    return [];
  }
};

export const addToPickHistory = (history: PickHistory): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const currentHistory = getPickHistory();
    const newHistory = [history, ...currentHistory].slice(0, 5); // Keep only last 5
    localStorage.setItem(STORAGE_KEYS.PICK_HISTORY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save pick history:', error);
  }
};

export const clearPickHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.PICK_HISTORY);
};

// "Remove all items with the same title when picked" option
export const getRemoveSameTitleOption = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem(STORAGE_KEYS.REMOVE_SAME_TITLE) === '1';
  } catch (error) {
    console.error('Failed to load remove-same-title option:', error);
    return false;
  }
};

export const saveRemoveSameTitleOption = (value: boolean): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.REMOVE_SAME_TITLE, value ? '1' : '0');
  } catch (error) {
    console.error('Failed to save remove-same-title option:', error);
  }
};

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

export const clearAll = (): void => {
  clearAllData();
  clearGoogleSheetsInfo();
  clearPickHistory();
};

