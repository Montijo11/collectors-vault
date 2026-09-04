'use client';

import { useMemo, useState } from 'react';
import { Car, CirclePlus, Search, Star, Vault } from 'lucide-react';

type GarageItem = {
  id: number;
  name: string;
  series: string;
  year: number;
  rarity: string;
  condition: string;
  value: number;
};

const starterItems: GarageItem[] = [
  {
    id: 1,
    name: 'Custom ’68 Camaro',
    series: 'Mainline',
    year: 2024,
    rarity: 'Mainline',
    condition: 'Mint',
    value: 2.49,
  },
  {
    id: 2,
    name: 'Nissan Skyline GT-R (R34)',
    series: 'Premium Boulevard',
    year: 2023,
    rarity: 'Premium',
    condition: 'Mint',
    value: 11.99,
  },
  {
    id: 3,
    name: '’55 Chevy Bel Air Gasser',
    series: 'Super Treasure Hunt',
    year: 2022,
    rarity: 'Super Treasure Hunt',
    condition: 'Mint',
    value: 85.0,
  },
  {
    id: 4,
    name: 'Porsche 911 Carrera RS 2.7',
    series: 'Silver Series',
    year: 2024,
    rarity: 'Silver Series',
    condition: 'Mint',
    value: 6.49,
  },
];

function rarityColor(rarity: string) {
  if (rarity === 'Super Treasure Hunt') return 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300';
  if (rarity === 'Premium') return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
  if (rarity === 'Silver Series') return 'border-slate-500/50 bg-slate-400/10 text-slate-300';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
}

export default function GarageHUD() {
  const [items, setItems] = useState(starterItems);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [series, setSeries] = useState('Mainline');
  const [year, setYear] = useState('2026');
  const [rarity, setRarity] = useState('Mainline');
  const [condition, setCondition] = useState('Mint');
  const [value, setValue] = useState('0');

  const filteredItems = useMemo(
    () => items.filter((item) => `${item.name} ${item.series} ${item.rarity}`.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const totalValue = items.reduce((total, item) => total + item.value, 0);
  const rareCount = items.filter((item) => item.rarity !== 'Mainline').length;

  function addItem() {
    if (!name.trim()) return;
    setItems((current) => [
      {
        id: Date.now(),
        name: name.trim(),
        series: series.trim() || 'Uncategorized',
        year: Number(year) || new Date().getFullYear(),
        rarity,
        condition,
        value: Number(value) || 0,
      },
      ...current,
    ]);
    setName('');
    setSeries('Mainline');
    setYear('2026');
    setRarity('Mainline');
    setCondition('Mint');
    setValue('0');
    setShowAddForm(false);
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Personal Collection</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">My Vault</h1>
          <p className="mt-1 text-sm text-slate-500">Track every casting, rarity, condition, and estimated value.</p>
        </div>
        <button
          onClick={() => setShowAddForm((open) => !open)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
        >
          <CirclePlus className="h-4 w-4" />
          Add to Vault
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Car className="h-5 w-5" />} label="Castings logged" value={items.length.toString()} accent="amber" />
        <StatCard icon={<Star className="h-5 w-5" />} label="Rare & premium" value={rareCount.toString()} accent="sky" />
        <StatCard icon={<Vault className="h-5 w-5" />} label="Estimated vault value" value={`$${totalValue.toFixed(2)}`} accent="emerald" />
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-2xl border border-amber-500/25 bg-slate-900 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">Add a casting</h2>
            <span className="text-xs text-slate-500">Stored locally until Supabase is connected</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" placeholder="Casting name" />
            <input value={series} onChange={(event) => setSeries(event.target.value)} className="input-field" placeholder="Series" />
            <input value={year} onChange={(event) => setYear(event.target.value)} className="input-field" inputMode="numeric" placeholder="Year" />
            <select value={rarity} onChange={(event) => setRarity(event.target.value)} className="input-field">
              <option>Mainline</option>
              <option>Premium</option>
              <option>Silver Series</option>
              <option>Treasure Hunt</option>
              <option>Super Treasure Hunt</option>
              <option>RLC</option>
              <option>Convention Exclusive</option>
            </select>
            <select value={condition} onChange={(event) => setCondition(event.target.value)} className="input-field">
              <option>Mint</option>
              <option>Loose</option>
              <option>Creased</option>
              <option>Bent Card</option>
              <option>Opened</option>
            </select>
            <input value={value} onChange={(event) => setValue(event.target.value)} className="input-field" inputMode="decimal" placeholder="Estimated value" />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={addItem} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400">Save casting</button>
            <button onClick={() => setShowAddForm(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-100">Vault inventory</h2>
          <label className="flex w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 sm:w-72">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600" placeholder="Search your collection" />
          </label>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredItems.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 p-4 transition hover:bg-slate-800/35 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
                  <Car className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{item.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{item.series} · {item.year} · {item.condition}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${rarityColor(item.rarity)}`}>{item.rarity}</span>
                <span className="min-w-16 text-right text-sm font-semibold text-emerald-300">${item.value.toFixed(2)}</span>
              </div>
            </article>
          ))}
          {filteredItems.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No castings match that search.</p>}
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: 'amber' | 'sky' | 'emerald' }) {
  const colors = {
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    sky: 'border-sky-500/20 bg-sky-500/5 text-sky-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className={`mb-3 inline-flex rounded-lg border p-2 ${colors[accent]}`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
