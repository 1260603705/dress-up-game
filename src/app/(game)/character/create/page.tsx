// src/app/(game)/character/create/page.tsx — 创建/编辑角色页
'use client';
import { useState, useRef } from 'react';
import CharacterCanvas, { CharacterCanvasHandle } from '@/components/character/CharacterCanvas';
import CharacterForm from '@/components/character/CharacterForm';
import SaveOutfitForm from '@/components/outfit/SaveOutfitForm';
import ShareOutfitForm from '@/components/forum/ShareOutfitForm';
import { useCharacterStore } from '@/stores/characterStore';

export default function CreateCharacterPage() {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);
  const [snapshotBase64, setSnapshotBase64] = useState<string>();
  const [sharedImageUrl, setSharedImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef<CharacterCanvasHandle>(null);
  const { wearing, characterId } = useCharacterStore();

  function handleOpenSave() {
    const dataUrl = canvasRef.current?.getSnapshot();
    setSnapshotBase64(dataUrl);
    setShowSaveForm(true);
  }

  async function handleShare() {
    const dataUrl = canvasRef.current?.getSnapshot();
    if (!dataUrl) return;
    setUploading(true);
    try {
      // 上传快照到服务器
      const blob = await (await fetch(dataUrl)).blob();
      const form = new FormData();
      form.append('file', blob, 'outfit_share.png');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        setSharedImageUrl(data.display); // 800px 展示图
        setShowShareForm(true);
      } else {
        alert('图片上传失败');
      }
    } catch {
      alert('网络错误');
    }
    setUploading(false);
  }

  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <CharacterCanvas ref={canvasRef} />
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleOpenSave}
            className="flex-1 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition"
          >
            保存当前搭配
          </button>
          <button
            onClick={handleShare}
            disabled={uploading}
            className="flex-1 py-2 border border-purple-300 text-purple-600 rounded text-sm hover:bg-purple-50 disabled:opacity-50 transition"
          >
            {uploading ? '上传中...' : '分享到社区'}
          </button>
        </div>
      </div>
      <div className="flex-1 max-w-lg">
        <CharacterForm />
      </div>

      {showSaveForm && (
        <SaveOutfitForm
          characterId={characterId}
          outfitData={wearing}
          snapshotBase64={snapshotBase64}
          onClose={() => setShowSaveForm(false)}
        />
      )}

      {showShareForm && (
        <ShareOutfitForm
          imageUrl={sharedImageUrl}
          onClose={() => setShowShareForm(false)}
        />
      )}
    </div>
  );
}
