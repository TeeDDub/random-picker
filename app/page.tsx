'use client';

import React, { useState, useEffect } from 'react';
import { FiTrash2, FiShuffle, FiEdit, FiGithub } from 'react-icons/fi';
import { DataItem, PickHistory as PickHistoryType } from '@/types';
import {
  getAllData,
  saveAllData,
  getGoogleSheetsInfo,
  saveGoogleSheetsInfo,
  getPickHistory,
  addToPickHistory,
  clearPickHistory,
  clearAll,
  getRemoveSameTitleOption,
  saveRemoveSameTitleOption,
} from '@/lib/localStorage';
import { ManualInput } from '@/components/ManualInput';
import { GoogleSheetsInput } from '@/components/GoogleSheetsInput';
import { DataPreview } from '@/components/DataPreview';
import { RandomPicker } from '@/components/RandomPicker';
import { PickerButton } from '@/components/PickerButton';
import { PickHistory } from '@/components/PickHistory';
import { TeamDivider } from '@/components/TeamDivider';

type ViewMode = 'input' | 'picker' | 'team';

export default function Home() {
  const [allData, setAllData] = useState<DataItem[]>([]);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>('');
  const [pickHistory, setPickHistory] = useState<PickHistoryType[]>([]);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [isAnimating, setIsAnimating] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  // 중복 방지: 이미 뽑힌 항목들 (새로고침 시 초기화)
  const [pickedItems, setPickedItems] = useState<DataItem[]>([]);
  const [removeSameTitle, setRemoveSameTitle] = useState(false);
  const randomPickerRef = React.useRef<{ startPick: () => void } | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    setMounted(true);
    setAllData(getAllData());
    
    const sheetsInfo = getGoogleSheetsInfo();
    if (sheetsInfo) {
      setGoogleSheetsUrl(sheetsInfo.url);
    }
    
    setPickHistory(getPickHistory());
    setRemoveSameTitle(getRemoveSameTitleOption());
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      saveAllData(allData);
    }
  }, [allData, mounted]);

  // Handle manual data change
  const handleManualDataChange = (manualItems: DataItem[]) => {
    // Keep Google Sheets data, update only manual data
    const sheetsData = allData.filter(item => item.source === 'google-sheets');
    setAllData([...manualItems, ...sheetsData]);
  };

  // Handle Google Sheets data fetch
  const handleGoogleSheetsFetch = (sheetsItems: DataItem[], url: string) => {
    // Remove old Google Sheets data, keep manual data
    const manualData = allData.filter(item => item.source === 'manual');
    setAllData([...manualData, ...sheetsItems]);
    
    setGoogleSheetsUrl(url);
    saveGoogleSheetsInfo({
      url,
      lastFetched: Date.now(),
    });
  };

  // Handle data change from preview (edit/delete)
  const handleDataChange = (newData: DataItem[]) => {
    setAllData(newData);
  };

  // Handle pick
  const handlePick = (item: DataItem) => {
    const newHistory: PickHistoryType = {
      timestamp: Date.now(),
      item,
    };

    addToPickHistory(newHistory);
    setPickHistory(getPickHistory());

    // 뽑힌 항목은 다음 추첨에서 제외 (옵션에 따라 같은 제목 전체 제외)
    setPickedItems(prev => (
      removeSameTitle
        ? [...prev, ...allData.filter(d => !prev.includes(d) && d.title === item.title)]
        : [...prev, item]
    ));
  };

  // Reset picked items so everything can be drawn again
  const handleResetPicks = () => {
    setPickedItems([]);
  };

  // Toggle the remove-same-title option (persisted)
  const handleRemoveSameTitleChange = (value: boolean) => {
    setRemoveSameTitle(value);
    saveRemoveSameTitleOption(value);
  };

  // Clear all data
  const handleClearAll = () => {
    if (confirm('모든 데이터를 삭제하시겠습니까? (직접 입력, Google Sheets, 이력)')) {
      clearAll();
      setAllData([]);
      setGoogleSheetsUrl('');
      setPickHistory([]);
      setPickedItems([]);
    }
  };

  // Clear history
  const handleClearHistory = () => {
    if (confirm('히스토리를 삭제하시겠습니까?')) {
      clearPickHistory();
      setPickHistory([]);
    }
  };

  // Get manual data for input component
  const manualData = allData.filter(item => item.source === 'manual');
  const manualCount = manualData.length;
  const sheetsCount = allData.filter(item => item.source === 'google-sheets').length;

  // 아직 뽑히지 않은 항목들 (추첨 대상)
  const remainingData = allData.filter(item => !pickedItems.includes(item));

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header — dual nav-bar: carbon primary + pale-sky secondary */}
        <header className="animate-slide-up">
          <div className="retro-nav flex items-center gap-3 h-14 px-4">
            <div className="retro-logo-pill px-4 py-1.5 text-base">🎲 RANDOM PICKER</div>
            <h1 className="text-lg font-bold tracking-wide text-navgold">랜덤 뽑기</h1>
          </div>
          <div className="bg-canvassoft text-ink text-[11px] font-bold uppercase tracking-[1.5px] px-4 py-1.5 border-t border-white/40">
            오늘의 결정, 팀 나누기 대신해 드립니다
          </div>
        </header>

        {/* View Mode Tabs */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setViewMode('input')}
            className={`retro-btn px-8 py-3 text-sm flex items-center gap-2 ${
              viewMode === 'input' ? 'retro-tab-active' : 'retro-tab-idle'
            }`}
          >
            <FiEdit size={18} />
            데이터 입력
          </button>
          <button
            onClick={() => setViewMode('picker')}
            disabled={allData.length === 0}
            className={`retro-btn px-8 py-3 text-sm flex items-center gap-2 ${
              viewMode === 'picker'
                ? 'retro-tab-active'
                : allData.length === 0
                ? 'retro-tab-disabled'
                : 'retro-tab-idle'
            }`}
          >
            <FiShuffle size={18} />
            랜덤 추첨 {allData.length > 0 && `(${allData.length})`}
          </button>
          <button
            onClick={() => setViewMode('team')}
            disabled={allData.length === 0}
            className={`retro-btn px-8 py-3 text-sm flex items-center gap-2 ${
              viewMode === 'team'
                ? 'retro-tab-active'
                : allData.length === 0
                ? 'retro-tab-disabled'
                : 'retro-tab-idle'
            }`}
          >
            👥 팀나누기 {allData.length > 0 && `(${allData.length})`}
          </button>
        </div>

        {/* Stats Bar */}
        <div className="retro-panel-surface p-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex gap-3 flex-wrap">
              <div className="px-4 py-2 bg-lavender/60 rounded-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                <span className="text-sm font-bold text-ink">
                  ✏️ 직접 입력: {manualCount}개
                </span>
              </div>
              <div className="px-4 py-2 bg-canvassoft/60 rounded-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                <span className="text-sm font-bold text-ink">
                  📊 Google Sheets: {sheetsCount}개
                </span>
              </div>
              <div className="px-4 py-2 bg-platinum rounded-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                <span className="text-sm font-bold text-ink">
                  📦 전체: {allData.length}개
                </span>
              </div>
            </div>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-[#fde5e6] hover:bg-[#fbd0d3] rounded-[2px] transition-colors flex items-center gap-2 text-[#8f0009]"
            >
              <FiTrash2 size={16} />
              <span className="text-sm font-bold">전체 삭제</span>
            </button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Data Preview */}
            <div className="animate-fade-in">
              <DataPreview data={allData} onDataChange={handleDataChange} />
            </div>

            {/* Right: Data Input */}
            <div className="space-y-6">
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <GoogleSheetsInput
                  onDataFetch={handleGoogleSheetsFetch}
                  currentUrl={googleSheetsUrl}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <ManualInput 
                  data={manualData} 
                  onDataChange={handleManualDataChange} 
                />
              </div>
            </div>
          </div>
        ) : viewMode === 'picker' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Random Picker Result (wider) */}
            <div className="lg:col-span-2 animate-fade-in">
              <RandomPicker
                data={remainingData}
                onPick={handlePick}
                onAnimationChange={(animating, count) => {
                  setIsAnimating(animating);
                  setSpinCount(count);
                }}
              />
            </div>

            {/* Right: Picker Button + History */}
            <div className="space-y-6">
              <div className="animate-fade-in">
                <PickerButton
                  totalItems={allData.length}
                  remainingCount={remainingData.length}
                  manualCount={manualData.length}
                  sheetsCount={allData.filter(item => item.source === 'google-sheets').length}
                  isAnimating={isAnimating}
                  spinCount={spinCount}
                  removeSameTitle={removeSameTitle}
                  onRemoveSameTitleChange={handleRemoveSameTitleChange}
                  onReset={handleResetPicks}
                  onPick={() => {
                    const event = new CustomEvent('startRandomPick');
                    window.dispatchEvent(event);
                  }}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <PickHistory history={pickHistory} onClear={handleClearHistory} />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <TeamDivider data={allData} />
          </div>
        )}

        {/* Footer — carbon command slab */}
        <footer className="retro-footer mt-8 p-5 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-xs tracking-wide">© 2026 Random Picker</span>
            <a
              href="https://github.com/TeeDDub/random-picker"
              target="_blank"
              rel="noopener noreferrer"
              className="retro-btn retro-btn-amber inline-flex items-center gap-2 px-4 py-2 text-xs"
            >
              <FiGithub size={16} />
              <span>GitHub</span>
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
