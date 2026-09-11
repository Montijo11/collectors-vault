'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Car,
  CirclePlus,
  ImageOff,
  ImagePlus,
  Loader2,
  ScanLine,
  Search,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type CatalogYear = { id: string; year: number; display_name: string };
type CatalogSeries = { id: string; catalog_year_id: string; name: string; slug: string };
type CatalogImage = { id: string; catalog_release_id: string; image_url: string; image_type: string; caption: string | null; is_primary: boolean };
type CatalogRelease = {
  id: string;
  collector_number: string | null;
  toy_number: string | null;
  theme_series: string | null;
  theme_series_number: string | null;
  release_variant: string | null;
  rarity: string;
  retailer_exclusive: string | null;
  release_status: string;
  source_notes: string | null;
  catalog_casting_id: string;
  catalog_castings: { casting_name: string } | null;
};

const RARITY_OPTIONS = ['Mainline', 'Premium', 'Silver Series', 'Treasure Hunt', 'Super Treasure Hunt', 'RLC', 'Convention Exclusive', 'Other'];
const STATUS_OPTIONS = ['confirmed', 'needs_review', 'draft'];
const IMAGE_TYPES = ['package_front', 'package_back', 'loose_front', 'loose_side', 'loose_rear', 'base', 'detail'];
const CATALOG_BUCKET = 'catalog-photos';

function statusColor(status: string) {
  if (status === 'confirmed') return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300';
  if (status === 'needs_review') return 'border-amber-500/35 bg-amber-500/10 text-amber-300';
  return 'border-slate-600/50 bg-slate-500/10 text-slate-300';
}

