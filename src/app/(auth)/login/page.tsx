'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) setError('邮箱或密码错误');
    else router.push('/home');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2 mb-3" type="email" placeholder="邮箱"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2 mb-4" type="password" placeholder="密码"
          value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white rounded py-2 font-medium" type="submit">
          登录
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          还没有账号？<a href="/register" className="text-blue-600 ml-1">注册</a>
        </p>
      </form>
    </div>
  );
}
