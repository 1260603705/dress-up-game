// src/components/wardrobe/WardrobeCard.tsx
'use client';
interface Props {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  isSelected: boolean;
  onClick: () => void;
}
export default function WardrobeCard({ name, thumbnailUrl, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.97]"
      style={{
        background: 'var(--game-surface)',
        border: isSelected
          ? '2px solid var(--game-accent)'
          : '2px solid var(--game-border)',
        boxShadow: isSelected ? '0 0 0 1px var(--game-accent)' : undefined,
      }}
    >
      <div
        className="w-full aspect-square flex items-center justify-center"
        style={{ background: 'var(--game-sidebar-icon-bg)' }}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px]" style={{ color: 'var(--game-text-muted)' }}>
            暂无预览
          </span>
        )}
      </div>
      <div
        className="p-1 text-[10px] text-center truncate leading-tight"
        style={{ color: 'var(--game-text-secondary)' }}
      >
        {name}
      </div>
    </button>
  );
}
