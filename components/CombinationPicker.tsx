'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiShuffle } from 'react-icons/fi';
import { CombinationCategory, CombinationPick } from '@/types';
import { pickCombination, canPickCombination } from '@/lib/combination';

interface CombinationPickerProps {
  categories: CombinationCategory[];
  onPick: (picks: CombinationPick[]) => void;
}

export const CombinationPicker: React.FC<CombinationPickerProps> = ({ categories, onPick }) => {
  const [spinning, setSpinning] = useState(false);
  const [display, setDisplay] = useState<string[]>([]);
  const [result, setResult] = useState<CombinationPick[] | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const spinningRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  // 언마운트 시 진행 중 타이머 정리
  useEffect(() => () => {
    clearTimers();
    spinningRef.current = false;
  }, []);

  const ready = canPickCombination(categories);

  const handleSpin = () => {
    if (!ready || spinningRef.current) return;
    spinningRef.current = true;
    setSpinning(true);
    setResult(null);

    const finalPicks = pickCombination(categories);
    setDisplay(categories.map((c) => c.options[0] ?? ''));

    const reelStopped = categories.map(() => false);
    let stoppedCount = 0;

    categories.forEach((cat, i) => {
      // 릴 i를 빠르게 순환 표시 (자기 stop 플래그가 서면 멈춤)
      const tick = () => {
        if (reelStopped[i]) return;
        setDisplay((prev) => {
          const next = [...prev];
          next[i] = cat.options[Math.floor(Math.random() * cat.options.length)];
          return next;
        });
        timersRef.current.push(setTimeout(tick, 80));
      };
      tick();

      // 왼쪽부터 순차로 멈춤(스태거)
      timersRef.current.push(
        setTimeout(() => {
          reelStopped[i] = true;
          setDisplay((prev) => {
            const next = [...prev];
            next[i] = finalPicks[i].value;
            return next;
          });
          stoppedCount += 1;
          if (stoppedCount === categories.length) {
            clearTimers();
            spinningRef.current = false;
            setSpinning(false);
            setResult(finalPicks);
            onPick(finalPicks);
          }
        }, 1200 + i * 450)
      );
    });
  };

  return (
    <div className="retro-hero p-6 space-y-6 min-h-[440px]">
      <div className="relative text-center">
        <h2 className="retro-display text-3xl">🎰 랜덤 조합</h2>
      </div>

      {!ready && (
        <div className="relative p-12 text-center text-inksoft border-2 border-dashed border-mutedindigo rounded-md">
          <FiShuffle size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">분류를 2개 이상 추가하고 각 분류를 불러오세요</p>
        </div>
      )}

      {ready && (
        <>
          {/* 릴 (가로 배치, 모바일에서 세로 스택) */}
          <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-3">
            {categories.map((cat, i) => (
              <div key={cat.id} className="flex-1 bg-white/70 rounded-[2px] p-4 text-center space-y-2 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft truncate">{cat.name || `분류 ${i + 1}`}</p>
                <p className={`text-2xl font-black text-ink truncate ${spinning ? 'animate-pulse' : ''}`}>
                  {(spinning ? display[i] : result?.[i]?.value ?? display[i] ?? cat.options[0]) || '—'}
                </p>
              </div>
            ))}
          </div>

          {/* 최종 결과 라벨 튜플 */}
          {result && !spinning && (
            <div className="relative space-y-2 animate-slide-up">
              {result.map((pick, i) => (
                <div key={i} className="retro-news-row p-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-inksoft">{pick.name || `분류 ${i + 1}`}</span>
                  <span className="text-lg font-bold text-ink">{pick.value}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSpin}
            disabled={spinning}
            className={`retro-btn retro-btn-signal w-full py-5 px-6 text-xl ${spinning ? 'retro-btn-busy' : ''}`}
          >
            {spinning ? '🎰 돌리는 중...' : '🎰 조합 뽑기!'}
          </button>
        </>
      )}
    </div>
  );
};
