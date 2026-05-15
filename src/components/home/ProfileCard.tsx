// src/components/home/ProfileCard.tsx
import Link from 'next/link';

interface CharItem {
  id: string;
  name: string;
  gender: string;
}

interface Props {
  character: CharItem | null;
}

export default function ProfileCard({ character }: Props) {
  if (!character) {
    return (
      <div className="flex-shrink-0 text-center text-xs" style={{ color: 'var(--game-text-muted)' }}>
        <Link href="/character/create" className="text-game-accent hover:underline">
          创建角色
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* 头像圆形 */}
      <div
        className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background:
            character.gender === 'female'
              ? 'linear-gradient(135deg, #fde8c8, #fde0c8)'
              : 'linear-gradient(135deg, #e8e4dc, #d8d4cc)',
          color: 'var(--game-text-secondary)',
        }}
      >
        {character.gender === 'female' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a8 8 0 0 0-2 15.74V22h2v-4.26A8 8 0 0 0 12 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 0 0-1.5 5.6v1.4h2v-1.4A3 3 0 0 0 12 7z"/>
          </svg>
        )}
      </div>

      {/* 名字 + 等级签名 */}
      <div className="min-w-0">
        <div className="text-xs font-semibold truncate" style={{ color: 'var(--game-text-primary)' }}>
          {character.name}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--game-text-muted)' }}>
          Lv.1 · 签名
        </div>
      </div>
    </div>
  );
}
