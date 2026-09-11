'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import {
  AlertTriangle,
  Calendar,
  Car,
  CirclePlus,
  Hash,
  ImageOff,
  ImagePlus,
  Layers,
  Loader2,
  Package,
  ScanLine,
  Search,
  Star,
  Tag,
  Trash2,
  Upload,
  Vault,
  X,
} from 'lucide-react';
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
  photo_url: string | null;
};

type ScanStatus = 'high_confidence' | 'possible_match' | 'needs_more_photos';

type ScanAlternative = {
  name: string;
  series: string;
  year: number | null;
  reason: string;
};

type ScanResult = {
  name: string;
  series: string;
  year: number | null;
  toy_number: string;
  rarity: string;
  confidence: number;
  status: ScanStatus;
  reason: string;
  photo_quality: {
    usable: boolean;
    issues: string[];
  };
  recommended_next_photo: string;
  alternatives: ScanAlternative[];
};

type PhotoMode = 'packaged' | 'loose';

type ContributePrompt = {
  releaseId: string;
  castingName: string;
  photo: File;
  photoMode: PhotoMode;
};

type DuplicateMatch = {
  id: string;
  casting_name: string;
  condition: string | null;
};

const RARITY = [
  'Mainline',
  'Premium',
  'Silver Series',
  'Treasure Hunt',
  'Super Treasure Hunt',
  'RLC',
  'Convention Exclusive',
  'Other',
];

const CONDITIONS = ['Mint', 'Loose', 'Creased', 'Bent Card', 'Opened'];

const CATALOG_BUCKET = 'catalog-photos';
const VAULT_BUCKET = 'vault-photos';

function rarityColor(rarity: string | null) {
  if (rarity === 'Super Treasure Hunt') {
    return 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300';
  }
  if (rarity === 'Premium') {
    return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
  }
  if (rarity === 'Silver Series') {
    return 'border-slate-500/50 bg-slate-400/10 text-slate-300';
  }
  return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
}

function confidenceStyle(status: ScanStatus) {
  if (status === 'high_confidence') {
    return {
      label: 'High confidence',
      className: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
    };
  }
  if (status === 'possible_match') {
    return {
      label: 'Possible match',
      className: 'border-amber-500/35 bg-amber-500/10 text-amber-300',
    };
  }
  return {
    label: 'Needs more photos',
    className: 'border-red-500/35 bg-red-500/10 text-red-300',
  };
}

