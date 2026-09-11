'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function SignupPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Username, email, and password are required.');
      return;
    }

    setIsSubmitting(true);
    const error = await signUp(email.trim(), password, username.trim());
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    setSignupSuccess(true);
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

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-7 flex flex-col items-center text-center">
            <img
              src="/collectors.vaults.logo.png"
              alt="Collector's Vaults"
              className="h-16 w-16 rounded-2xl object-cover ring-1 ring-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.18)]"
            />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
              Start your vault
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-50">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your collection starts here.
            </p>
          </div>

          {signupSuccess ? (
            <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-5 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
              <h2 className="mt-3 text-base font-bold text-emerald-200">Account created</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-300">
                Check your email to confirm your account, then sign in to enter your vault.
              </p>
              <Link
                href="/login?redirect=/dashboard"
                className="mt-5 inline-flex rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              <div>
                <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Username
                </label>
                <input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Choose a collector name"
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {!signupSuccess && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Already a member?{' '}
              <Link
                href="/login?redirect=/dashboard"
                className="font-semibold text-amber-400 transition hover:text-amber-300"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
