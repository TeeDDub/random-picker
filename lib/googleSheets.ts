import { DataItem } from '@/types';

/**
 * Convert Google Sheets URL to TSV export URL
 */
export const convertToTsvUrl = (url: string): string => {
  // Extract spreadsheet ID and gid
  const spreadsheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/[#&]gid=([0-9]+)/);
  
  if (!spreadsheetIdMatch) {
    throw new Error('Invalid Google Sheets URL');
  }
  
  const spreadsheetId = spreadsheetIdMatch[1];
  const gid = gidMatch ? gidMatch[1] : '0';
  
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=tsv&gid=${gid}`;
};

/**
 * Fetch data from Google Sheets
 */
export const fetchGoogleSheetsData = async (url: string): Promise<DataItem[]> => {
  try {
    const tsvUrl = convertToTsvUrl(url);
    const response = await fetch(tsvUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }
    
    const text = await response.text();
    return parseTsvData(text);
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
};

/**
 * Parse TSV data into DataItem array
 */
const parseTsvData = (tsvText: string): DataItem[] => {
  const lines = tsvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('No data found in the sheet');
  }
  
  // Parse header row
  const headers = lines[0].split('\t').map(h => h.trim());
  
  // Parse data rows
  const items: DataItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    
    if (values.length < 2) continue; // Skip invalid rows
    
    const id = values[0]?.trim() || String(i);
    const title = values[1]?.trim() || 'Untitled';
    
    const properties: { [key: string]: string } = {};
    
    // Add remaining columns as properties
    for (let j = 2; j < headers.length && j < values.length; j++) {
      const key = headers[j] || `Column ${j + 1}`;
      const value = values[j]?.trim() || '';
      if (value) {
        properties[key] = value;
      }
    }
    
    items.push({ id, title, properties, source: 'google-sheets' });
  }
  
  return items;
};

