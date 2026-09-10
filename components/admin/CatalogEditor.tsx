'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Car, CirclePlus, Loader2, ScanLine, Search, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type CatalogEntry = {
  id: string;
  name: string;
  series: string;
  year: number;
  toy_number: string;
  rarity: string;
  image_url?: string | null;
};

const RARITY_OPTIONS = [
  'Mainline',
  'Premium',
  'Silver Series',
  'Treasure Hunt',
  'Super Treasure Hunt',
  'RLC',
  'Convention Exclusive',
  'Other',
];

export default function CatalogEditor() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [series, setSeries] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [toyNumber, setToyNumber] = useState('');
  const [rarity, setRarity] = useState('Mainline');

  async function loadEntries() {
    setLoadingList(true);
    const { data, error } = await supabase
      .from('castings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) setErrorMsg(error.message);
    else setEntries(data as CatalogEntry[]);
    setLoadingList(false);
  }

  useEffect(() => {
    void loadEntries();
  }, []);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) =>
        `${entry.name} ${entry.series} ${entry.toy_number} ${entry.rarity}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [entries, search]
  );

  function resetForm() {
    setName('');
    setSeries('');
    setYear(String(new Date().getFullYear()));
    setToyNumber('');
    setRarity('Mainline');
  }

  async function addEntry() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setErrorMsg('');

    const { error } = await supabase.from('castings').insert({
      name: name.trim(),
      series: series.trim() || 'Uncategorized',
      year: Number(year) || new Date().getFullYear(),
      toy_number: toyNumber.trim() || '—',
      rarity,
    });

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    resetForm();
    void loadEntries();
  }

  async function deleteEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    const { error } = await supabase.from('castings').delete().eq('id', id);
    if (error) {
      setErrorMsg(error.message);
      void loadEntries();
    }
  }

  function triggerScan() {
    fileInputRef.current?.click();
  }

  async function handlePhotoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/identify-car', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Could not identify the car in that photo.');

      if (data.name) setName(data.name);
      if (data.series) setSeries(data.series);
      if (data.year) setYear(String(data.year));
      if (data.toy_number) setToyNumber(data.toy_number);
      if (data.rarity && RARITY_OPTIONS.includes(data.rarity)) setRarity(data.rarity);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'AI scan failed. Try again or enter details manually.');
    } finally {
      setScanning(false);
      event.target.value = '';
    }
  }

  return (
    <section className="mx-auto max-w-6xl animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Administrator Area</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">Catalog Manager</h1>
        <p className="mt-1 text-sm text-slate-500">Add and curate the shared casting catalog.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/20 transition-shadow hover:shadow-amber-500/5 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CirclePlus className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-slate-100">Add catalog casting</h2>
          </div>

          <button
            onClick={triggerScan}
            disabled={scanning}
            className="group inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-all hover:border-amber-500/60 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {scanning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyzing photo...
              </>
            ) : (
              <>
                <ScanLine className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                Scan car with camera
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelected}
            className="hidden"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input value={name} onChange={(event) => setName(event.target.value)} className="input-field transition-colors focus:border-amber-500/50" placeholder="Casting name" />
          <input value={series} onChange={(event) => setSeries(event.target.value)} className="input-field transition-colors focus:border-amber-500/50" placeholder="Series" />
          <input value={year} onChange={(event) => setYear(event.target.value)} className="input-field transition-colors focus:border-amber-500/50" inputMode="numeric" placeholder="Year" />
          <input value={toyNumber} onChange={(event) => setToyNumber(event.target.value)} className="input-field transition-colors focus:border-amber-500/50" placeholder="Toy number / SKU" />
          <select value={rarity} onChange={(event) => setRarity(event.target.value)} className="input-field transition-colors focus:border-amber-500/50">
            {RARITY_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        {errorMsg && <p className="mt-3 text-sm text-red-400">{errorMsg}</p>}

        <button
          onClick={addEntry}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:scale-[1.02] hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CirclePlus className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Add to catalog'}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-amber-400" />
            <h2 className="font-semibold text-slate-100">Catalog preview</h2>
          </div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 transition-colors focus-within:border-amber-500/50 sm:w-72">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600" placeholder="Search catalog" />
          </label>
        </div>

        <div className="divide-y divide-slate-800">
          {loadingList && (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading catalog...
            </div>
          )}

          {!loadingList &&
            filteredEntries.map((entry, index) => (
              <div
                key={entry.id}
                style={{ animationDelay: `${index * 40}ms` }}
                className="flex items-center justify-between gap-4 p-4 opacity-0 transition-colors animate-[fadeIn_0.3s_ease-out_forwards] hover:bg-slate-800/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-200">{entry.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{entry.series} · {entry.year} · {entry.toy_number} · {entry.rarity}</p>
                </div>
                <button onClick={() => deleteEntry(entry.id)} className="rounded-lg p-2 text-slate-500 transition hover:scale-110 hover:bg-red-950/30 hover:text-red-400" aria-label={`Delete ${entry.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

          {!loadingList && filteredEntries.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">No catalog entries match that search.</p>
          )}
        </div>
      </div>
    </section>
  );
}
