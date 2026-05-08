// src/components/shared/Modal.tsx - 点击遮罩关闭的弹窗
export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
