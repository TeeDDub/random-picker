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
    <div className="retro-panel p-6 space-y-4">
      <h2 className="retro-section-bar -mx-6 -mt-6">🎰 추첨 컨트롤</h2>

      <div className="space-y-2">
        <div className="retro-plate px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-inksoft">✏️ 직접 입력</span>
          <span className="text-lg font-bold text-ink">{manualCount}</span>
        </div>
        <div className="retro-plate px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-inksoft">📊 Google Sheets</span>
          <span className="text-lg font-bold text-ink">{sheetsCount}</span>
        </div>
        <div className="retro-plate px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-inksoft">📦 전체</span>
          <span className="text-xl font-bold text-ink">{totalItems}</span>
        </div>
        <div className="retro-plate border-l-4 border-l-signal px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-inksoft">🎯 남은 후보</span>
          <span className="text-xl font-black text-brand">{remainingCount}</span>
        </div>
      </div>

      {/* 같은 제목 전체 제거 옵션 */}
      <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={removeSameTitle}
          onChange={(e) => onRemoveSameTitleChange(e.target.checked)}
          className="w-4 h-4 accent-brand cursor-pointer"
        />
        <span className="text-[13px] font-bold text-inksoft">
          같은 이름이 뽑히면 모두 제거
        </span>
      </label>

      <button
        onClick={onPick}
        disabled={remainingCount === 0 || isAnimating}
        className={`retro-btn retro-btn-signal w-full py-6 px-6 text-xl ${
          isAnimating ? 'retro-btn-busy' : ''
        }`}
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
          className="retro-btn retro-btn-carbon w-full py-3 px-6 text-sm flex items-center justify-center gap-2"
        >
          <FiRefreshCw size={18} />
          🔄 처음부터 다시
        </button>
      )}
    </div>
  );
};

