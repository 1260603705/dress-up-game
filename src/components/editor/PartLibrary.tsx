// src/components/editor/PartLibrary.tsx
// 左栏：部件库浏览器 — 按类型分组展开，点击添加到当前编辑的衣服
'use client';
import { useDesignStore } from '@/stores/designStore';
import type { PartType, BoneName } from '@/lib/types';

const PART_TYPE_LABELS: Record<PartType, string> = {
  base_shape: '基布版型', collar: '领口', sleeve: '袖型',
  hem: '下摆', pattern: '图案', decoration: '装饰', texture: '材质',
};

const DEFAULT_BONES: Record<PartType, BoneName> = {
  base_shape: 'chest', collar: 'neck', sleeve: 'left_shoulder',
  hem: 'waist', pattern: 'chest', decoration: 'waist', texture: 'chest',
};

const TEMPLATES: { id: string; partType: PartType; name: string; label: string }[] = [
  { id: 'base_tshirt_01', partType: 'base_shape' as PartType, name: 'T恤', label: '基础T恤' },
  { id: 'base_shirt_01', partType: 'base_shape' as PartType, name: '衬衫', label: '基础衬衫' },
  { id: 'base_dress_a_01', partType: 'base_shape' as PartType, name: 'A字连衣裙', label: 'A字连衣裙' },
  { id: 'base_hoodie_01', partType: 'base_shape' as PartType, name: '卫衣', label: '基础卫衣' },
  { id: 'base_jacket_01', partType: 'base_shape' as PartType, name: '外套', label: '基础外套' },
  { id: 'base_jeans_01', partType: 'base_shape' as PartType, name: '牛仔裤', label: '基础牛仔裤' },
  { id: 'base_skirt_short_01', partType: 'base_shape' as PartType, name: '短裙', label: 'A字短裙' },
  { id: 'base_skirt_long_01', partType: 'base_shape' as PartType, name: '长裙', label: '百褶长裙' },
  { id: 'collar_round_01', partType: 'collar', name: '圆领', label: '圆领' },
  { id: 'collar_v_01', partType: 'collar', name: 'V领', label: 'V领' },
  { id: 'collar_square_01', partType: 'collar', name: '方领', label: '方领' },
  { id: 'collar_high_01', partType: 'collar', name: '高领', label: '高领' },
  { id: 'collar_collar_01', partType: 'collar', name: '翻领', label: '翻领' },
  { id: 'sleeve_none', partType: 'sleeve', name: '无袖', label: '无袖' },
  { id: 'sleeve_short_01', partType: 'sleeve', name: '短袖', label: '短袖' },
  { id: 'sleeve_puff_01', partType: 'sleeve', name: '泡泡袖', label: '泡泡袖' },
  { id: 'sleeve_long_01', partType: 'sleeve', name: '长袖', label: '长袖' },
  { id: 'hem_straight_01', partType: 'hem', name: '直筒', label: '直筒下摆' },
  { id: 'hem_a_01', partType: 'hem', name: 'A字', label: 'A字下摆' },
  { id: 'hem_ruffle_01', partType: 'hem', name: '荷叶边', label: '荷叶边下摆' },
  { id: 'pat_stripe_01', partType: 'pattern', name: '条纹', label: '条纹' },
  { id: 'pat_plaid_01', partType: 'pattern', name: '格子', label: '格子' },
  { id: 'pat_dot_01', partType: 'pattern', name: '波点', label: '波点' },
  { id: 'pat_floral_01', partType: 'pattern', name: '碎花', label: '碎花' },
  { id: 'deco_bow_01', partType: 'decoration', name: '蝴蝶结', label: '蝴蝶结' },
  { id: 'deco_button_01', partType: 'decoration', name: '纽扣', label: '纽扣' },
  { id: 'deco_lace_01', partType: 'decoration', name: '蕾丝边', label: '蕾丝边' },
  { id: 'tex_cotton_01', partType: 'texture', name: '棉布', label: '棉布纹理' },
  { id: 'tex_denim_01', partType: 'texture', name: '牛仔', label: '牛仔纹理' },
  { id: 'tex_silk_01', partType: 'texture', name: '丝绸', label: '丝绸纹理' },
];

function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => { const key = keyFn(item); (acc[key] ??= []).push(item); return acc; }, {} as Record<K, T[]>);
}

export default function PartLibrary() {
  const addPart = useDesignStore(s => s.addPart);
  const parts = useDesignStore(s => s.parts);
  const grouped = groupBy(TEMPLATES, t => t.partType);

  const handleAdd = (t: (typeof TEMPLATES)[0]) => {
    addPart({
      id: t.id, partType: t.partType, name: t.name, label: t.label,
      defaultBone: DEFAULT_BONES[t.partType],
      textureUrl: `/assets/system/${t.partType}s/${t.id}.png`,
    });
  };

  return (
    <div className="w-64 bg-white border-r p-3 overflow-y-auto h-full">
      <h3 className="font-semibold text-sm mb-3">部件库 ({parts.length}/15)</h3>
      {Object.entries(grouped).map(([type, templates]) => (
        <details key={type} className="mb-2">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer py-1">
            {PART_TYPE_LABELS[type as PartType]}
          </summary>
          <div className="pl-2 space-y-1 mt-1">
            {templates.map(t => (
              <button key={t.id} onClick={() => handleAdd(t)}
                className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-purple-50 transition">
                {t.label}
              </button>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
