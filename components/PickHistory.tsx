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
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiClock size={24} />
          선택 이력
        </h2>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-semibold"
        >
          <FiTrash2 size={16} />
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
              className={`p-4 rounded-lg hover:bg-gray-100 transition-colors border-l-4 ${
                isManual ? 'bg-purple-50 border-purple-500' : 'bg-green-50 border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    #{history.length - index}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    isManual ? 'bg-purple-200 text-purple-700' : 'bg-green-200 text-green-700'
                  }`}>
                    {isManual ? '직접입력' : 'Sheets'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatTime(entry.timestamp)}</span>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                {Object.keys(item.properties).length > 0 && (
                  <div className="space-y-1 text-sm text-gray-600">
                    {Object.entries(item.properties).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="truncate">
                        <span className="font-semibold">{key}:</span> {value}
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

