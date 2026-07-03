'use client';

import React, { useState } from 'react';
import { FiTrash2, FiEdit2, FiSave, FiX, FiPackage } from 'react-icons/fi';
import { DataItem } from '@/types';
import { MediaRenderer } from './MediaRenderer';

interface DataPreviewProps {
  data: DataItem[];
  onDataChange: (data: DataItem[]) => void;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data, onDataChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<DataItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const manualCount = data.filter(item => item.source === 'manual').length;
  const sheetsCount = data.filter(item => item.source === 'google-sheets').length;

  const handleStartEdit = (item: DataItem) => {
    setEditingId(item.id);
    setEditingData({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleSaveEdit = () => {
    if (!editingData) return;
    onDataChange(data.map(item => item.id === editingId ? editingData : item));
    setEditingId(null);
    setEditingData(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      onDataChange(data.filter(item => item.id !== id));
    }
  };

  const handleEditPropertyChange = (key: string, value: string) => {
    if (!editingData) return;
    const newProperties = { ...editingData.properties };
    if (value.trim()) {
      newProperties[key] = value;
    } else {
      delete newProperties[key];
    }
    setEditingData({ ...editingData, properties: newProperties });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (data.length === 0) {
    return (
      <div className="retro-panel p-8 text-center">
        <FiPackage size={48} className="mx-auto text-mutedindigo mb-4" />
        <h3 className="text-lg font-bold text-ink mb-2">저장된 데이터가 없습니다</h3>
        <p className="text-sm text-inksoft">직접 입력하거나 Google Sheets에서 데이터를 불러오세요.</p>
      </div>
    );
  }

  return (
    <div className="retro-panel p-6 space-y-4">
      <h2 className="retro-section-bar -mx-6 -mt-6">📦 저장된 데이터</h2>
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs px-3 py-1 bg-lavender/60 text-ink rounded-full font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          ✏️ 직접 입력: {manualCount}개
        </span>
        <span className="text-xs px-3 py-1 bg-canvassoft/60 text-ink rounded-full font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          📊 Google Sheets: {sheetsCount}개
        </span>
        <span className="text-xs px-3 py-1 bg-white text-ink rounded-full font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          📦 전체: {data.length}개
        </span>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {data.map((item, index) => {
          const isEditing = editingId === item.id;
          const isExpanded = expandedId === item.id;
          const hasProperties = Object.keys(item.properties).length > 0;

          return (
            <div
              key={item.id}
              className={`retro-news-row p-4 border-l-4 transition-all ${
                item.source === 'manual' ? 'border-l-lavender' : 'border-l-canvassoft'
              } ${isEditing ? 'ring-2 ring-chromeindigo' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="retro-plate rounded-full flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-sm text-inksoft">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingData?.title || ''}
                      onChange={(e) => setEditingData(editingData ? { ...editingData, title: e.target.value } : null)}
                      className="retro-input w-full px-3 py-2 font-bold"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-[2px] font-bold text-ink ${
                        item.source === 'manual' ? 'bg-lavender' : 'bg-canvassoft'
                      }`}>
                        {item.source === 'manual' ? '직접입력' : 'Sheets'}
                      </span>
                    </div>
                  )}

                  {/* Properties */}
                  {hasProperties && (
                    <div className="mt-2 space-y-2">
                      {Object.entries(item.properties).slice(0, isExpanded ? undefined : 2).map(([key, value]) => (
                        <div key={key} className="retro-plate p-3">
                          {isEditing ? (
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold uppercase tracking-wide text-inksoft">{key}</label>
                              <input
                                type="text"
                                value={editingData?.properties[key] || ''}
                                onChange={(e) => handleEditPropertyChange(key, e.target.value)}
                                className="retro-input w-full px-2 py-1 text-sm"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wide text-inksoft mb-1">{key}</p>
                              <MediaRenderer content={value} className="text-sm" />
                            </div>
                          )}
                        </div>
                      ))}

                      {!isEditing && Object.keys(item.properties).length > 2 && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-sm text-inksoft hover:text-brand font-bold"
                        >
                          {isExpanded ? '접기 ▲' : `더보기 (${Object.keys(item.properties).length - 2}개 항목) ▼`}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 text-signal hover:bg-[#fff1e2] rounded transition-colors"
                        title="저장"
                      >
                        <FiSave size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-mutedindigo hover:bg-white rounded transition-colors"
                        title="취소"
                      >
                        <FiX size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 text-inksoft hover:bg-white rounded transition-colors"
                        title="편집"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-brand hover:bg-[#fde5e6] rounded transition-colors"
                        title="삭제"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

