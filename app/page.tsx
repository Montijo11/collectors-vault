import Link from 'next/link';
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  Users,
} from 'lucide-react';

const benefits = [
  {
    title: 'Build your digital vault',
    description:
      'Keep the cars you own, want, and are hunting for organized in one collector-first home.',
    icon: CarFront,
  },
  {
    title: 'Track every detail',
    description:
      'Create a reliable record of your collection so your next great find always has a place.',
    icon: ShieldCheck,
  },
  {
    title: 'Join the exchange',
    description:
      'Connect with fellow enthusiasts, share discoveries, and stay close to the collector community.',
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(245,158,11,0.16),transparent_26%),radial-gradient(circle_at_88%_4%,rgba(30,64,175,0.18),transparent_28%)]" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Collector's Vaults home">
          <img
            src="/collectors.vaults.logo.png"
            alt="Collector's Vaults"
            className="h-11 w-11 rounded-xl object-cover ring-1 ring-amber-500/40 shadow-[0_0_22px_rgba(245,158,11,0.2)]"
          />
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-100 sm:text-base">
              Collector&apos;s Vaults
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400">
              Premium Diecast Collecting
            </p>
          </div>
        </Link>

        <Link
          href="/login?redirect=/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-500/50 hover:bg-slate-900 hover:text-amber-300 sm:px-4"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
            Built for collectors
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
            Your diecast collection deserves a vault.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Collector&apos;s Vaults gives every car, casting, and rare find a place to belong. Organize what you own, follow what you want, and join a community that understands the hunt.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              Create Your Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login?redirect=/dashboard"
              className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:text-amber-300"
            >
              Already a member? Sign in
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
            Create an account to start building your collection.
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-8 rounded-[3rem] bg-amber-500/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-500/30 bg-slate-900/70 p-3 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <img
              src="/collectors.vaults.logo.png"
              alt="Collector's Vaults vault and sports car emblem"
              className="aspect-square w-full rounded-[1.45rem] object-cover"
            />
            <div className="absolute inset-x-7 bottom-7 rounded-2xl border border-slate-700/80 bg-slate-950/85 px-5 py-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                The collector&apos;s command center
              </p>
              <p className="mt-1 text-sm font-medium text-slate-100">
                Catalog. Discover. Connect.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-slate-800/90 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-5 py-18 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Why join Collector&apos;s Vaults
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
              Collect with more purpose.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              Whether you are organizing your first shelf or documenting years of rare finds, your account gives you one place to build a collection you can be proud of.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 transition hover:-translate-y-1 hover:border-amber-500/35"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                    <Icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-100">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <div className="mx-auto max-w-3xl rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-slate-900 px-6 py-12 sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Start your vault
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
            Every great collection starts with one account.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
            Create your Collector&apos;s Vaults account to begin tracking the cars that matter to you.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
          >
            Create Your Free Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
