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
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">저장된 데이터가 없습니다</h3>
        <p className="text-gray-500">직접 입력하거나 Google Sheets에서 데이터를 불러오세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📦 저장된 데이터</h2>
          <div className="flex gap-3 mt-2">
            <span className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
              ✏️ 직접 입력: {manualCount}개
            </span>
            <span className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
              📊 Google Sheets: {sheetsCount}개
            </span>
            <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
              전체: {data.length}개
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {data.map((item, index) => {
          const isEditing = editingId === item.id;
          const isExpanded = expandedId === item.id;
          const hasProperties = Object.keys(item.properties).length > 0;

          return (
            <div
              key={item.id}
              className={`border rounded-lg p-4 transition-all ${
                item.source === 'manual' ? 'border-purple-200 bg-purple-50' : 'border-green-200 bg-green-50'
              } ${isEditing ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-full font-bold text-sm text-gray-600">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingData?.title || ''}
                      onChange={(e) => setEditingData(editingData ? { ...editingData, title: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.source === 'manual' ? 'bg-purple-200 text-purple-700' : 'bg-green-200 text-green-700'
                      }`}>
                        {item.source === 'manual' ? '직접입력' : 'Sheets'}
                      </span>
                    </div>
                  )}

                  {/* Properties */}
                  {hasProperties && (
                    <div className="mt-2 space-y-2">
                      {Object.entries(item.properties).slice(0, isExpanded ? undefined : 2).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg p-3">
                          {isEditing ? (
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-600">{key}</label>
                              <input
                                type="text"
                                value={editingData?.properties[key] || ''}
                                onChange={(e) => handleEditPropertyChange(key, e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">{key}</p>
                              <MediaRenderer content={value} className="text-sm" />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {!isEditing && Object.keys(item.properties).length > 2 && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
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
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="저장"
                      >
                        <FiSave size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="취소"
                      >
                        <FiX size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="편집"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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

