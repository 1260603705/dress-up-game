// src/components/character/CharacterForm.tsx
// 捏人参数编辑表单 - 用按钮组代替下拉框，方便预览切换
'use client';
import { useCharacterStore, DEFAULT_PRESETS } from '@/stores/characterStore';

// 每个参数的可选值 + 中文标签
const OPTIONS: Record<string, { label: string; value: string }[]> = {
  height: [{ label: '矮', value: 'short' }, { label: '中', value: 'medium' }, { label: '高', value: 'tall' }],
  shape: [{ label: '纤细', value: 'slim' }, { label: '标准', value: 'standard' }, { label: '丰满', value: 'plump' }],
  face: [{ label: '圆脸', value: 'round' }, { label: '瓜子脸', value: 'oval' }, { label: '方脸', value: 'square' }, { label: '鹅蛋脸', value: 'heart' }],
  eyes: [{ label: '杏眼', value: 'almond' }, { label: '丹凤眼', value: 'phoenix' }, { label: '桃花眼', value: 'peach' }],
  eyebrows: [{ label: '柳叶眉', value: 'willow' }, { label: '平眉', value: 'flat' }, { label: '剑眉', value: 'arched' }],
  mouth: [{ label: '薄唇', value: 'thin' }, { label: '标准', value: 'standard' }, { label: '厚唇', value: 'thick' }],
  skin_tone: [{ label: '白皙', value: 'fair' }, { label: '自然', value: 'natural' }, { label: '小麦', value: 'wheat' }, { label: '深色', value: 'deep' }],
};

export default function CharacterForm() {
  const { params, setParams, resetParams } = useCharacterStore();

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {/* 预设选择 */}
      <section>
        <h3 className="font-semibold mb-2">预设</h3>
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_PRESETS.map(p => (
            <button key={p.name} onClick={() => setParams(p.params)}
              className="px-3 py-1 border rounded text-sm hover:bg-purple-50">{p.name}</button>
          ))}
        </div>
      </section>

      {/* 性别 */}
      <section>
        <h3 className="font-semibold mb-2">性别</h3>
        <div className="flex gap-2">
          {[{ label: '女', value: 'female' }, { label: '男', value: 'male' }].map(o => (
            <button key={o.value} onClick={() => setParams({ gender: o.value as any })}
              className={`px-4 py-1 rounded text-sm ${params.gender === o.value ? 'bg-purple-600 text-white' : 'border'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {/* 身高、体型、脸型、眼型、眉型、嘴型、肤色 */}
      {([
        ['身高', 'height'], ['体型', 'shape'], ['脸型', 'face'],
        ['眼型', 'eyes'], ['眉型', 'eyebrows'], ['嘴型', 'mouth'], ['肤色', 'skin_tone'],
      ] as const).map(([label, key]) => (
        <section key={key}>
          <h3 className="font-semibold mb-2">{label}</h3>
          <div className="flex gap-2 flex-wrap">
            {OPTIONS[key].map(o => (
              <button key={o.value} onClick={() => setParams({ [key]: o.value } as any)}
                className={`px-4 py-1 rounded text-sm ${(params as any)[key] === o.value ? 'bg-purple-600 text-white' : 'border'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </section>
      ))}

      <button onClick={resetParams} className="px-4 py-2 border rounded text-sm text-gray-500">恢复默认</button>
    </div>
  );
}
