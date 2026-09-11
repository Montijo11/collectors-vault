"use client";

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get('redirect');
  const redirectTo = requestedRedirect?.startsWith('/')
    ? requestedRedirect
    : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:flex sm:items-center sm:justify-center">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/30">
          <div className="border-b border-slate-800 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.2),transparent_65%)] px-6 pb-7 pt-8 text-center sm:px-8">
            <img
              src="/collectors.vaults.logo.png"
              alt="Collector's Vaults"
              className="mx-auto h-16 w-16 rounded-2xl object-cover ring-1 ring-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.18)]"
            />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
              Welcome back
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-50">
              Enter your vault
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to continue building your collection.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 p-6 sm:p-8">
            {errorMsg && (
              <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
                {errorMsg}
              </p>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign in to your vault'}
            </button>
          </form>

          <div className="border-t border-slate-800 px-6 py-5 text-center sm:px-8">
            <p className="text-sm text-slate-500">
              New to Collector&apos;s Vaults?{' '}
              <Link href="/signup" className="font-semibold text-amber-400 transition hover:text-amber-300">
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
