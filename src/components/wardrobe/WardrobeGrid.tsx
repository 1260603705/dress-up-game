// src/components/wardrobe/WardrobeGrid.tsx
'use client';
import { useEffect } from 'react';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import { useCharacterStore } from '@/stores/characterStore';
import { CATEGORY_LABELS, GARMENT_CATEGORIES } from '@/lib/constants';
import WardrobeCard from './WardrobeCard';
import Pagination from '@/components/shared/Pagination';

interface Props {
  characterId: string | null;
  onSaveOutfit: () => void;
}

export default function WardrobeGrid({ characterId: _characterId, onSaveOutfit }: Props) {
  const {
    items, selectedCategory, page, totalPages,
    searchQuery, searchScopeAll, selectedItemId,
    setItems, setCategory, setPage, setTotalPages,
    setSearchQuery, toggleSearchScope, setSelectedItemId,
  } = useWardrobeStore();
  const { addWearing, undoLastWear, clearWearing, removeWearing, wearing } = useCharacterStore();

  // 获取数据 — 响应分类、分页、搜索、搜索范围变化
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all' && !searchScopeAll) params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', String(page));
    params.set('limit', '20');
    fetch(`/api/wardrobe?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setTotalPages(data.totalPages);
      });
  }, [selectedCategory, page, searchQuery, searchScopeAll, setItems, setTotalPages]);

  // 点击衣服 → 直接穿戴（同类别替换）
  const handleWear = (item: { id: string; category: string }) => {
    addWearing({ item_id: item.id, color_overrides: {} }, item.category);
    setSelectedItemId(item.id);
  };

  // 撤回 — 撤销最近一次穿戴
  const handleUndo = () => {
    undoLastWear();
    setSelectedItemId(null);
  };

  // 脱当前 — 优先级: 选中衣服 > 当前分类下穿的衣服 > 无反应
  const handleUndressCurrent = () => {
    if (selectedItemId) {
      removeWearing(selectedItemId);
      setSelectedItemId(null);
    } else if (selectedCategory !== 'all') {
      const itemInCategory = wearing.find((w) => w.category === selectedCategory);
      if (itemInCategory) {
        removeWearing(itemInCategory.item_id);
      }
    }
  };

  // 脱全部 — 清空所有穿戴
  const handleUndressAll = () => {
    clearWearing();
    setSelectedItemId(null);
  };

  const categories = ['all', ...GARMENT_CATEGORIES] as const;

  return (
    <div>
      {/* 分类标签 */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-2.5 py-1 rounded-md text-xs transition-all duration-200 cursor-pointer"
            style={{
              background: selectedCategory === cat ? 'var(--game-accent)' : 'var(--game-surface)',
              color: selectedCategory === cat ? 'var(--game-btn-text)' : 'var(--game-text-muted)',
              border: selectedCategory === cat ? 'none' : '1px solid var(--game-border)',
            }}
          >
            {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 搜索行 */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={toggleSearchScope}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap cursor-pointer
            transition-colors duration-200"
          style={{
            background: 'var(--game-sidebar-icon-bg)',
            border: '1px solid var(--game-border)',
            color: 'var(--game-text-secondary)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"/>
          </svg>
          {searchScopeAll
            ? '全部'
            : selectedCategory === 'all'
              ? '全部'
              : CATEGORY_LABELS[selectedCategory]}
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索衣服名称..."
          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs outline-none transition-colors duration-200"
          style={{
            background: 'white',
            border: '1px solid var(--game-border)',
            color: 'var(--game-text-primary)',
          }}
        />
      </div>

      {/* 操作按钮行 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleUndo}
          className="flex-1 py-1.5 rounded-md text-xs text-center cursor-pointer
            transition-all duration-200 active:scale-[0.98]"
          style={{
            border: '1px solid var(--game-border)',
            background: 'var(--game-surface)',
            color: 'var(--game-text-secondary)',
          }}
        >
          撤回
        </button>
        <button
          onClick={handleUndressCurrent}
          className="flex-1 py-1.5 rounded-md text-xs text-center cursor-pointer
            transition-all duration-200 active:scale-[0.98]"
          style={{
            border: '1px solid var(--game-border)',
            background: 'var(--game-surface)',
            color: 'var(--game-text-secondary)',
          }}
        >
          脱当前
        </button>
        <button
          onClick={handleUndressAll}
          className="flex-1 py-1.5 rounded-md text-xs text-center cursor-pointer
            transition-all duration-200 active:scale-[0.98]"
          style={{
            border: '1px solid var(--game-border)',
            background: 'var(--game-surface)',
            color: 'var(--game-text-secondary)',
          }}
        >
          脱全部
        </button>
        <button
          onClick={onSaveOutfit}
          className="flex-1 py-1.5 rounded-md text-xs text-center cursor-pointer
            transition-all duration-200 active:scale-[0.98] font-semibold"
          style={{
            background: 'var(--game-accent)',
            color: 'var(--game-btn-text)',
          }}
        >
          保存
        </button>
      </div>

      {/* 仓库网格 — 白色圆角外框 */}
      <div
        className="rounded-[10px] mb-3"
        style={{
          background: 'white',
          border: '1px solid var(--game-border)',
          padding: '14px 28px',
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <WardrobeCard
              key={item.id}
              id={item.id}
              name={item.name}
              thumbnailUrl={item.thumbnailUrl}
              isSelected={selectedItemId === item.id}
              onClick={() => handleWear(item)}
            />
          ))}
        </div>
      </div>

      {/* 分页 */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
