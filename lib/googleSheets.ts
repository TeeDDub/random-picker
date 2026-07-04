import { DataItem } from '@/types';

/**
 * Convert Google Sheets URL to gviz CSV URL
 *
 * The gviz endpoint returns Access-Control-Allow-Origin: * for public sheets,
 * so the browser can fetch it directly. The previous /export?format=tsv
 * endpoint has no CORS headers and fails when fetched client-side.
 * headers=1 forces the first row to be treated as column labels even when
 * gviz auto-detection fails.
 */
export const convertToCsvUrl = (url: string): string => {
  const spreadsheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/[?#&]gid=([0-9]+)/);

  if (!spreadsheetIdMatch) {
    throw new Error('Invalid Google Sheets URL');
  }

  const spreadsheetId = spreadsheetIdMatch[1];
  const gid = gidMatch ? gidMatch[1] : '0';

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&headers=1&gid=${gid}`;
};

/**
 * Fetch data from Google Sheets
 */
export const fetchGoogleSheetsData = async (url: string): Promise<DataItem[]> => {
  try {
    const csvUrl = convertToCsvUrl(url);
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }

    const text = await response.text();

    // Private sheets return an HTML login page instead of CSV
    if (text.trimStart().startsWith('<')) {
      throw new Error('Sheet is not shared publicly');
    }

    return parseCsvData(text);
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
};

/**
 * Parse CSV text into rows (RFC 4180 level, character state machine).
 * Handles quoted fields containing commas/newlines, "" escapes, CRLF/LF.
 */
export const parseCsvRows = (csvText: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];

    if (inQuotes) {
      if (char === '"') {
        if (csvText[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++;
      }
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

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

/**
 * Parse CSV data into DataItem array
 */
const parseCsvData = (csvText: string): DataItem[] => {
  const rows = parseCsvRows(csvText);

  if (rows.length < 2) {
    throw new Error('No data found in the sheet');
  }

  // Parse header row
  const headers = rows[0].map(h => h.trim());

  // Parse data rows
  const items: DataItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].map(v => v.trim());

    if (values.length < 2 || values.every(v => !v)) continue; // Skip invalid/empty rows

    const id = values[0] || String(i);
    const title = values[1] || 'Untitled';

    const properties: { [key: string]: string } = {};

    // Add remaining columns as properties
    for (let j = 2; j < headers.length && j < values.length; j++) {
      const key = headers[j] || `Column ${j + 1}`;
      const value = values[j] || '';
      if (value) {
        properties[key] = value;
      }
    }

    items.push({ id, title, properties, source: 'google-sheets' });
  }

  return items;
};
