'use client';

import React from 'react';
import { FiShuffle } from 'react-icons/fi';

interface PickerButtonProps {
  totalItems: number;
  manualCount: number;
  sheetsCount: number;
  isAnimating: boolean;
  spinCount: number;
  onPick: () => void;
}

export const PickerButton: React.FC<PickerButtonProps> = ({
  totalItems,
  manualCount,
  sheetsCount,
  isAnimating,
  spinCount,
  onPick,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600">데이터 통계</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 bg-purple-100 rounded-lg">
            <span className="text-sm font-semibold text-purple-700">✏️ 직접 입력</span>
            <span className="text-lg font-bold text-purple-700">{manualCount}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-green-100 rounded-lg">
            <span className="text-sm font-semibold text-green-700">📊 Google Sheets</span>
            <span className="text-lg font-bold text-green-700">{sheetsCount}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-blue-100 rounded-lg">
            <span className="text-sm font-semibold text-blue-700">전체</span>
            <span className="text-xl font-bold text-blue-700">{totalItems}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onPick}
        disabled={totalItems === 0 || isAnimating}
        className={`w-full py-6 px-6 rounded-lg font-bold text-xl text-white transition-all transform ${
          isAnimating
            ? 'bg-gradient-to-r from-orange-400 to-red-400 animate-pulse scale-95'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105'
        } disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:transform-none shadow-lg`}
      >
        {isAnimating ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <FiShuffle className="animate-spin" size={24} />
              <span>룰렛 진행중</span>
            </div>
            <div className="text-sm opacity-90">
              {spinCount} 회전
            </div>
          </div>
        ) : (
          <span className="flex flex-col items-center gap-2">
            <FiShuffle size={32} />
            <span>🎰 룰렛 시작!</span>
          </span>
        )}
      </button>
    </div>
  );
};

