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
    <div className="retro-panel p-6 space-y-4">
      <h2 className="retro-section-bar -mx-6 -mt-6">📊 Google Sheets 불러오기</h2>

      {/* 도움말 — info-box: white card + amber tab */}
      <div className="retro-plate border-l-4 border-l-[#ecab37] p-4">
        <h3 className="text-[12px] font-bold uppercase tracking-wide text-ink mb-2">📘 사용 방법</h3>
        <ol className="text-xs text-inksoft space-y-1 ml-4 list-decimal">
          <li>Google Sheets를 "링크가 있는 모든 사용자" 권한으로 공유</li>
          <li>시트 URL 복사 (브라우저 주소창)</li>
          <li>아래에 URL 붙여넣기</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-dotted border-mutedindigo">
          <p className="text-xs text-inksoft mb-2">
            <strong>💡 예시 파일:</strong> 데이터 형식을 참고하세요
          </p>
          <a
            href="https://docs.google.com/spreadsheets/d/143o2Ery3xEZZnQoc3_kbbUCTgLolLgPFsGUtHJuygro/edit?gid=0#gid=0"
            target="_blank"
            rel="noopener noreferrer"
            className="retro-btn retro-btn-amber inline-flex items-center gap-1 text-xs px-3 py-1.5"
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
          className="retro-input w-full px-4 py-3 text-sm"
          disabled={loading}
        />

        <div className="flex gap-2">
          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="retro-btn retro-btn-carbon flex-1 px-6 py-3 text-sm flex items-center justify-center gap-2"
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
              className="retro-btn retro-tab-idle px-6 py-3 text-sm flex items-center gap-2"
            >
              <FiTrash2 size={20} />
              초기화
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="retro-status-error p-4 rounded-[2px]">
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {success && (
        <div className="retro-status-success p-4 rounded-[2px]">
          <p className="font-bold">
            ✅ {lastFetchCount}개의 항목을 불러왔습니다!
          </p>
          <p className="text-sm mt-1 opacity-80">
            데이터가 저장되었습니다. 아래 "저장된 데이터" 섹션에서 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
};

