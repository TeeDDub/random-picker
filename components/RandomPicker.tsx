'use client';

import React, { useState } from 'react';
import { FiShuffle } from 'react-icons/fi';
import { DataItem } from '@/types';
import { MediaRenderer } from './MediaRenderer';

interface RandomPickerProps {
  data: DataItem[];
  onPick: (item: DataItem) => void;
  onAnimationChange?: (isAnimating: boolean, spinCount: number) => void;
}

export const RandomPicker: React.FC<RandomPickerProps> = ({ data, onPick, onAnimationChange }) => {
  const [result, setResult] = useState<DataItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<DataItem | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const animatingRef = React.useRef(false);
  const spinTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalItems = data.length;

  // Cancel any in-flight spin when unmounting (e.g., switching tabs mid-spin)
  React.useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
      animatingRef.current = false;
    };
  }, []);

  // Listen to external pick event
  React.useEffect(() => {
    const handleExternalPick = () => {
      handleRandomPick();
    };
    
    window.addEventListener('startRandomPick', handleExternalPick);
    return () => window.removeEventListener('startRandomPick', handleExternalPick);
  }, [data]);

  // Expose animation state to parent
  React.useEffect(() => {
    if (onAnimationChange) {
      onAnimationChange(isAnimating, spinCount);
    }
  }, [isAnimating, spinCount, onAnimationChange]);

  const handleRandomPick = () => {
    // animatingRef guards against double-triggering while a spin is in flight
    if (totalItems === 0 || animatingRef.current) return;

    animatingRef.current = true;
    setIsAnimating(true);
    setResult(null);
    setSpinCount(0);

    // 최종 선택될 항목 미리 결정
    const finalIndex = Math.floor(Math.random() * data.length);
    const finalPick = data[finalIndex];

    // 룰렛 효과: 빠르게 시작해서 점점 느려지기
    let spinCounter = 0;
    const startTime = Date.now();
    const totalDuration = 3500; // 총 3.5초

    const spinNext = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / totalDuration;

      // 랜덤하게 다음 항목 선택
      const randomIndex = Math.floor(Math.random() * data.length);
      setCurrentCandidate(data[randomIndex]);
      spinCounter++;
      setSpinCount(spinCounter);

      // 종료 조건
      if (progress >= 1) {
        // 최종 결과 표시
        spinTimeoutRef.current = setTimeout(() => {
          setCurrentCandidate(null);
          setResult(finalPick);
          onPick(finalPick);
          animatingRef.current = false;
          setIsAnimating(false);
        }, 500);
        return;
      }

      // 진행도에 따라 점점 느려지는 interval 계산
      let nextInterval;
      if (progress < 0.3) {
        // 처음 30%: 매우 빠르게 (30-50ms)
        nextInterval = 30 + Math.random() * 20;
      } else if (progress < 0.5) {
        // 30-50%: 빠르게 (50-100ms)
        nextInterval = 50 + Math.random() * 50;
      } else if (progress < 0.7) {
        // 50-70%: 보통 (100-200ms)
        nextInterval = 100 + Math.random() * 100;
      } else if (progress < 0.85) {
        // 70-85%: 느리게 (200-400ms)
        nextInterval = 200 + Math.random() * 200;
      } else {
        // 85-100%: 매우 느리게 (400-800ms)
        nextInterval = 400 + Math.random() * 400;
      }

      // 재귀적으로 다음 스핀 예약
      spinTimeoutRef.current = setTimeout(spinNext, nextInterval);
    };

    // 첫 스핀 시작
    spinNext();
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className={`text-xs px-3 py-1 rounded-full font-bold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ${
              result.source === 'manual' ? 'bg-lavender' : 'bg-canvassoft'
            }`}>
              {result.source === 'manual' ? '✏️ 직접 입력' : '📊 Google Sheets'}
            </span>
          </div>
          <h3 className="retro-display text-4xl mb-4 leading-tight">{result.title}</h3>
        </div>

        {Object.keys(result.properties).length > 0 && (
          <div className="space-y-3">
            {Object.entries(result.properties).map(([key, value]) => (
              <div key={key} className="retro-news-row p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft mb-2">{key}</p>
                <MediaRenderer content={value} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="retro-hero p-6 space-y-6 min-h-[500px]">
      <div className="relative text-center">
        <h2 className="retro-display text-3xl">🎲 랜덤 추첨</h2>
      </div>

          {/* 룰렛 후보 표시 (애니메이션 중) */}
          {isAnimating && currentCandidate && (
            <div className="relative flex items-center justify-center min-h-[440px] p-4 rounded-md animate-pulse">
              <div className="w-full space-y-4 transform transition-all duration-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className={`text-sm px-3 py-1 rounded-full font-bold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] ${
                      currentCandidate.source === 'manual' ? 'bg-lavender' : 'bg-canvassoft'
                    }`}>
                      {currentCandidate.source === 'manual' ? '✏️ 직접 입력' : '📊 Google Sheets'}
                    </span>
                  </div>
                  <h3 className="retro-display retro-display-rolling text-4xl mb-2 leading-tight animate-fade-in">
                    {currentCandidate.title}
                  </h3>
                </div>

                {Object.keys(currentCandidate.properties).length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(currentCandidate.properties).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="bg-white/70 rounded-[2px] p-2 text-center space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft">{key}</p>
                        <MediaRenderer content={value} preview className="text-sm max-h-[300px]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 최종 결과 표시 */}
          {result && !isAnimating && (
            <div className="relative p-8 animate-slide-up">
              {renderResult()}
            </div>
          )}

      {/* 대기 상태 */}
      {!isAnimating && !result && (
        <div className="relative p-12 text-center text-inksoft border-2 border-dashed border-mutedindigo rounded-md">
          <FiShuffle size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">오른쪽 버튼을 눌러 추첨을 시작하세요</p>
        </div>
      )}
    </div>
  );
};

