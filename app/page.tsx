'use client';

import React, { useState, useEffect } from 'react';
import { FiTrash2, FiShuffle, FiEdit } from 'react-icons/fi';
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
  };

  // Clear all data
  const handleClearAll = () => {
    if (confirm('모든 데이터를 삭제하시겠습니까? (직접 입력, Google Sheets, 이력)')) {
      clearAll();
      setAllData([]);
      setGoogleSheetsUrl('');
      setPickHistory([]);
    }
  };

  // Clear history
  const handleClearHistory = () => {
    if (confirm('선택 이력을 삭제하시겠습니까?')) {
      clearPickHistory();
      setPickHistory([]);
    }
  };

  // Get manual data for input component
  const manualData = allData.filter(item => item.source === 'manual');
  const manualCount = manualData.length;
  const sheetsCount = allData.filter(item => item.source === 'google-sheets').length;

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-slide-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎲 Random Picker
          </h1>
          <p className="text-xl text-gray-600">
            랜덤 선택기 - 데이터를 입력하고 공정하게 추첨하세요
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setViewMode('input')}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all flex items-center gap-2 ${
              viewMode === 'input'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
            }`}
          >
            <FiEdit size={20} />
            데이터 입력
          </button>
          <button
            onClick={() => setViewMode('picker')}
            disabled={allData.length === 0}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all flex items-center gap-2 ${
              viewMode === 'picker'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                : allData.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
            }`}
          >
            <FiShuffle size={20} />
            랜덤 추첨 {allData.length > 0 && `(${allData.length})`}
          </button>
          <button
            onClick={() => setViewMode('team')}
            disabled={allData.length === 0}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all flex items-center gap-2 ${
              viewMode === 'team'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105'
                : allData.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
            }`}
          >
            👥 팀나누기 {allData.length > 0 && `(${allData.length})`}
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex gap-3 flex-wrap">
              <div className="px-4 py-2 bg-purple-100 rounded-lg">
                <span className="text-sm font-semibold text-purple-800">
                  ✏️ 직접 입력: {manualCount}개
                </span>
              </div>
              <div className="px-4 py-2 bg-green-100 rounded-lg">
                <span className="text-sm font-semibold text-green-800">
                  📊 Google Sheets: {sheetsCount}개
                </span>
              </div>
              <div className="px-4 py-2 bg-blue-100 rounded-lg">
                <span className="text-sm font-semibold text-blue-800">
                  📦 전체: {allData.length}개
                </span>
              </div>
            </div>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <FiTrash2 size={16} />
              <span className="text-sm font-semibold text-red-800">전체 삭제</span>
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
                data={allData}
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
                  manualCount={manualData.length}
                  sheetsCount={allData.filter(item => item.source === 'google-sheets').length}
                  isAnimating={isAnimating}
                  spinCount={spinCount}
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

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-gray-500 text-sm">
            Made with ❤️ for better decisions
          </p>
        </div>
      </div>
    </main>
  );
}
