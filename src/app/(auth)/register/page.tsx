'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || '注册失败');
      return;
    }
    router.push('/login');  // 注册成功 → 跳转登录
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">注册</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2 mb-3" placeholder="用户名"
          value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        <input className="w-full border rounded px-3 py-2 mb-3" type="email" placeholder="邮箱"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full border rounded px-3 py-2 mb-4" type="password" placeholder="密码（至少6位）"
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button className="w-full bg-blue-600 text-white rounded py-2 font-medium" type="submit">
          注册
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          已有账号？<a href="/login" className="text-blue-600 ml-1">登录</a>
        </p>
      </form>
    </div>
  );
}
