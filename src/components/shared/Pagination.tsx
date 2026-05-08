// src/components/shared/Pagination.tsx - 上一页/下一页
export default function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 border rounded text-sm disabled:opacity-30">上一页</button>
      <span className="text-sm text-gray-500">{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 border rounded text-sm disabled:opacity-30">下一页</button>
    </div>
  );
}
