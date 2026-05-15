// src/components/shared/Pagination.tsx
export default function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="w-[26px] h-[26px] rounded-full border flex items-center justify-center text-xs
          disabled:opacity-30 cursor-pointer transition-colors duration-200"
        style={{ borderColor: 'var(--game-border)', color: 'var(--game-text-secondary)' }}
      >
        &lt;
      </button>
      <span className="text-sm" style={{ color: 'var(--game-text-secondary)' }}>
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-[26px] h-[26px] rounded-full border flex items-center justify-center text-xs
          disabled:opacity-30 cursor-pointer transition-colors duration-200"
        style={{ borderColor: 'var(--game-border)', color: 'var(--game-text-secondary)' }}
      >
        &gt;
      </button>
    </div>
  );
}
