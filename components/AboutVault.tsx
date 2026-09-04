import { BookOpen, Car, CheckCircle2, LockKeyhole, MessageCircle, Trophy, UserRoundPlus } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create your collector profile',
    description: 'Choose a recognizable collector name and use it to participate in the community.',
    icon: <UserRoundPlus className="h-5 w-5" />,
  },
  {
    number: '02',
    title: 'Log every casting',
    description: 'Record series, year, rarity, condition, and an estimated value for each item in your vault.',
    icon: <Car className="h-5 w-5" />,
  },
  {
    number: '03',
    title: 'Connect with collectors',
    description: 'Share hunting reports, trade duplicates, and compare variation discoveries in the Collector Exchange.',
    icon: <MessageCircle className="h-5 w-5" />,
  },
];

export default function AboutVault() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/35 p-6 sm:p-10">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <Trophy className="h-3.5 w-3.5" />
            Built for dedicated diecast collectors
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-5xl">
            Your collection deserves a proper vault.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Collector&apos;s Vault is a focused home for cataloging diecast cars, recognizing rare pieces, tracking collection value, and meeting people who understand the hunt.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <article key={step.number} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">{step.icon}</div>
              <span className="text-xs font-bold tracking-widest text-slate-600">{step.number}</span>
            </div>
            <h2 className="font-semibold text-slate-100">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold text-slate-100">What belongs in a vault entry?</h2>
          </div>
          <div className="space-y-3">
            <Feature text="Casting name, series, and release year" />
            <Feature text="Rarity tier, such as Mainline, Premium, Treasure Hunt, or RLC" />
            <Feature text="Card and vehicle condition" />
            <Feature text="Estimated value and private collector notes" />
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold text-slate-100">Privacy by default</h2>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Your personal vault is meant to be your record. When the database is connected, each collector will only be able to read and manage their own private inventory.
          </p>
        </article>
      </div>
    </section>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-slate-400">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
      <span>{text}</span>
    </div>
  );
}
