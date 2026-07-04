'use client';

import React from 'react';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import { CombinationResult } from '@/types';

interface CombinationHistoryProps {
  history: CombinationResult[];
  onClear: () => void;
}

export const CombinationHistory: React.FC<CombinationHistoryProps> = ({ history, onClear }) => {
  if (history.length === 0) return null;

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="retro-panel p-6 space-y-4">
      <div className="retro-section-bar -mx-6 -mt-6 flex justify-between items-center">
        <h2 className="flex items-center gap-2">
          <FiClock size={14} />
          📜 조합 히스토리
        </h2>
        <button
          onClick={onClear}
          className="px-3 py-1 bg-[#fde5e6] hover:bg-[#fbd0d3] text-[#8f0009] rounded-[2px] transition-colors flex items-center gap-1 text-[11px] font-bold"
        >
          <FiTrash2 size={12} />
          이력 삭제
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry, index) => (
          <div key={entry.timestamp} className="retro-news-row p-4 border-l-4 border-l-signal">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-inksoft">#{history.length - index}</span>
              <span className="text-[10px] text-inksoft opacity-75">{formatTime(entry.timestamp)}</span>
            </div>
            <div className="space-y-1">
              {entry.picks.map((pick, i) => (
                <div key={i} className="text-sm text-ink">
                  <span className="font-bold text-inksoft">{pick.name || `분류 ${i + 1}`}:</span> {pick.value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
