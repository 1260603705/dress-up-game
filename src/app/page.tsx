// src/app/page.tsx — 游戏着陆页（未登录用户看到的首页）
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col items-center justify-center">
      <main className="text-center max-w-lg mx-auto px-6">
        <h1 className="text-5xl font-bold text-purple-700 mb-3">
          DressUp
        </h1>
        <p className="text-lg text-purple-500 mb-2">
          2D 换装游戏
        </p>
        <p className="text-sm text-gray-500 mb-10 leading-relaxed">
          创建你的专属角色，自由搭配服装，<br />
          创作独一无二的时装，与社区分享穿搭灵感。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition shadow-sm"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 border-2 border-purple-300 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition"
          >
            注册新账号
          </Link>
        </div>

        {/* 功能亮点 */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-500">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-1 text-purple-500 font-bold">人</div>
            <p className="font-medium text-gray-700">角色定制</p>
            <p className="text-xs mt-1">捏人参数自由调整</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-1 text-pink-500 font-bold">衣</div>
            <p className="font-medium text-gray-700">丰富衣柜</p>
            <p className="text-xs mt-1">大量服装自由搭配</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-1 text-blue-500 font-bold">创</div>
            <p className="font-medium text-gray-700">服装创作</p>
            <p className="text-xs mt-1">部件拼装设计时装</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-1 text-green-500 font-bold">社</div>
            <p className="font-medium text-gray-700">玩家社区</p>
            <p className="text-xs mt-1">分享穿搭交流心得</p>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-xs text-gray-400">
        DressUp · 2D 换装网页游戏
      </footer>
    </div>
  );
}
