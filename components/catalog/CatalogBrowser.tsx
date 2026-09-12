'use client';

import { useEffect, useMemo, useState } from 'react';
import { Car, ExternalLink, ImageOff, Search, Star, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';

type CatalogYearOption = { id: string; year: number; display_name: string };

type CatalogImageRow = {
  image_url: string;
  image_type: string;
  is_primary: boolean;
};

type CatalogReleaseRow = {
  id: string;
  collector_number: string | null;
  toy_number: string | null;
  theme_series: string | null;
  theme_series_number: string | null;
  release_variant: string | null;
  rarity: string;
  retailer_exclusive: string | null;
  release_status: string;
  view_count: number | null;
  created_at: string | null;
  catalog_castings: { casting_name: string } | null;
  catalog_years: { year: number; display_name: string } | null;
  catalog_images: CatalogImageRow[] | null;
};

type RatingStat = { catalog_release_id: string; avg_score: number; rating_count: number };

type SortMode = 'collector_number' | 'newest' | 'trending' | 'top_rated';

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

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'collector_number', label: 'Collector number' },
  { value: 'newest', label: 'Just added' },
  { value: 'trending', label: 'Trending' },
  { value: 'top_rated', label: 'Top rated' },
];

function primaryPhoto(images: CatalogImageRow[] | null) {
  if (!images || images.length === 0) return null;
  return images.find((image) => image.is_primary) ?? images[0];
}

function rarityColor(rarity: string) {
  if (rarity === 'Super Treasure Hunt') {
    return 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300';
  }
  if (rarity === 'Treasure Hunt') {
    return 'border-orange-500/40 bg-orange-500/10 text-orange-300';
  }
  if (rarity === 'Premium') {
    return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
  }
  if (rarity === 'Silver Series') {
    return 'border-slate-500/50 bg-slate-400/10 text-slate-300';
  }
  return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
}

function hotWheelsWikiSearchUrl(castingName: string) {
  return `https://hotwheels.fandom.com/wiki/Special:Search?query=${encodeURIComponent(castingName)}`;
}

const MATTEL_CREATIONS_URL = 'https://creations.mattel.com/pages/hot-wheels-collectors';

