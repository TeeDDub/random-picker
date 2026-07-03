'use client';

import React from 'react';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import { PickHistory as PickHistoryType, DataItem } from '@/types';
import { MediaRenderer } from './MediaRenderer';

interface PickHistoryProps {
  history: PickHistoryType[];
  onClear: () => void;
}

export const PickHistory: React.FC<PickHistoryProps> = ({ history, onClear }) => {
  if (history.length === 0) {
    return null;
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="retro-panel p-6 space-y-4">
      <div className="retro-section-bar -mx-6 -mt-6 flex justify-between items-center">
        <h2 className="flex items-center gap-2">
          <FiClock size={14} />
          📜 히스토리
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
        {history.map((entry, index) => {
          const item = entry.item;
          const isManual = item.source === 'manual';

          return (
            <div
              key={entry.timestamp}
              className={`retro-news-row p-4 border-l-4 ${
                isManual ? 'border-l-lavender' : 'border-l-canvassoft'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-inksoft">
                    #{history.length - index}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-[2px] font-bold text-ink ${
                    isManual ? 'bg-lavender' : 'bg-canvassoft'
                  }`}>
                    {isManual ? '직접입력' : 'Sheets'}
                  </span>
                </div>
                <span className="text-[10px] text-inksoft opacity-75">{formatTime(entry.timestamp)}</span>
              </div>

              <div>
                <h4 className="font-bold text-ink mb-2">{item.title}</h4>
                {Object.keys(item.properties).length > 0 && (
                  <div className="space-y-1 text-sm text-inksoft">
                    {Object.entries(item.properties).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="truncate">
                        <span className="font-bold">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

