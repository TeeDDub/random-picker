export interface DataItem {
  id: string;
  title: string;
  properties: { [key: string]: string };
  source: 'manual' | 'google-sheets';
}

export interface PickHistory {
  timestamp: number;
  item: DataItem;
}

export interface GoogleSheetsData {
  url: string;
  lastFetched: number;
}

export type MediaType = 'image' | 'youtube' | 'text';

export interface MediaInfo {
  type: MediaType;
  url?: string;
  videoId?: string;
  text?: string;
}

