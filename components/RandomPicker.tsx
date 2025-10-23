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

  const totalItems = data.length;

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
    if (totalItems === 0) return;

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
        setTimeout(() => {
          setCurrentCandidate(null);
          setResult(finalPick);
          onPick(finalPick);
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
      setTimeout(spinNext, nextInterval);
    };

    // 첫 스핀 시작
    spinNext();
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded font-semibold ${
              result.source === 'manual' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {result.source === 'manual' ? '✏️ 직접 입력' : '📊 Google Sheets'}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">{result.title}</h3>
        </div>
        
        {Object.keys(result.properties).length > 0 && (
          <div className="space-y-3">
            {Object.entries(result.properties).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">{key}</p>
                <MediaRenderer content={value} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">🎲 랜덤 추첨</h2>
      </div>

          {/* 룰렛 후보 표시 (애니메이션 중) */}
          {isAnimating && currentCandidate && (
            <div className="p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg border-4 border-blue-300 animate-pulse shadow-xl">
              <div className="space-y-4 transform transition-all duration-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                      currentCandidate.source === 'manual' 
                        ? 'bg-purple-200 text-purple-800' 
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {currentCandidate.source === 'manual' ? '✏️ 직접 입력' : '📊 Google Sheets'}
                    </span>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2 animate-fade-in">
                    {currentCandidate.title}
                  </h3>
                </div>
                
                {Object.keys(currentCandidate.properties).length > 0 && (
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-hidden">
                    {Object.entries(currentCandidate.properties).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="bg-white/70 rounded-lg p-2 text-center">
                        <p className="text-xs font-semibold text-gray-600">{key}</p>
                        <p className="text-sm text-gray-800 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 최종 결과 표시 */}
          {result && !isAnimating && (
            <div className="p-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-lg border-4 border-yellow-400 animate-slide-up shadow-2xl">
              {renderResult()}
            </div>
          )}

      {/* 대기 상태 */}
      {!isAnimating && !result && (
        <div className="p-12 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
          <FiShuffle size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">오른쪽 버튼을 눌러 추첨을 시작하세요</p>
        </div>
      )}
    </div>
  );
};

