'use client';

import { useState, type ReactNode } from 'react';
import { Car, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AuthGate({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
      </div>
    );
  }

  return session ? <>{children}</> : <AuthForms />;
}

function AuthForms() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  async function handleSubmit() {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required.');
      return;
    }
    if (mode === 'signup' && !username.trim()) {
      setErrorMessage('Choose a username.');
      return;
    }

    setIsSubmitting(true);
    const error = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password, username.trim());
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
      return;
    }
    if (mode === 'signup') setSignupSuccess(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="rounded-2xl bg-amber-500/10 p-3">
            <Car className="h-7 w-7 text-amber-400" />
          </div>
          <h1 className="text-lg font-bold text-slate-100">Collector&apos;s Vault</h1>
          <p className="text-xs text-slate-500">Catalog. Identify. Complete.</p>
        </div>

        {signupSuccess ? (
          <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4 text-center">
            <p className="text-sm text-emerald-300">
              Account created. Check your email to confirm, then sign in.
            </p>
            <button
              onClick={() => {
                setSignupSuccess(false);
                setMode('login');
              }}
              className="mt-3 text-xs font-medium text-amber-400 hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex rounded-xl border border-slate-800 p-1">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${mode === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${mode === 'signup' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-3">
              {errorMessage && (
                <p className="rounded-lg bg-red-950/40 px-3 py-2 text-xs text-red-300">
                  {errorMessage}
                </p>
              )}
              {mode === 'signup' && (
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Username"
                  className="input-field"
                />
              )}
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                type="email"
                className="input-field"
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                className="input-field"
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === 'login' ? (
                  <LogIn className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
