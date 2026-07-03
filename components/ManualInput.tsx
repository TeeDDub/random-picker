'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { DataItem } from '@/types';

interface ManualInputProps {
  data: DataItem[];
  onDataChange: (data: DataItem[]) => void;
}

interface ColumnConfig {
  key: string;
  label: string;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [];

export const ManualInput: React.FC<ManualInputProps> = ({ data, onDataChange }) => {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [newRow, setNewRow] = useState<{ title: string; [key: string]: string }>({
    title: '',
    ...Object.fromEntries(columns.map(col => [col.key, ''])),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<DataItem | null>(null);
  const [quickInput, setQuickInput] = useState('');

  // 빠른 입력: 콤마(또는 줄바꿈)로 구분한 후보를 한 번에 추가
  // "이름*3" 형태는 같은 후보를 3번 등록 (당첨 확률 가중치)
  const handleQuickAdd = () => {
    const entries = quickInput.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const titles: string[] = [];

    for (const entry of entries) {
      const repeatMatch = entry.match(/^(.+?)\s*\*\s*(\d+)$/);
      if (repeatMatch) {
        const count = parseInt(repeatMatch[2], 10);
        if (count > 100) {
          alert(`반복 횟수는 100 이하로 입력해주세요: "${entry}"`);
          return;
        }
        for (let i = 0; i < count; i++) {
          titles.push(repeatMatch[1].trim());
        }
      } else {
        titles.push(entry);
      }
    }

    if (titles.length === 0) return;

    const base = Date.now();
    const newItems: DataItem[] = titles.map((title, index) => ({
      id: `${base}-${index}`,
      title,
      properties: {},
      source: 'manual',
    }));

    onDataChange([...data, ...newItems]);
    setQuickInput('');
  };

  const handleAddColumn = () => {
    const newColKey = `col${columns.length + 1}`;
    const newColLabel = `컬럼 ${columns.length + 1}`;
    setColumns([...columns, { key: newColKey, label: newColLabel }]);
    setNewRow({ ...newRow, [newColKey]: '' });
  };

  const handleRemoveColumn = (key: string) => {
    setColumns(columns.filter(col => col.key !== key));
    const newRowData = { ...newRow };
    delete newRowData[key];
    setNewRow(newRowData);
  };

  const handleColumnLabelChange = (key: string, newLabel: string) => {
    setColumns(columns.map(col => 
      col.key === key ? { ...col, label: newLabel } : col
    ));
  };

  const handleAddRow = () => {
    if (!newRow.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    const properties: { [key: string]: string } = {};
    columns.forEach(col => {
      if (newRow[col.key]?.trim()) {
        properties[col.label] = newRow[col.key].trim();
      }
    });

    const newItem: DataItem = {
      id: Date.now().toString(),
      title: newRow.title.trim(),
      properties,
      source: 'manual',
    };

    onDataChange([...data, newItem]);
    
    // Reset form
    setNewRow({
      title: '',
      ...Object.fromEntries(columns.map(col => [col.key, ''])),
    });
  };

  const handleRemoveRow = (id: string) => {
    onDataChange(data.filter(item => item.id !== id));
  };

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

    onDataChange(data.map(item => 
      item.id === editingId ? editingData : item
    ));
    
    setEditingId(null);
    setEditingData(null);
  };

  const handleEditPropertyChange = (colLabel: string, value: string) => {
    if (!editingData) return;
    
    const newProperties = { ...editingData.properties };
    if (value.trim()) {
      newProperties[colLabel] = value;
    } else {
      delete newProperties[colLabel];
    }
    
    setEditingData({
      ...editingData,
      properties: newProperties,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">✏️ 직접 입력 (테이블 형식)</h2>
        <button
          onClick={handleAddColumn}
          className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold flex items-center gap-1"
        >
          <FiPlus size={16} />
          컬럼 추가
        </button>
      </div>

      {data.length > 0 && (
        <div className="text-sm text-gray-600 flex items-center justify-between">
          <span>총 {data.length}개 항목</span>
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-r border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-8">
                  NO
                </th>
                <th className="border-b border-r border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-700 min-w-[150px]">
                  제목 *
                </th>
                {columns.map((col) => (
                  <th key={col.key} className="border-b border-r border-gray-200 px-3 py-2 text-left min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={col.label}
                        onChange={(e) => handleColumnLabelChange(col.key, e.target.value)}
                        className="flex-1 text-sm font-semibold text-gray-700 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                      />
                      <button
                        onClick={() => handleRemoveColumn(col.key)}
                        className="text-red-500 hover:bg-red-50 rounded p-1"
                        title="컬럼 삭제"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="border-b border-gray-200 px-3 py-2 text-center text-sm font-semibold text-gray-700 w-20">
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Existing rows */}
              {data.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border-b border-r border-gray-200 px-3 py-2 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="border-b border-r border-gray-200 px-3 py-2">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editingData?.title || ''}
                        onChange={(e) => setEditingData(editingData ? { ...editingData, title: e.target.value } : null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    ) : (
                      <span className="text-sm text-gray-800 font-medium">{item.title}</span>
                    )}
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="border-b border-r border-gray-200 px-3 py-2">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editingData?.properties[col.label] || ''}
                          onChange={(e) => handleEditPropertyChange(col.label, e.target.value)}
                          placeholder={`${col.label} 입력`}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-gray-700 break-all">
                          {item.properties[col.label] || '-'}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="border-b border-gray-200 px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="저장"
                          >
                            <FiSave size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="취소"
                          >
                            <FiX size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="편집"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveRow(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="삭제"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* New row input */}
              <tr className="bg-blue-50">
                <td className="border-b border-r border-gray-200 px-3 py-2 text-sm text-gray-400">
                  •
                </td>
                <td className="border-b border-r border-gray-200 px-3 py-2">
                  <input
                    type="text"
                    value={newRow.title}
                    onChange={(e) => setNewRow({ ...newRow, title: e.target.value })}
                    placeholder="제목 입력 (필수)"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="border-b border-r border-gray-200 px-3 py-2">
                    <input
                      type="text"
                      value={newRow[col.key] || ''}
                      onChange={(e) => setNewRow({ ...newRow, [col.key]: e.target.value })}
                      placeholder={`${col.label} 입력`}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </td>
                ))}
                <td className="border-b border-gray-200 px-3 py-2">
                  <button
                    onClick={handleAddRow}
                    disabled={!newRow.title.trim()}
                    className="w-full px-2 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 text-sm font-semibold"
                  >
                    <FiPlus size={16} />
                    추가
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 빠른 입력 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-bold text-purple-800">⚡ 빠른 입력</h3>
        <p className="text-xs text-purple-700">
          콤마(,) 또는 줄바꿈으로 구분해 한 번에 추가합니다. &quot;이름*3&quot;처럼 쓰면 같은 후보가 3번 들어갑니다.
        </p>
        <textarea
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          rows={2}
          placeholder="예: 치킨, 피자*3, 초밥"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-y"
        />
        <button
          onClick={handleQuickAdd}
          disabled={!quickInput.trim()}
          className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 text-sm font-semibold"
        >
          <FiPlus size={16} />
          한 번에 추가
        </button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>팁:</strong> 컬럼 이름을 클릭하여 수정할 수 있습니다.</p>
        <p>💡 이미지 URL이나 유튜브 링크를 입력하면 자동으로 미디어로 표시됩니다.</p>
      </div>
    </div>
  );
};