export default function CatalogBrowser() {
  const supabase = createClient();
  const { session } = useAuth();

  const [years, setYears] = useState<CatalogYearOption[]>([]);
  const [releases, setReleases] = useState<CatalogReleaseRow[]>([]);
  const [ratingStats, setRatingStats] = useState<Record<string, RatingStat>>({});
  const [myRatings, setMyRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [search, setSearch] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [includeNeedsReview, setIncludeNeedsReview] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('collector_number');

  const [viewedThisSession, setViewedThisSession] = useState<Set<string>>(new Set());

  async function loadYears() {
    const { data, error } = await supabase
      .from('catalog_years')
      .select('id, year, display_name')
      .order('year', { ascending: false });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setYears((data ?? []) as CatalogYearOption[]);
  }

  async function loadRatingStats(releaseIds: string[]) {
    if (!releaseIds.length) {
      setRatingStats({});
      return;
    }

    const { data, error } = await supabase
      .from('release_rating_stats')
      .select('catalog_release_id, avg_score, rating_count')
      .in('catalog_release_id', releaseIds);

    if (error || !data) return;

    const map: Record<string, RatingStat> = {};
    (data as RatingStat[]).forEach((row) => {
      map[row.catalog_release_id] = row;
    });
    setRatingStats(map);
  }

  async function loadMyRatings(releaseIds: string[]) {
    if (!session?.user.id || !releaseIds.length) {
      setMyRatings({});
      return;
    }

    const { data, error } = await supabase
      .from('release_ratings')
      .select('catalog_release_id, score')
      .eq('user_id', session.user.id)
      .in('catalog_release_id', releaseIds);

    if (error || !data) return;

    const map: Record<string, number> = {};
    data.forEach((row: { catalog_release_id: string; score: number }) => {
      map[row.catalog_release_id] = row.score;
    });
    setMyRatings(map);
  }

  async function loadReleases() {
    setLoading(true);
    setErrorMsg('');

    const statuses = includeNeedsReview ? ['confirmed', 'needs_review'] : ['confirmed'];

    let query = supabase
      .from('catalog_releases')
      .select(
        'id, collector_number, toy_number, theme_series, theme_series_number, release_variant, rarity, retailer_exclusive, release_status, view_count, created_at, catalog_castings(casting_name), catalog_years(year, display_name), catalog_images(image_url, image_type, is_primary)',
      )
      .in('release_status', statuses);

    if (selectedYearId !== 'all') {
      query = query.eq('catalog_year_id', selectedYearId);
    }

    if (sortMode === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortMode === 'trending') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order('collector_number', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as CatalogReleaseRow[];
    setReleases(rows);
    setLoading(false);

    const ids = rows.map((row) => row.id);
    void loadRatingStats(ids);
    void loadMyRatings(ids);
  }

  useEffect(() => {
    void loadYears();
  }, []);

  useEffect(() => {
    void loadReleases();
  }, [selectedYearId, includeNeedsReview, sortMode]);

  useEffect(() => {
    if (session?.user.id) {
      void loadMyRatings(releases.map((release) => release.id));
    }
  }, [session?.user.id]);

  const filtered = useMemo(() => {
    let list = releases.filter((release) => {
      if (selectedRarity !== 'all' && release.rarity !== selectedRarity) return false;

      const haystack = `${release.catalog_castings?.casting_name ?? ''} ${release.collector_number ?? ''} ${release.toy_number ?? ''} ${release.theme_series ?? ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

    if (sortMode === 'top_rated') {
      list = [...list].sort((a, b) => {
        const scoreA = ratingStats[a.id]?.avg_score ?? -1;
        const scoreB = ratingStats[b.id]?.avg_score ?? -1;
        return scoreB - scoreA;
      });
    }

    return list;
  }, [releases, search, selectedRarity, sortMode, ratingStats]);

  function registerView(releaseId: string) {
    if (viewedThisSession.has(releaseId)) return;
    setViewedThisSession((current) => new Set(current).add(releaseId));
    void supabase.rpc('increment_release_view', { release_id_input: releaseId });
  }

  async function submitRating(releaseId: string, score: number) {
    if (!session?.user.id) {
      setErrorMsg('Sign in to rate castings.');
      return;
    }

    setMyRatings((current) => ({ ...current, [releaseId]: score }));

    const { error } = await supabase
      .from('release_ratings')
      .upsert(
        { catalog_release_id: releaseId, user_id: session.user.id, score },
        { onConflict: 'catalog_release_id,user_id' },
      );

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    void loadRatingStats([releaseId]);
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Master Catalog
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          Find any Hot Wheels
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Search every casting, release, and rarity across the collector-verified catalog.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 sm:min-w-[220px]">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 outline-none"
            placeholder="Search by name, toy number, or series"
          />
        </label>

        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          className="input-field w-full sm:w-40"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYearId}
          onChange={(event) => setSelectedYearId(event.target.value)}
          className="input-field w-full sm:w-40"
        >
          <option value="all">All years</option>
          {years.map((year) => (
            <option key={year.id} value={year.id}>
              {year.display_name}
            </option>
          ))}
        </select>

        <select
          value={selectedRarity}
          onChange={(event) => setSelectedRarity(event.target.value)}
          className="input-field w-full sm:w-40"
        >
          <option value="all">All rarities</option>
          {RARITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <input
            type="checkbox"
            checked={includeNeedsReview}
            onChange={(event) => setIncludeNeedsReview(event.target.checked)}
          />
          Include pending review
        </label>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-xl border border-red-900/50 bg-red-950/35 px-3 py-2.5 text-sm text-red-300">
          {errorMsg}
        </p>
      )}

      {loading && (
        <p className="p-10 text-center text-sm text-slate-500">Loading the catalog...</p>
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((release) => {
            const photo = primaryPhoto(release.catalog_images);
            const castingName = release.catalog_castings?.casting_name ?? 'Unknown casting';
            const stats = ratingStats[release.id];
            const myScore = myRatings[release.id] ?? 0;

            return (
              <article
                key={release.id}
                onMouseEnter={() => registerView(release.id)}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-amber-500/40"
              >
                <div className="relative aspect-square w-full bg-slate-950">
                  {photo ? (
                    <img
                      src={photo.image_url}
                      alt={castingName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-600">
                      <ImageOff className="h-8 w-8" />
                      <span className="text-xs font-semibold text-amber-400">Photo needed</span>
                    </div>
                  )}

                  {release.rarity !== 'Mainline' && (
                    <span
                      className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${rarityColor(release.rarity)}`}
                    >
                      <Star className="h-3 w-3" />
                      {release.rarity}
                    </span>
                  )}

                  {release.release_status === 'needs_review' && (
                    <span className="absolute left-2 top-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300">
                      Pending review
                    </span>
                  )}

                  {sortMode === 'trending' && (
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-slate-300">
                      <TrendingUp className="h-3 w-3" />
                      {release.view_count ?? 0} views
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="truncate text-sm font-semibold text-slate-100">{castingName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    #{release.collector_number ?? '—'} · {release.catalog_years?.display_name ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {release.theme_series ?? '—'}
                    {release.theme_series_number ? ` (${release.theme_series_number})` : ''}
                    {' · '}
                    {release.release_variant ?? '1st Color'}
                  </p>
                  {release.retailer_exclusive && (
                    <p className="mt-1 text-xs font-semibold text-sky-300">
                      {release.retailer_exclusive} Exclusive
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => void submitRating(release.id, star)}
                          className="p-0.5"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              star <= myScore
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700 hover:text-amber-500/60'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {stats && stats.rating_count > 0 && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {stats.avg_score} ({stats.rating_count})
                      </span>
                    )}
                  </div>

                  <a
                    href={hotWheelsWikiSearchUrl(castingName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-amber-500/50 hover:text-amber-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Official Gallery
                  </a>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 py-16 text-slate-500">
              <Car className="h-8 w-8" />
              <p className="text-sm">No castings match that search yet.</p>
            </div>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="mt-6 text-center text-xs text-slate-600">
          Missing a photo above? Every "View Official Gallery" link opens a live search on{' '}
          <a
            href="https://hotwheels.fandom.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-400"
          >
            Hot Wheels Wiki
          </a>{' '}
          or browse{' '}
          <a
            href={MATTEL_CREATIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-400"
          >
            Mattel Creations' official collectors database
          </a>
          .
        </p>
      )}
    </section>
  );
}
