'use client';

import { Activity, BadgeCheck, Database, ShieldCheck, Users } from 'lucide-react';

const activity = [
  { title: 'New collector account created', detail: 'A new profile joined the vault', time: 'Today' },
  { title: 'Catalog entries pending review', detail: 'Check submissions before they appear publicly', time: 'Today' },
  { title: 'Community moderation queue', detail: 'No flagged posts currently need review', time: 'Today' },
];

export default function AdminCommandHUD() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Administrator Area</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">Vault Command</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor collector activity, catalog health, and moderation tasks.</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Users className="h-5 w-5" />} value="—" label="Registered collectors" color="sky" />
        <Metric icon={<Database className="h-5 w-5" />} value="—" label="Catalog castings" color="amber" />
        <Metric icon={<BadgeCheck className="h-5 w-5" />} value="—" label="Verified submissions" color="emerald" />
        <Metric icon={<ShieldCheck className="h-5 w-5" />} value="—" label="Open moderation items" color="fuchsia" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2 border-b border-slate-800 p-4">
            <Activity className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-slate-100">Command activity</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {activity.map((entry) => (
              <div key={entry.title} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{entry.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{entry.detail}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-slate-600">{entry.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <ShieldCheck className="mb-3 h-6 w-6 text-amber-400" />
          <h2 className="font-semibold text-slate-100">Admin access confirmed</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">This screen only appears for profiles whose Supabase `role` is set to `admin`.</p>
          <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950/50 p-3 text-xs leading-5 text-slate-500">The dashes above are intentional until database queries are added. This prevents fake analytics from being presented as real data.</p>
        </aside>
      </div>
    </section>
  );
}

function Metric({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: 'sky' | 'amber' | 'emerald' | 'fuchsia' }) {
  const colorClasses = {
    sky: 'bg-sky-500/10 text-sky-400',
    amber: 'bg-amber-500/10 text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-400',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${colorClasses[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