export default function CatalogEditor() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadInputRef = useRef<HTMLInputElement>(null);

  const [years, setYears] = useState<CatalogYear[]>([]);
  const [seriesList, setSeriesList] = useState<CatalogSeries[]>([]);
  const [releases, setReleases] = useState<CatalogRelease[]>([]);
  const [images, setImages] = useState<Record<string, CatalogImage[]>>({});
  const [releasesWithPhotos, setReleasesWithPhotos] = useState<Set<string>>(new Set());

  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedSeriesId, setSelectedSeriesId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [missingPhotosOnly, setMissingPhotosOnly] = useState(false);
  const [search, setSearch] = useState('');

  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [castingName, setCastingName] = useState('');
  const [collectorNumber, setCollectorNumber] = useState('');
  const [toyNumber, setToyNumber] = useState('');
  const [themeSeries, setThemeSeries] = useState('');
  const [themeSeriesNumber, setThemeSeriesNumber] = useState('');
  const [releaseVariant, setReleaseVariant] = useState('1st Color');
  const [rarity, setRarity] = useState('Mainline');
  const [retailerExclusive, setRetailerExclusive] = useState('');
  const [releaseStatus, setReleaseStatus] = useState('needs_review');
  const [sourceNotes, setSourceNotes] = useState('');
  const [formSeriesId, setFormSeriesId] = useState('');

  const [imagePanelReleaseId, setImagePanelReleaseId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageType, setImageType] = useState('package_front');
  const [imageCaption, setImageCaption] = useState('');
  const [imageIsPrimary, setImageIsPrimary] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function loadYears() {
    const { data, error } = await supabase.from('catalog_years').select('id, year, display_name').order('year', { ascending: false });
    if (error) { setErrorMsg(error.message); return; }
    const list = (data ?? []) as CatalogYear[];
    setYears(list);
    if (list.length && !selectedYearId) setSelectedYearId(list[0].id);
  }

  async function loadSeries(yearId: string) {
    if (!yearId) { setSeriesList([]); return; }
    const { data, error } = await supabase.from('catalog_series').select('id, catalog_year_id, name, slug').eq('catalog_year_id', yearId).order('name');
    if (error) { setErrorMsg(error.message); return; }
    const list = (data ?? []) as CatalogSeries[];
    setSeriesList(list);
    const mainline = list.find((item) => item.slug.endsWith('mainline'));
    setFormSeriesId(mainline?.id ?? list[0]?.id ?? '');
  }

  async function loadPhotoCoverage(releaseIds: string[]) {
    if (!releaseIds.length) { setReleasesWithPhotos(new Set()); return; }
    const { data, error } = await supabase
      .from('catalog_images')
      .select('catalog_release_id')
      .in('catalog_release_id', releaseIds);
    if (error) { setErrorMsg(error.message); return; }
    setReleasesWithPhotos(new Set((data ?? []).map((row) => row.catalog_release_id as string)));
  }

  async function loadReleases(yearId: string) {
    if (!yearId) { setReleases([]); setLoadingList(false); return; }
    setLoadingList(true);
    const { data, error } = await supabase
      .from('catalog_releases')
      .select('id, collector_number, toy_number, theme_series, theme_series_number, release_variant, rarity, retailer_exclusive, release_status, source_notes, catalog_casting_id, catalog_castings(casting_name)')
      .eq('catalog_year_id', yearId)
      .order('collector_number', { ascending: true });
    if (error) { setErrorMsg(error.message); setLoadingList(false); return; }
    const list = (data ?? []) as unknown as CatalogRelease[];
    setReleases(list);
    setLoadingList(false);
    void loadPhotoCoverage(list.map((item) => item.id));
  }

  async function loadImages(releaseId: string) {
    const { data, error } = await supabase.from('catalog_images').select('*').eq('catalog_release_id', releaseId).order('is_primary', { ascending: false });
    if (error) { setErrorMsg(error.message); return; }
    setImages((current) => ({ ...current, [releaseId]: (data ?? []) as CatalogImage[] }));
  }

  useEffect(() => { void loadYears(); }, []);
  useEffect(() => { if (selectedYearId) { void loadSeries(selectedYearId); void loadReleases(selectedYearId); } }, [selectedYearId]);

  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      if (selectedSeriesId !== 'all') {
        // Reserved for future series-level filtering.
      }
      if (statusFilter !== 'all' && release.release_status !== statusFilter) return false;
      if (missingPhotosOnly && releasesWithPhotos.has(release.id)) return false;
      const haystack = `${release.catalog_castings?.casting_name ?? ''} ${release.collector_number ?? ''} ${release.toy_number ?? ''} ${release.theme_series ?? ''} ${release.rarity}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [releases, statusFilter, search, selectedSeriesId, missingPhotosOnly, releasesWithPhotos]);

  const missingPhotoCount = useMemo(
    () => releases.filter((release) => !releasesWithPhotos.has(release.id)).length,
    [releases, releasesWithPhotos],
  );

  function resetForm() {
    setCastingName(''); setCollectorNumber(''); setToyNumber(''); setThemeSeries('');
    setThemeSeriesNumber(''); setReleaseVariant('1st Color'); setRarity('Mainline');
    setRetailerExclusive(''); setReleaseStatus('needs_review'); setSourceNotes('');
  }

  async function addRelease() {
    if (!castingName.trim() || !selectedYearId || saving) return;
    setSaving(true); setErrorMsg('');

    const trimmedName = castingName.trim();
    let castingId: string | null = null;

    const { data: existingCasting } = await supabase
      .from('catalog_castings')
      .select('id')
      .ilike('casting_name', trimmedName)
      .maybeSingle();

    if (existingCasting) {
      castingId = existingCasting.id;
    } else {
      const { data: newCasting, error: castingError } = await supabase
        .from('catalog_castings')
        .insert({ brand: 'Hot Wheels', casting_name: trimmedName, vehicle_type: 'Car' })
        .select('id')
        .single();
      if (castingError) { setErrorMsg(castingError.message); setSaving(false); return; }
      castingId = newCasting.id;
    }

    const { error } = await supabase.from('catalog_releases').insert({
      catalog_year_id: selectedYearId,
      catalog_series_id: formSeriesId || null,
      catalog_casting_id: castingId,
      collector_number: collectorNumber.trim() || null,
      toy_number: toyNumber.trim() || null,
      theme_series: themeSeries.trim() || null,
      theme_series_number: themeSeriesNumber.trim() || null,
      release_variant: releaseVariant.trim() || '1st Color',
      rarity,
      retailer_exclusive: retailerExclusive.trim() || null,
      release_status: releaseStatus,
      source_notes: sourceNotes.trim() || null,
    });

    setSaving(false);
    if (error) { setErrorMsg(error.message); return; }
    resetForm();
    void loadReleases(selectedYearId);
  }

  async function updateStatus(releaseId: string, status: string) {
    setReleases((current) => current.map((item) => (item.id === releaseId ? { ...item, release_status: status } : item)));
    const { error } = await supabase.from('catalog_releases').update({ release_status: status }).eq('id', releaseId);
    if (error) { setErrorMsg(error.message); void loadReleases(selectedYearId); }
  }

  async function deleteRelease(releaseId: string) {
    setReleases((current) => current.filter((item) => item.id !== releaseId));
    const { error } = await supabase.from('catalog_releases').delete().eq('id', releaseId);
    if (error) { setErrorMsg(error.message); void loadReleases(selectedYearId); }
  }

  function openImagePanel(releaseId: string) {
    setImagePanelReleaseId((current) => (current === releaseId ? null : releaseId));
    setImageUrl(''); setImageCaption(''); setImageType('package_front'); setImageIsPrimary(false);
    if (!images[releaseId]) void loadImages(releaseId);
  }

  async function insertImageRecord(releaseId: string, url: string) {
    if (imageIsPrimary) {
      await supabase.from('catalog_images').update({ is_primary: false }).eq('catalog_release_id', releaseId);
    }

    const { error } = await supabase.from('catalog_images').insert({
      catalog_release_id: releaseId,
      image_url: url,
      image_type: imageType,
      caption: imageCaption.trim() || null,
      is_primary: imageIsPrimary,
    });

    if (error) { setErrorMsg(error.message); return; }
    setImageUrl(''); setImageCaption(''); setImageIsPrimary(false);
    setReleasesWithPhotos((current) => new Set(current).add(releaseId));
    void loadImages(releaseId);
  }

  async function addImageByUrl(releaseId: string) {
    if (!imageUrl.trim() || savingImage) return;
    setSavingImage(true); setErrorMsg('');
    await insertImageRecord(releaseId, imageUrl.trim());
    setSavingImage(false);
  }

  async function uploadImageFile(releaseId: string, file: File) {
    if (uploadingImage) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Only image files can be uploaded.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Images must be 10 MB or smaller.');
      return;
    }

    setUploadingImage(true); setErrorMsg('');

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${releaseId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(CATALOG_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      setErrorMsg(uploadError.message);
      setUploadingImage(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path);

    await insertImageRecord(releaseId, publicUrlData.publicUrl);
    setUploadingImage(false);

    if (imageUploadInputRef.current) imageUploadInputRef.current.value = '';
  }

  async function deleteImage(releaseId: string, imageId: string) {
    setImages((current) => ({ ...current, [releaseId]: (current[releaseId] ?? []).filter((img) => img.id !== imageId) }));
    const { error } = await supabase.from('catalog_images').delete().eq('id', imageId);
    if (error) { setErrorMsg(error.message); void loadImages(releaseId); return; }

    const { count } = await supabase
      .from('catalog_images')
      .select('id', { count: 'exact', head: true })
      .eq('catalog_release_id', releaseId);

    if (!count) {
      setReleasesWithPhotos((current) => {
        const next = new Set(current);
        next.delete(releaseId);
        return next;
      });
    }
  }

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setScanning(true); setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/identify-car', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not identify the car in that photo.');
      if (data.name) setCastingName(data.name);
      if (data.series) setThemeSeries(data.series);
      if (data.toy_number) setToyNumber(data.toy_number);
      if (data.rarity && RARITY_OPTIONS.includes(data.rarity)) setRarity(data.rarity);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'AI scan failed. Try again or enter details manually.');
    } finally {
      setScanning(false); event.target.value = '';
    }
  }

  return (
    <section className="mx-auto max-w-6xl animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Administrator Area</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">Catalog Manager</h1>
          <p className="mt-1 text-sm text-slate-500">Curate the master catalog: castings, releases, and reference images.</p>
        </div>
        <select value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)} className="input-field w-fit">
          {years.map((year) => <option key={year.id} value={year.id}>{year.display_name}</option>)}
        </select>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/20 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><CirclePlus className="h-4 w-4 text-amber-400" /><h2 className="font-semibold text-slate-100">Add a release</h2></div>
          <label htmlFor="catalog-camera-input" className={`group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-all hover:border-amber-500/60 hover:bg-amber-500/20 ${scanning ? 'pointer-events-none cursor-not-allowed opacity-60' : ''}`}>
            {scanning ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analyzing photo...</> : <><ScanLine className="h-3.5 w-3.5" />Scan car with camera</>}
          </label>
          <input id="catalog-camera-input" ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelected} className="sr-only" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input value={castingName} onChange={(e) => setCastingName(e.target.value)} className="input-field" placeholder="Casting name" />
          <select value={formSeriesId} onChange={(e) => setFormSeriesId(e.target.value)} className="input-field">
            {seriesList.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <input value={collectorNumber} onChange={(e) => setCollectorNumber(e.target.value)} className="input-field" placeholder="Collector number" />
          <input value={toyNumber} onChange={(e) => setToyNumber(e.target.value)} className="input-field" placeholder="Toy number / SKU" />
          <input value={themeSeries} onChange={(e) => setThemeSeries(e.target.value)} className="input-field" placeholder="Theme series (e.g. Exoticars)" />
          <input value={themeSeriesNumber} onChange={(e) => setThemeSeriesNumber(e.target.value)} className="input-field" placeholder="Theme series number (e.g. 1/10)" />
          <input value={releaseVariant} onChange={(e) => setReleaseVariant(e.target.value)} className="input-field" placeholder="Release variant (e.g. 1st Color)" />
          <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="input-field">{RARITY_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select>
          <input value={retailerExclusive} onChange={(e) => setRetailerExclusive(e.target.value)} className="input-field" placeholder="Retailer exclusive (optional)" />
          <select value={releaseStatus} onChange={(e) => setReleaseStatus(e.target.value)} className="input-field">{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}</select>
          <input value={sourceNotes} onChange={(e) => setSourceNotes(e.target.value)} className="input-field sm:col-span-2 lg:col-span-3" placeholder="Source / verification notes" />
        </div>

        {errorMsg && <p className="mt-3 text-sm text-red-400">{errorMsg}</p>}

        <button onClick={() => void addRelease()} disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CirclePlus className="h-4 w-4" />}{saving ? 'Saving...' : 'Add release'}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><Car className="h-4 w-4 text-amber-400" /><h2 className="font-semibold text-slate-100">Catalog releases</h2>
            {missingPhotoCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                <ImageOff className="h-3 w-3" />{missingPhotoCount} missing photos
              </span>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300">
              <input type="checkbox" checked={missingPhotosOnly} onChange={(e) => setMissingPhotosOnly(e.target.checked)} />
              Missing photos only
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-full sm:w-40">
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
            </select>
            <label className="flex w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 sm:w-64">
              <Search className="h-4 w-4 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm text-slate-100 outline-none" placeholder="Search releases" />
            </label>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {loadingList && <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Loading catalog...</div>}

          {!loadingList && filteredReleases.map((release) => (
            <div key={release.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-200">
                    #{release.collector_number ?? '—'} · {release.catalog_castings?.casting_name ?? 'Unknown casting'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {release.theme_series ?? '—'} {release.theme_series_number ? `(${release.theme_series_number})` : ''} · {release.release_variant ?? '1st Color'} · {release.toy_number ?? 'no toy #'}
                    {release.retailer_exclusive ? ` · ${release.retailer_exclusive} Exclusive` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!releasesWithPhotos.has(release.id) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      <ImageOff className="h-3 w-3" />Photo needed
                    </span>
                  )}
                  {release.rarity !== 'Mainline' && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1 text-xs font-semibold text-fuchsia-300">
                      <Star className="h-3 w-3" />{release.rarity}
                    </span>
                  )}
                  <select value={release.release_status} onChange={(e) => void updateStatus(release.id, e.target.value)} className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${statusColor(release.release_status)}`}>
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
                  </select>
                  <button onClick={() => openImagePanel(release.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-sky-950/30 hover:text-sky-400" aria-label="Manage images">
                    <ImagePlus className="h-4 w-4" />
                  </button>
                  <button onClick={() => void deleteRelease(release.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-950/30 hover:text-red-400" aria-label={`Delete release ${release.collector_number}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {imagePanelReleaseId === release.id && (
                <div className="mt-4 rounded-xl border border-sky-500/20 bg-slate-950/60 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Reference images</p>

                  <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {(images[release.id] ?? []).map((img) => (
                      <div key={img.id} className="group relative overflow-hidden rounded-lg border border-slate-700">
                        <img src={img.image_url} alt={img.caption ?? img.image_type} className="aspect-square w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-950/80 px-2 py-1">
                          <span className="text-[10px] font-semibold text-slate-300">{img.image_type}{img.is_primary ? ' · primary' : ''}</span>
                          <button onClick={() => void deleteImage(release.id, img.id)} className="text-slate-400 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))}
                    {(images[release.id] ?? []).length === 0 && (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 py-6 text-slate-500 sm:col-span-2 lg:col-span-4">
                        <ImageOff className="h-5 w-5" />
                        <p className="text-xs">No images yet — upload one or wait for a collector to contribute.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <select value={imageType} onChange={(e) => setImageType(e.target.value)} className="input-field">
                      {IMAGE_TYPES.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
                    </select>
                    <input value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} className="input-field" placeholder="Caption (optional)" />
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      <input type="checkbox" checked={imageIsPrimary} onChange={(e) => setImageIsPrimary(e.target.checked)} />
                      Set as primary
                    </label>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      ref={imageUploadInputRef}
                      id={`catalog-image-upload-${release.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImageFile(release.id, file);
                      }}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`catalog-image-upload-${release.id}`}
                      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 ${uploadingImage ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {uploadingImage ? 'Uploading...' : 'Upload photo'}
                    </label>

                    <div className="flex flex-1 items-center gap-2">
                      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-field flex-1" placeholder="...or paste an image URL" />
                      <button onClick={() => void addImageByUrl(release.id)} disabled={savingImage || !imageUrl.trim()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60">
                        {savingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                        Add URL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!loadingList && filteredReleases.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No releases match that search.</p>}
        </div>
      </div>
    </section>
  );
}
