'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Car, CirclePlus, Loader2, ScanLine, Search, Star, Trash2, Vault } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';

type GarageItem = {
  id: string;
  owner_id: string;
  casting_name: string;
  series: string | null;
  year: number | null;
  toy_number: string | null;
  condition: string | null;
  rarity: string | null;
  estimated_value: number | null;
  notes: string | null;
};

const RARITY_OPTIONS = ['Mainline', 'Premium', 'Silver Series', 'Treasure Hunt', 'Super Treasure Hunt', 'RLC', 'Convention Exclusive', 'Other'];
const CONDITION_OPTIONS = ['Mint', 'Loose', 'Creased', 'Bent Card', 'Opened'];

function rarityColor(rarity: string | null) {
  if (rarity === 'Super Treasure Hunt') return 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300';
  if (rarity === 'Premium') return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
  if (rarity === 'Silver Series') return 'border-slate-500/50 bg-slate-400/10 text-slate-300';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
}

export default function GarageHUD() {
  const supabase = createClient();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<GarageItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [series, setSeries] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [toyNumber, setToyNumber] = useState('');
  const [rarity, setRarity] = useState('Mainline');
  const [condition, setCondition] = useState('Mint');
  const [value, setValue] = useState('0');
  const [notes, setNotes] = useState('');

  async function loadEntries() {
    if (!session?.user?.id) return;
    setLoadingList(true);
    const { data, error } = await supabase
      .from('registry_items')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) setErrorMsg(error.message);
    else setItems(data as GarageItem[]);
    setLoadingList(false);
  }

  useEffect(() => {
    void loadEntries();
  }, [session?.user?.id]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        `${item.casting_name} ${item.series ?? ''} ${item.rarity ?? ''}`.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const totalValue = items.reduce((total, item) => total + (item.estimated_value ?? 0), 0);
  const rareCount = items.filter((item) => item.rarity && item.rarity !== 'Mainline').length;

  function resetForm() {
    setName('');
    setSeries('');
    setYear(String(new Date().getFullYear()));
    setToyNumber('');
    setRarity('Mainline');
    setCondition('Mint');
    setValue('0');
    setNotes('');
  }

  async function addItem() {
    if (!name.trim() || saving || !session?.user?.id) return;
    setSaving(true);
    setErrorMsg('');

    const { error } = await supabase.from('registry_items').insert({
      owner_id: session.user.id,
      casting_name: name.trim(),
      series: series.trim() || 'Uncategorized',
      year: Number(year) || new Date().getFullYear(),
      toy_number: toyNumber.trim() || null,
      rarity,
      condition,
      estimated_value: Number(value) || 0,
      notes: notes.trim() || null,
      is_private: false,
    });

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    resetForm();
    setShowAddForm(false);
    void loadEntries();
  }

  async function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    const { error } = await supabase.from('registry_items').delete().eq('id', id);
    if (error) {
      setErrorMsg(error.message);
      void loadEntries();
    }
  }

  function triggerScan() {
    fileInputRef.current?.click();
  }

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setErrorMsg('');
    setShowAddForm(true);

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
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Personal Collection</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">My Vault</h1>
          <p className="mt-1 text-sm text-slate-500">Track every casting, rarity, condition, and estimated value.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerScan}
            disabled={scanning}
            className="group inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-400 transition-all hover:border-amber-500/60 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4 transition-transform group-hover:scale-110" />
                Scan with camera
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelected}
            className="sr-only"
          />
          <button
            onClick={() => setShowAddForm((open) => !open)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:scale-[1.02] hover:bg-amber-400 active:scale-[0.98]"
          >
            <CirclePlus className="h-4 w-4" />
            Add to Vault
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Car className="h-5 w-5" />} label="Castings logged" value={items.length.toString()} accent="amber" />
        <StatCard icon={<Star className="h-5 w-5" />} label="Rare & premium" value={rareCount.toString()} accent="sky" />
        <StatCard icon={<Vault className="h-5 w-5" />} label="Estimated vault value" value={`$${totalValue.toFixed(2)}`} accent="emerald" />
      </div>

      {showAddForm && (
        <div className="mb-6 animate-[fadeIn_0.3s_ease-out] rounded-2xl border border-amber-500/25 bg-slate-900 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">Add a casting</h2>
          </div>

          {errorMsg && <p className="mb-3 text-sm text-red-400">{errorMsg}</p>}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" placeholder="Casting name" />
            <input value={series} onChange={(event) => setSeries(event.target.value)} className="input-field" placeholder="Series" />
            <input value={year} onChange={(event) => setYear(event.target.value)} className="input-field" inputMode="numeric" placeholder="Year" />
            <input value={toyNumber} onChange={(event) => setToyNumber(event.target.value)} className="input-field" placeholder="Toy number / SKU" />
            <select value={rarity} onChange={(event) => setRarity(event.target.value)} className="input-field">
              {RARITY_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select value={condition} onChange={(event) => setCondition(event.target.value)} className="input-field">
              {CONDITION_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <input value={value} onChange={(event) => setValue(event.target.value)} className="input-field" inputMode="decimal" placeholder="Estimated value" />
            <input value={notes} onChange={(event) => setNotes(event.target.value)} className="input-field sm:col-span-2 lg:col-span-2" placeholder="Notes (optional)" />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={addItem} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save casting'}
            </button>
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
          {loadingList && (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your vault...
            </div>
          )}

          {!loadingList && filteredItems.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 p-4 transition hover:bg-slate-800/35 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
                  <Car className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{item.casting_name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{item.series} · {item.year} · {item.condition}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${rarityColor(item.rarity)}`}>{item.rarity}</span>
                <span className="min-w-16 text-right text-sm font-semibold text-emerald-300">${(item.estimated_value ?? 0).toFixed(2)}</span>
                <button onClick={() => deleteItem(item.id)} className="rounded-lg p-2 text-slate-500 transition hover:scale-110 hover:bg-red-950/30 hover:text-red-400" aria-label={`Remove ${item.casting_name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
          {!loadingList && filteredItems.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No castings match that search.</p>}
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
