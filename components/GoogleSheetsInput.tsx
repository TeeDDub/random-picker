'use client';

import React, { useState } from 'react';
import { FiDownload, FiTrash2 } from 'react-icons/fi';
import { DataItem } from '@/types';
import { fetchGoogleSheetsData } from '@/lib/googleSheets';

interface GoogleSheetsInputProps {
  onDataFetch: (items: DataItem[], url: string) => void;
  currentUrl?: string;
}

export const GoogleSheetsInput: React.FC<GoogleSheetsInputProps> = ({
  onDataFetch,
  currentUrl,
}) => {
  const [url, setUrl] = useState(currentUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastFetchCount, setLastFetchCount] = useState(0);

  const handleFetch = async () => {
    if (!url.trim()) {
      setError('URL을 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const items = await fetchGoogleSheetsData(url);
      const sheetsItems: DataItem[] = items.map(item => ({
        ...item,
        source: 'google-sheets' as const,
      }));
      onDataFetch(sheetsItems, url);
      setSuccess(true);
      setLastFetchCount(sheetsItems.length);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다. URL이 올바른지, 시트가 공개 설정되어 있는지 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    setSuccess(false);
    setLastFetchCount(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📊 Google Sheets 불러오기</h2>
      </div>

      {/* 도움말 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-bold text-blue-800 mb-2">📘 사용 방법</h3>
        <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
          <li>Google Sheets를 "링크가 있는 모든 사용자" 권한으로 공유</li>
          <li>시트 URL 복사 (브라우저 주소창)</li>
          <li>아래에 URL 붙여넣기</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-700 mb-2">
            <strong>💡 예시 파일:</strong> 데이터 형식을 참고하세요
          </p>
          <a
            href="https://docs.google.com/spreadsheets/d/143o2Ery3xEZZnQoc3_kbbUCTgLolLgPFsGUtHJuygro/edit?gid=0#gid=0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            🔗 예시 파일 보기
          </a>
        </div>
      </div>
      
      <div className="space-y-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Google Sheets URL을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                불러오는 중...
              </>
            ) : (
              <>
                <FiDownload size={20} />
                데이터 불러오기
              </>
            )}
          </button>
          
          {url && (
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 font-semibold"
            >
              <FiTrash2 size={20} />
              초기화
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-semibold">
            ✅ {lastFetchCount}개의 항목을 불러왔습니다!
          </p>
          <p className="text-sm text-gray-600 mt-1">
            데이터가 저장되었습니다. 아래 "저장된 데이터" 섹션에서 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
};

