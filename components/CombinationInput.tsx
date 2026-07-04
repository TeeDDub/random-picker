'use client';

import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiDownload } from 'react-icons/fi';
import { CombinationCategory } from '@/types';
import { fetchCategoryOptions } from '@/lib/googleSheets';

interface CombinationInputProps {
  categories: CombinationCategory[];
  onChange: (categories: CombinationCategory[]) => void;
}

export const CombinationInput: React.FC<CombinationInputProps> = ({ categories, onChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [id: string]: string }>({});

  const update = (id: string, patch: Partial<CombinationCategory>) => {
    onChange(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addCategory = () => {
    onChange([...categories, { id: Date.now().toString(), name: '', url: '', options: [] }]);
  };

  const removeCategory = (id: string) => {
    onChange(categories.filter((c) => c.id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const loadCategory = async (cat: CombinationCategory) => {
    if (!cat.url.trim()) {
      setErrors((prev) => ({ ...prev, [cat.id]: 'URL을 입력하세요' }));
      return;
    }
    setLoadingId(cat.id);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[cat.id];
      return next;
    });
    try {
      const options = await fetchCategoryOptions(cat.url);
      if (options.length === 0) throw new Error('empty');
      update(cat.id, { options });
    } catch {
      update(cat.id, { options: [] });
      setErrors((prev) => ({ ...prev, [cat.id]: '불러오기 실패 — URL과 공개 설정을 확인하세요' }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="retro-panel p-6 space-y-4">
      <h2 className="retro-section-bar -mx-6 -mt-6">🎰 랜덤 조합 — 분류 입력</h2>

      <p className="text-xs text-inksoft">
        분류마다 이름과 Google Sheet URL을 넣고 불러오세요. 각 분류에서 하나씩 뽑아 조합합니다.
      </p>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="retro-plate p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={cat.name}
                onChange={(e) => update(cat.id, { name: e.target.value })}
                placeholder="분류 이름 (예: 음식)"
                className="retro-input w-40 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={cat.url}
                onChange={(e) => update(cat.id, { url: e.target.value })}
                placeholder="Google Sheets URL"
                className="retro-input flex-1 px-3 py-2 text-sm"
              />
              <button
                onClick={() => removeCategory(cat.id)}
                className="px-3 py-2 text-brand hover:bg-[#fde5e6] rounded-[2px] transition-colors"
                title="분류 삭제"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadCategory(cat)}
                disabled={loadingId === cat.id}
                className="retro-btn retro-btn-carbon px-4 py-1.5 text-xs flex items-center gap-1"
              >
                <FiDownload size={14} />
                {loadingId === cat.id ? '불러오는 중...' : '불러오기'}
              </button>
              {cat.options.length > 0 && (
                <span className="text-xs font-bold text-inksoft">✅ {cat.options.length}개 옵션</span>
              )}
              {errors[cat.id] && (
                <span className="text-xs font-bold text-brand">{errors[cat.id]}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addCategory}
        className="retro-btn retro-btn-amber w-full px-4 py-2 text-xs flex items-center justify-center gap-1"
      >
        <FiPlus size={16} />
        분류 추가
      </button>
    </div>
  );
};
