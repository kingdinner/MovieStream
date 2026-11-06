import {
  EpisodeSchema,
  MediaDetailsSchema,
  MediaItemSchema,
  PaginatedResponseSchema,
  type Episode,
  type MediaDetails,
  type MediaItem,
  type MediaType,
} from '@/lib/schemas';
import { ROW_CONFIGS, type RowConfig } from './config';
import {
  FALLBACK_EPISODES,
  FALLBACK_MOVIES,
  FALLBACK_TV_SHOWS,
  getFallbackDetails,
} from './fallback-catalog';

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

function getServerApiKey(): string {
  return process.env.TMDB_API_KEY || 'b8d6458a6244de711c4934b1896ac164';
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes server-side deduplication

async function tmdbFetchJson(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', getServerApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const cacheKey = url.toString();
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(4500),
  });

  if (!response.ok) {
    throw new Error(`TMDB HTTP ${response.status} for ${endpoint}`);
  }

  const data: unknown = await response.json();
  memoryCache.set(cacheKey, { value: data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

function parseMediaItems(
  rawResults: unknown[],
  defaultMediaType: MediaType = 'movie'
): MediaItem[] {
  const valid: MediaItem[] = [];
  for (const raw of rawResults) {
    if (typeof raw !== 'object' || raw === null) continue;
    const record = raw as Record<string, unknown>;
    const mediaType =
      record.media_type === 'tv' || record.media_type === 'movie'
        ? record.media_type
        : defaultMediaType;
    const parsed = MediaItemSchema.safeParse({
      ...record,
      media_type: mediaType,
    });
    if (parsed.success) {
      valid.push(parsed.data);
    }
  }
  return valid;
}

/**
 * Fetches featured hero items (top trending movies & shows with backdrop + overview).
 */
export async function getFeaturedHeroItems(): Promise<MediaItem[]> {
  try {
    const raw = await tmdbFetchJson('/trending/all/week');
    const paginated = PaginatedResponseSchema.safeParse(raw);
    if (!paginated.success) {
      return [...FALLBACK_MOVIES.slice(0, 4), ...FALLBACK_TV_SHOWS.slice(0, 2)];
    }
    const items = parseMediaItems(paginated.data.results, 'movie').filter(
      (i) => Boolean(i.backdrop_path) && Boolean(i.overview)
    );
    return items.length > 0
      ? items.slice(0, 6)
      : [...FALLBACK_MOVIES.slice(0, 4), ...FALLBACK_TV_SHOWS.slice(0, 2)];
  } catch {
    return [...FALLBACK_MOVIES.slice(0, 4), ...FALLBACK_TV_SHOWS.slice(0, 2)];
  }
}

/**
 * Fetches a single catalog row by its RowConfig key and page number.
 */
export async function getCatalogRow(
  rowKey: string,
  page = 1
): Promise<{ items: MediaItem[]; totalPages: number; config: RowConfig }> {
  const cfg = ROW_CONFIGS.find((r) => r.key === rowKey) ?? ROW_CONFIGS[0]!;
  const safePage = Math.max(1, Math.min(20, Math.floor(page)));

  try {
    const raw = await tmdbFetchJson(cfg.endpoint, {
      ...(cfg.params ?? {}),
      page: String(safePage),
    });
    const paginated = PaginatedResponseSchema.safeParse(raw);
    if (!paginated.success) {
      const fallback = cfg.mediaType === 'tv' ? FALLBACK_TV_SHOWS : FALLBACK_MOVIES;
      return { items: fallback, totalPages: 3, config: cfg };
    }
    const items = parseMediaItems(paginated.data.results, cfg.mediaType);
    return {
      items: items.length > 0 ? items : cfg.mediaType === 'tv' ? FALLBACK_TV_SHOWS : FALLBACK_MOVIES,
      totalPages: Math.min(Math.max(1, paginated.data.total_pages), 20),
      config: cfg,
    };
  } catch {
    const fallback = cfg.mediaType === 'tv' ? FALLBACK_TV_SHOWS : FALLBACK_MOVIES;
    return { items: fallback, totalPages: 3, config: cfg };
  }
}

/**
 * Fetches all home rows in parallel on the server (eliminating the 31-request client waterfall).
 */
export async function getHomeCatalogBundle(): Promise<{
  featured: MediaItem[];
  rows: Record<string, MediaItem[]>;
}> {
  const [featured, ...rowResults] = await Promise.all([
    getFeaturedHeroItems(),
    ...ROW_CONFIGS.map((cfg) => getCatalogRow(cfg.key, 1)),
  ]);

  const rows: Record<string, MediaItem[]> = {};
  for (const res of rowResults) {
    rows[res.config.key] = res.items.slice(0, 18);
  }

  return { featured, rows };
}

/**
 * Server-side multi-search (movies & TV shows).
 */
export async function searchCatalog(query: string): Promise<MediaItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const raw = await tmdbFetchJson('/search/multi', { query: trimmed });
    const paginated = PaginatedResponseSchema.safeParse(raw);
    if (!paginated.success) return filterFallbackByQuery(trimmed);

    const filteredRaw = paginated.data.results.filter(
      (r) => r.media_type === 'movie' || r.media_type === 'tv'
    );
    const items = parseMediaItems(filteredRaw, 'movie');
    return items.length > 0 ? items : filterFallbackByQuery(trimmed);
  } catch {
    return filterFallbackByQuery(trimmed);
  }
}

