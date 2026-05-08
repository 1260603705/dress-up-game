// src/app/(game)/character/create/page.tsx — 创建/编辑角色页
'use client';
import { useState, useRef } from 'react';
import CharacterCanvas, { CharacterCanvasHandle } from '@/components/character/CharacterCanvas';
import CharacterForm from '@/components/character/CharacterForm';
import SaveOutfitForm from '@/components/outfit/SaveOutfitForm';
import { useCharacterStore } from '@/stores/characterStore';

export default function CreateCharacterPage() {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [snapshotBase64, setSnapshotBase64] = useState<string>();
  const canvasRef = useRef<CharacterCanvasHandle>(null);
  const { wearing, characterId } = useCharacterStore();

  function handleOpenSave() {
    // 先抓取当前 Canvas 快照
    const dataUrl = canvasRef.current?.getSnapshot();
    setSnapshotBase64(dataUrl);
    setShowSaveForm(true);
  }

  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <CharacterCanvas ref={canvasRef} />
        <button
          onClick={handleOpenSave}
          className="mt-3 w-full py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition"
        >
          保存当前搭配
        </button>
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
    </div>
  );
}
