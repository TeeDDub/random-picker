'use client';

import React from 'react';
import { FiRefreshCw, FiShuffle } from 'react-icons/fi';

interface PickerButtonProps {
  totalItems: number;
  remainingCount: number;
  manualCount: number;
  sheetsCount: number;
  isAnimating: boolean;
  spinCount: number;
  removeSameTitle: boolean;
  onRemoveSameTitleChange: (value: boolean) => void;
  onReset: () => void;
  onPick: () => void;
}

export const PickerButton: React.FC<PickerButtonProps> = ({
  totalItems,
  remainingCount,
  manualCount,
  sheetsCount,
  isAnimating,
  spinCount,
  removeSameTitle,
  onRemoveSameTitleChange,
  onReset,
  onPick,
}) => {
  const pickedCount = totalItems - remainingCount;
  const allPicked = totalItems > 0 && remainingCount === 0;
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
          <div className="flex items-center justify-between px-3 py-2 bg-orange-100 rounded-lg">
            <span className="text-sm font-semibold text-orange-700">🎯 남은 후보</span>
            <span className="text-xl font-bold text-orange-700">{remainingCount}</span>
          </div>
        </div>
      </div>

      {/* 같은 제목 전체 제거 옵션 */}
      <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={removeSameTitle}
          onChange={(e) => onRemoveSameTitleChange(e.target.checked)}
          className="w-4 h-4 accent-purple-600 cursor-pointer"
        />
        <span className="text-sm font-semibold text-gray-600">
          같은 이름이 뽑히면 모두 제거
        </span>
      </label>

      <button
        onClick={onPick}
        disabled={remainingCount === 0 || isAnimating}
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
              <span>추첨 진행중</span>
            </div>
            <div className="text-sm opacity-90">
              추첨 중...
            </div>
          </div>
        ) : allPicked ? (
          <span className="flex flex-col items-center gap-2">
            <span>✅ 모두 선택 완료!</span>
          </span>
        ) : (
          <span className="flex flex-col items-center gap-2">
            <FiShuffle size={32} />
            <span>🎰 추첨!</span>
            {pickedCount > 0 && (
              <span className="text-sm opacity-90">{remainingCount}개 남음</span>
            )}
          </span>
        )}
      </button>

      {/* 처음부터 다시 (뽑힌 항목이 있을 때만) */}
      {pickedCount > 0 && (
        <button
          onClick={onReset}
          disabled={isAnimating}
          className="w-full py-3 px-6 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <FiRefreshCw size={18} />
          🔄 처음부터 다시
        </button>
      )}
    </div>
  );
};

