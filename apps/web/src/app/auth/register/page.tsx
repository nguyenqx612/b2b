'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fd.get('email'),
        password: fd.get('password'),
        role: fd.get('role'),
        companyName: fd.get('companyName'),
        companyAddress: fd.get('companyAddress'),
        taxId: fd.get('taxId'),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    });

    setLoading(false);
    // Redirect to '/' - middleware will handle role-based redirection
    setTimeout(() => {
      router.push('/');
    }, 100);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EFF5] py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-[#A8BEBD]/30 p-8">
        <h1 className="text-2xl font-bold text-center mb-2 text-[#062423]">Create account</h1>
        <p className="text-[#547475] text-center text-sm mb-6">B2B Trade Platform</p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#062423] mb-1">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {(['buyer', 'seller'] as const).map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-2 border rounded-md px-4 py-3 cursor-pointer hover:border-[#547475] has-[:checked]:border-[#062423] has-[:checked]:bg-[#A8BEBD]/15"
                  >
                    <input type="radio" name="role" value={role} defaultChecked={role === 'buyer'} className="accent-[#547475]" />
                    <span className="capitalize font-medium text-sm">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#062423] mb-1" htmlFor="email">Email *</label>
              <input
                id="email" name="email" type="email" required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#547475]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#062423] mb-1" htmlFor="password">Password * <span className="text-[#547475] font-normal">(min. 8 characters)</span></label>
              <input
                id="password" name="password" type="password" required minLength={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#547475]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#062423] mb-1" htmlFor="companyName">Company name *</label>
              <input
                id="companyName" name="companyName" type="text" required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#547475]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#062423] mb-1" htmlFor="taxId">Tax ID / EIN</label>
              <input
                id="taxId" name="taxId" type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#547475]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#062423] mb-1" htmlFor="companyAddress">Company address</label>
              <input
                id="companyAddress" name="companyAddress" type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#547475]"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full rounded-md bg-[#062423] px-4 py-2 text-sm font-semibold text-white hover:bg-[#547475] disabled:opacity-60 transition"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#547475]">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#547475] hover:text-[#062423] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