function filterFallbackByQuery(query: string): MediaItem[] {
  const q = query.toLowerCase();
  const all = [...FALLBACK_MOVIES, ...FALLBACK_TV_SHOWS];
  const matched = all.filter((item) => {
    const title = (item.title || item.name || '').toLowerCase();
    const overview = item.overview.toLowerCase();
    return title.includes(q) || overview.includes(q);
  });
  return matched;
}

/**
 * Fetches detailed movie or TV metadata, recommendations, and initial season episodes.
 */
export async function getMediaDetailsBundle(
  mediaType: MediaType,
  id: number
): Promise<{
  details: MediaDetails;
  recommendations: MediaItem[];
  episodes: Episode[];
}> {
  try {
    const [rawDetails, rawRecs] = await Promise.all([
      tmdbFetchJson(`/${mediaType}/${id}`),
      tmdbFetchJson(`/${mediaType}/${id}/recommendations`).catch(() => ({ results: [] })),
    ]);

    const parsedDetails = MediaDetailsSchema.safeParse({
      ...(typeof rawDetails === 'object' && rawDetails !== null ? rawDetails : {}),
      media_type: mediaType,
    });

    const details = parsedDetails.success
      ? parsedDetails.data
      : getFallbackDetails(mediaType, id);

    const parsedRecs = PaginatedResponseSchema.safeParse(rawRecs);
    const recItems = parsedRecs.success
      ? parseMediaItems(parsedRecs.data.results, mediaType)
          .filter((r) => Boolean(r.poster_path))
          .slice(0, 12)
      : [];

    const fallbackRecs = (mediaType === 'tv' ? FALLBACK_TV_SHOWS : FALLBACK_MOVIES).filter(
      (i) => i.id !== id
    );

    let episodes: Episode[] = [];
    if (mediaType === 'tv') {
      episodes = await getTvSeasonEpisodes(id, 1);
    }

    return {
      details,
      recommendations: recItems.length > 0 ? recItems : fallbackRecs,
      episodes,
    };
  } catch {
    const details = getFallbackDetails(mediaType, id);
    const recommendations = (mediaType === 'tv' ? FALLBACK_TV_SHOWS : FALLBACK_MOVIES).filter(
      (i) => i.id !== id
    );
    return {
      details,
      recommendations,
      episodes: mediaType === 'tv' ? FALLBACK_EPISODES : [],
    };
  }
}

/**
 * Fetches episodes for a specific TV show and season.
 */
export async function getTvSeasonEpisodes(
  tvId: number,
  seasonNumber: number
): Promise<Episode[]> {
  const safeSeason = Math.max(1, Math.floor(seasonNumber));
  try {
    const raw = await tmdbFetchJson(`/tv/${tvId}/season/${safeSeason}`);
    if (typeof raw !== 'object' || raw === null || !('episodes' in raw)) {
      return FALLBACK_EPISODES.map((ep) => ({ ...ep, season_number: safeSeason }));
    }
    const rawEps = (raw as { episodes?: unknown[] }).episodes;
    if (!Array.isArray(rawEps)) {
      return FALLBACK_EPISODES.map((ep) => ({ ...ep, season_number: safeSeason }));
    }
    const episodes: Episode[] = [];
    for (const ep of rawEps) {
      const parsed = EpisodeSchema.safeParse(ep);
      if (parsed.success) episodes.push(parsed.data);
    }
    return episodes.length > 0
      ? episodes
      : FALLBACK_EPISODES.map((ep) => ({ ...ep, season_number: safeSeason }));
  } catch {
    return FALLBACK_EPISODES.map((ep) => ({ ...ep, season_number: safeSeason }));
  }
}
