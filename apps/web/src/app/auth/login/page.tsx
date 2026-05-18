'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      // Redirect to '/' - middleware will detect logged-in state and redirect to dashboard
      setTimeout(() => {
        router.push('/');
      }, 100);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EFF5]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#A8BEBD]/30 p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-[#062423]">Sign in</h1>
        <p className="text-[#547475] text-center text-sm mb-6">B2B Trade Platform</p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#062423] mb-1" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#547475]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#062423] mb-1" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#547475]"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full rounded-md bg-[#062423] px-4 py-2 text-sm font-semibold text-white hover:bg-[#547475] disabled:opacity-60 transition"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#547475]">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-[#547475] hover:text-[#062423] hover:underline font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
