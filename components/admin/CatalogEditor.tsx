'use client';

import { useMemo, useState } from 'react';
import { Car, CirclePlus, Search, Trash2 } from 'lucide-react';

type CatalogEntry = {
  id: number;
  name: string;
  series: string;
  year: number;
  toyNumber: string;
  rarity: string;
};

const initialCatalog: CatalogEntry[] = [
  { id: 1, name: 'Custom ’68 Camaro', series: 'HW Modified', year: 2024, toyNumber: '023/250', rarity: 'Mainline' },
  { id: 2, name: 'Nissan Skyline GT-R (R34)', series: 'Boulevard', year: 2023, toyNumber: 'HRT72', rarity: 'Premium' },
  { id: 3, name: '’55 Chevy Bel Air Gasser', series: 'HW Gassers', year: 2022, toyNumber: 'DGX41', rarity: 'Super Treasure Hunt' },
];

export default function CatalogEditor() {
  const [entries, setEntries] = useState(initialCatalog);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [series, setSeries] = useState('');
  const [year, setYear] = useState('2026');
  const [toyNumber, setToyNumber] = useState('');
  const [rarity, setRarity] = useState('Mainline');

  const filteredEntries = useMemo(
    () => entries.filter((entry) => `${entry.name} ${entry.series} ${entry.toyNumber} ${entry.rarity}`.toLowerCase().includes(search.toLowerCase())),
    [entries, search]
  );

  function addEntry() {
    if (!name.trim()) return;
    setEntries((current) => [
      {
        id: Date.now(),
        name: name.trim(),
        series: series.trim() || 'Uncategorized',
        year: Number(year) || new Date().getFullYear(),
        toyNumber: toyNumber.trim() || '—',
        rarity,
      },
      ...current,
    ]);
    setName('');
    setSeries('');
    setYear('2026');
    setToyNumber('');
    setRarity('Mainline');
  }

  function deleteEntry(id: number) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Administrator Area</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">Catalog Manager</h1>
        <p className="mt-1 text-sm text-slate-500">Add and curate the shared casting catalog.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <CirclePlus className="h-4 w-4 text-amber-400" />
          <h2 className="font-semibold text-slate-100">Add catalog casting</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" placeholder="Casting name" />
          <input value={series} onChange={(event) => setSeries(event.target.value)} className="input-field" placeholder="Series" />
          <input value={year} onChange={(event) => setYear(event.target.value)} className="input-field" inputMode="numeric" placeholder="Year" />
          <input value={toyNumber} onChange={(event) => setToyNumber(event.target.value)} className="input-field" placeholder="Toy number / SKU" />
          <select value={rarity} onChange={(event) => setRarity(event.target.value)} className="input-field">
            <option>Mainline</option>
            <option>Premium</option>
            <option>Silver Series</option>
            <option>Treasure Hunt</option>
            <option>Super Treasure Hunt</option>
            <option>RLC</option>
            <option>Convention Exclusive</option>
            <option>Other</option>
          </select>
        </div>
        <button onClick={addEntry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"><CirclePlus className="h-4 w-4" />Add to catalog</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><Car className="h-4 w-4 text-amber-400" /><h2 className="font-semibold text-slate-100">Catalog preview</h2></div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 sm:w-72"><Search className="h-4 w-4 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600" placeholder="Search catalog" /></label>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{entry.name}</p><p className="mt-1 text-xs text-slate-500">{entry.series} · {entry.year} · {entry.toyNumber} · {entry.rarity}</p></div>
              <button onClick={() => deleteEntry(entry.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-950/30 hover:text-red-400" aria-label={`Delete ${entry.name}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {filteredEntries.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No catalog entries match that search.</p>}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-600">Catalog changes are local previews until this component is wired to the Supabase `castings` table.</p>
    </section>
  );
}
