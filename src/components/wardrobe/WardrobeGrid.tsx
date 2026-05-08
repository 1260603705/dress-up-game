// src/components/wardrobe/WardrobeGrid.tsx - 仓库网格 + 分类Tab + 分页
'use client';
import { useEffect } from 'react';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import { useCharacterStore } from '@/stores/characterStore';
import { CATEGORY_LABELS, GARMENT_CATEGORIES } from '@/lib/constants';
import WardrobeCard from './WardrobeCard';
import WardrobeDetail from './WardrobeDetail';
import Pagination from '@/components/shared/Pagination';

export default function WardrobeGrid() {
  const { items, selectedCategory, page, totalPages, selectedItem,
    setItems, setCategory, setPage, setTotalPages, setSelectedItem } = useWardrobeStore();
  const addWearing = useCharacterStore(s => s.addWearing);

  // 分类或页码变化 → 请求API
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    params.set('page', String(page)); params.set('limit', '20');
    fetch(`/api/wardrobe?${params}`).then(r => r.json()).then(data => {
      setItems(data.items); setTotalPages(data.totalPages);
    });
  }, [selectedCategory, page]);

  const categories = ['all', ...GARMENT_CATEGORIES] as const;
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded text-sm ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'border hover:bg-gray-100'}`}>
            {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {items.map(item => <WardrobeCard key={item.id} {...item} onClick={() => setSelectedItem(item)} />)}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {selectedItem && (
        <WardrobeDetail item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onWear={() => { addWearing({ item_id: selectedItem.id, color_overrides: {} }); setSelectedItem(null); }}
        />
      )}
    </div>
  );
}
