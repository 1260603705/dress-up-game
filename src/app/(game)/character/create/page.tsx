// src/app/(game)/character/create/page.tsx — 创建/编辑角色页
'use client';
import CharacterCanvas from '@/components/character/CharacterCanvas';
import CharacterForm from '@/components/character/CharacterForm';

export default function CreateCharacterPage() {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0"><CharacterCanvas /></div>
      <div className="flex-1 max-w-lg"><CharacterForm /></div>
    </div>
  );
}