export default function GarageHUD() {
  const supabase = createClient();
  const { session } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<GarageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GarageItem | null>(null);

  const [name, setName] = useState('');
  const [series, setSeries] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [toyNumber, setToyNumber] = useState('');
  const [rarity, setRarity] = useState('Mainline');
  const [condition, setCondition] = useState('Mint');
  const [value, setValue] = useState('0');
  const [notes, setNotes] = useState('');

  const [photoMode, setPhotoMode] = useState<PhotoMode>('packaged');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const [contributePrompt, setContributePrompt] = useState<ContributePrompt | null>(null);
  const [contributing, setContributing] = useState(false);

  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);

  async function loadItems() {
    if (!session?.user.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('registry_items')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setItems(data as GarageItem[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadItems();
  }, [session?.user.id]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [photoPreviews]);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.casting_name} ${item.series ?? ''} ${item.rarity ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [items, search],
  );

  const total = items.reduce((sum, item) => sum + (item.estimated_value ?? 0), 0);
  const rare = items.filter((item) => item.rarity && item.rarity !== 'Mainline').length;

  function resetForm() {
    setName('');
    setSeries('');
    setYear(String(new Date().getFullYear()));
    setToyNumber('');
    setRarity('Mainline');
    setCondition('Mint');
    setValue('0');
    setNotes('');
    setScanResult(null);
    setDuplicateMatches([]);
  }

  function clearPhotos() {
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setSelectedPhotos([]);
    setPhotoPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photoPreviews[index]);
    setSelectedPhotos((current) => current.filter((_, i) => i !== index));
    setPhotoPreviews((current) => current.filter((_, i) => i !== index));
  }

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const invalidFile = files.find(
      (file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024,
    );

    if (invalidFile) {
      setErrorMsg('Use image files that are 10 MB or smaller.');
      event.target.value = '';
      return;
    }

    const combined = [...selectedPhotos, ...files].slice(0, 3);
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setSelectedPhotos(combined);
    setPhotoPreviews(combined.map((file) => URL.createObjectURL(file)));
    setErrorMsg('');
    event.target.value = '';
  }

  function applyScanResult(result: ScanResult) {
    if (result.name) setName(result.name);
    if (result.series) setSeries(result.series);
    if (result.year) setYear(String(result.year));
    if (result.toy_number) setToyNumber(result.toy_number);
    if (result.rarity && RARITY.includes(result.rarity)) setRarity(result.rarity);
  }

  async function checkForDuplicates(castingName: string, toyNumber: string) {
    if (!session?.user.id || !castingName.trim()) {
      setDuplicateMatches([]);
      return;
    }

    const orFilters = [`casting_name.ilike.%${castingName.trim()}%`];
    if (toyNumber.trim()) orFilters.push(`toy_number.eq.${toyNumber.trim()}`);

    const { data, error } = await supabase
      .from('registry_items')
      .select('id, casting_name, condition')
      .eq('owner_id', session.user.id)
      .or(orFilters.join(','));

    if (error || !data) {
      setDuplicateMatches([]);
      return;
    }

    setDuplicateMatches(data as DuplicateMatch[]);
  }

  async function analyzePhotos() {
    if (!selectedPhotos.length) {
      setErrorMsg('Add at least one clear photo before analyzing.');
      return;
    }

    setScanning(true);
    setErrorMsg('');
    setScanResult(null);
    setDuplicateMatches([]);

    try {
      const formData = new FormData();
      selectedPhotos.forEach((photo) => formData.append('images', photo));
      formData.append('photo_mode', photoMode);

      const response = await fetch('/api/identify-car', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not identify the car from these photos.');
      }

      setScanResult(data as ScanResult);
      applyScanResult(data as ScanResult);
      setShowAddForm(true);

      if (data.name) {
        void checkForDuplicates(data.name, data.toy_number ?? '');
      }
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'AI scan failed. Try again or enter details manually.',
      );
    } finally {
      setScanning(false);
    }
  }

  async function checkForContributionOpportunity(castingName: string) {
    if (!selectedPhotos.length) return;

    const { data: castingMatch } = await supabase
      .from('catalog_castings')
      .select('id')
      .ilike('casting_name', castingName.trim())
      .maybeSingle();

    if (!castingMatch) return;

    const { data: releaseMatch } = await supabase
      .from('catalog_releases')
      .select('id')
      .eq('catalog_casting_id', castingMatch.id)
      .limit(1)
      .maybeSingle();

    if (!releaseMatch) return;

    const { count } = await supabase
      .from('catalog_images')
      .select('id', { count: 'exact', head: true })
      .eq('catalog_release_id', releaseMatch.id);

    if (count && count > 0) return;

    setContributePrompt({
      releaseId: releaseMatch.id,
      castingName: castingName.trim(),
      photo: selectedPhotos[0],
      photoMode,
    });
  }

  async function confirmContribution() {
    if (!contributePrompt || contributing) return;

    setContributing(true);
    setErrorMsg('');

    const { releaseId, photo, photoMode: mode } = contributePrompt;
    const safeName = photo.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${releaseId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(CATALOG_BUCKET)
      .upload(path, photo, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      setErrorMsg(uploadError.message);
      setContributing(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path);

    const contributorLabel = session?.user.email
      ? `Contributed by ${session.user.email}`
      : 'Contributed by a Vault collector';

    const { error: insertError } = await supabase.from('catalog_images').insert({
      catalog_release_id: releaseId,
      image_url: publicUrlData.publicUrl,
      image_type: mode === 'packaged' ? 'package_front' : 'loose_front',
      caption: contributorLabel,
      is_primary: true,
    });

    setContributing(false);

    if (insertError) {
      setErrorMsg(insertError.message);
      return;
    }

    setContributePrompt(null);
  }

  function dismissContribution() {
    setContributePrompt(null);
  }

  async function save() {
    if (!session?.user.id || !name.trim() || saving) return;

    setSaving(true);
    setErrorMsg('');

    let photoUrl: string | null = null;

    if (selectedPhotos.length) {
      const photo = selectedPhotos[0];
      const safeName = photo.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `${session.user.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(VAULT_BUCKET)
        .upload(path, photo, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setErrorMsg(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from(VAULT_BUCKET).getPublicUrl(path);
      photoUrl = publicUrlData.publicUrl;
    }

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
      photo_url: photoUrl,
      is_private: false,
    });

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const savedName = name.trim();
    void checkForContributionOpportunity(savedName);

    resetForm();
    clearPhotos();
    setShowAddForm(false);
    void loadItems();
  }

  async function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedItem(null);

    const { error } = await supabase.from('registry_items').delete().eq('id', id);

    if (error) {
      setErrorMsg(error.message);
      void loadItems();
    }
  }

  const scanStatus = scanResult ? confidenceStyle(scanResult.status) : null;

  return (
    <section className="mx-auto max-w-6xl">
      {contributePrompt && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 shrink-0 text-sky-300" />
            <p className="text-sm text-sky-100">
              No catalog photo yet for{' '}
              <span className="font-semibold">{contributePrompt.castingName}</span> — share
              yours publicly with other collectors?
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => void confirmContribution()}
              disabled={contributing}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {contributing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {contributing ? 'Sharing...' : 'Share photo'}
            </button>
            <button
              onClick={dismissContribution}
              disabled={contributing}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:border-sky-400"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Personal Collection
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            My Vault
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track every casting, rarity, condition, and estimated value.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            clearPhotos();
            setShowAddForm((open) => !open);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
        >
          <CirclePlus className="h-4 w-4" />
          Add to Vault
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat icon={<Car className="h-5 w-5" />} label="Castings logged" value={String(items.length)} accent="amber" />
        <Stat icon={<Star className="h-5 w-5" />} label="Rare & premium" value={String(rare)} accent="sky" />
        <Stat icon={<Vault className="h-5 w-5" />} label="Estimated vault value" value={`$${total.toFixed(2)}`} accent="emerald" />
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-amber-500/25 bg-slate-900/80">
        <div className="border-b border-slate-800 bg-[radial-gradient(circle_at_10%_0%,rgba(245,158,11,0.14),transparent_48%)] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-amber-400" />
                <h2 className="font-semibold text-slate-100">Identify a car with AI</h2>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Use clear photos. AI suggests a match, but you confirm before the casting
                enters your vault.
              </p>
            </div>
            <span className="w-fit rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
              Up to 3 photos
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPhotoMode('packaged')}
              className={`rounded-xl border p-4 text-left transition ${
                photoMode === 'packaged'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
              }`}
            >
              <p className="font-semibold text-slate-100">Carded / packaged</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Add the full card front, collector number, and optional package detail.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPhotoMode('loose')}
              className={`rounded-xl border p-4 text-left transition ${
                photoMode === 'loose'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-600'
              }`}
            >
              <p className="font-semibold text-slate-100">Loose car</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Add a three-quarter view, underside/base photo, and optional wheel or
                graphics close-up.
              </p>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <input
            ref={fileInputRef}
            id="vault-ai-photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={selectPhotos}
            className="sr-only"
          />

          <label
            htmlFor="vault-ai-photo-input"
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-5 py-8 text-center transition hover:border-amber-500/60 hover:bg-amber-500/5 ${
              scanning ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <ImagePlus className="h-7 w-7 text-amber-400" />
            <span className="mt-3 text-sm font-semibold text-slate-200">
              Add {photoMode === 'packaged' ? 'package' : 'car'} photos
            </span>
            <span className="mt-1 text-xs text-slate-500">
              One car only · bright lighting · plain background · max 10 MB each
            </span>
          </label>

          {photoPreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {photoPreviews.map((preview, index) => (
                <div key={preview} className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                  <img src={preview} alt={`Selected scan photo ${index + 1}`} className="aspect-square h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-2 top-2 rounded-lg bg-slate-950/90 p-1.5 text-slate-300 opacity-100 transition hover:bg-red-950 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void analyzePhotos()}
              disabled={scanning || selectedPhotos.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing photos...
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4" />
                  Analyze photos
                </>
              )}
            </button>

            {selectedPhotos.length > 0 && (
              <button
                type="button"
                onClick={clearPhotos}
                disabled={scanning}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
              >
                Clear photos
              </button>
            )}
          </div>

          {errorMsg && (
            <p className="mt-4 rounded-xl border border-red-900/50 bg-red-950/35 px-3 py-2.5 text-sm text-red-300">
              {errorMsg}
            </p>
          )}

          {scanResult && scanStatus && (
            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/80 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
                    AI identification result
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-100">
                    {scanResult.name || 'No confident casting match'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {[scanResult.series, scanResult.year].filter(Boolean).join(' · ') ||
                      'Review the result before saving'}
                  </p>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${scanStatus.className}`}>
                  {scanStatus.label} · {scanResult.confidence}%
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">{scanResult.reason}</p>

              {duplicateMatches.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Possible duplicate
                  </p>
                  <p className="mt-1 text-sm text-amber-100">
                    You already have {duplicateMatches.length} casting{duplicateMatches.length > 1 ? 's' : ''}{' '}
                    matching this in your vault
                    {duplicateMatches.some((match) => match.condition) && (
                      <>
                        {' '}
                        (
                        {duplicateMatches
                          .map((match) => match.condition)
                          .filter(Boolean)
                          .join(', ')}
                        )
                      </>
                    )}
                    . You can still save this as an additional copy.
                  </p>
                </div>
              )}

              {scanResult.photo_quality.issues.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">Photo review</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-400">
                    {scanResult.photo_quality.issues.map((issue) => (
                      <li key={issue}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Recommended next photo</p>
                <p className="mt-1 text-sm text-slate-300">{scanResult.recommended_next_photo}</p>
              </div>

              {scanResult.alternatives.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Other possible matches</p>
                  <div className="mt-2 grid gap-2">
                    {scanResult.alternatives.map((alternative, index) => (
                      <button
                        key={`${alternative.name}-${index}`}
                        type="button"
                        onClick={() => {
                          setName(alternative.name);
                          setSeries(alternative.series);
                          if (alternative.year) setYear(String(alternative.year));
                          void checkForDuplicates(alternative.name, '');
                        }}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-left transition hover:border-amber-500/50 hover:bg-amber-500/5"
                      >
                        <p className="text-sm font-semibold text-slate-200">{alternative.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {[alternative.series, alternative.year].filter(Boolean).join(' · ')}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{alternative.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-2xl border border-amber-500/25 bg-slate-900 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-100">Add a casting</h2>
              <p className="text-xs text-slate-500">
                Review AI suggestions and confirm the details before saving.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                void checkForDuplicates(e.target.value, toyNumber);
              }}
              className="input-field"
              placeholder="Casting name"
            />
            <input value={series} onChange={(e) => setSeries(e.target.value)} className="input-field" placeholder="Series" />
            <input value={year} onChange={(e) => setYear(e.target.value)} className="input-field" inputMode="numeric" placeholder="Year" />
            <input
              value={toyNumber}
              onChange={(e) => {
                setToyNumber(e.target.value);
                void checkForDuplicates(name, e.target.value);
              }}
              className="input-field"
              placeholder="Toy number / SKU"
            />
            <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="input-field">
              {RARITY.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input-field">
              {CONDITIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <input value={value} onChange={(e) => setValue(e.target.value)} className="input-field" inputMode="decimal" placeholder="Estimated value" />
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field sm:col-span-2" placeholder="Notes (optional)" />
          </div>

          {!scanResult && duplicateMatches.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Possible duplicate
              </p>
              <p className="mt-1 text-sm text-amber-100">
                You already have {duplicateMatches.length} casting{duplicateMatches.length > 1 ? 's' : ''} matching this name or toy number in your vault.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => void save()}
              disabled={saving || !name.trim()}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Confirm and save casting'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-100">Vault inventory</h2>
          <label className="flex w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 sm:w-72">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-100 outline-none"
              placeholder="Search your collection"
            />
          </label>
        </div>

        {loading && (
          <p className="p-8 text-center text-sm text-slate-500">Loading your vault...</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left transition hover:border-amber-500/40 hover:bg-slate-900"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.casting_name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageOff className="h-5 w-5 text-slate-700" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-200 group-hover:text-amber-300">
                    {item.casting_name}
                  </h3>
                  <p className="truncate text-xs text-slate-500">
                    {item.series} · {item.year}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${rarityColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                    <span className="text-xs font-semibold text-emerald-300">
                      ${(item.estimated_value ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">No castings match that search.</p>
        )}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/25 bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-3 top-3 z-10 rounded-lg bg-slate-950/80 p-1.5 text-slate-300 transition hover:bg-red-950 hover:text-red-300"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="aspect-video w-full bg-slate-950">
              {selectedItem.photo_url ? (
                <img src={selectedItem.photo_url} alt={selectedItem.casting_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-700">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-xs font-semibold text-slate-500">No photo attached</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedItem.casting_name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{selectedItem.series}</p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${rarityColor(selectedItem.rarity)}`}>
                  <Star className="h-3 w-3" />
                  {selectedItem.rarity}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <DetailRow icon={<Calendar className="h-4 w-4" />} label="Year" value={String(selectedItem.year ?? '—')} />
                <DetailRow icon={<Hash className="h-4 w-4" />} label="Toy number" value={selectedItem.toy_number ?? '—'} />
                <DetailRow icon={<Package className="h-4 w-4" />} label="Condition" value={selectedItem.condition ?? '—'} />
                <DetailRow icon={<Tag className="h-4 w-4" />} label="Est. value" value={`$${(selectedItem.estimated_value ?? 0).toFixed(2)}`} />
              </div>

              {selectedItem.notes && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    <Layers className="h-3.5 w-3.5" />
                    Notes
                  </p>
                  <p className="text-sm text-slate-300">{selectedItem.notes}</p>
                </div>
              )}

              <button
                onClick={() => void remove(selectedItem.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove from vault
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent: 'amber' | 'sky' | 'emerald' }) {
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

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}
