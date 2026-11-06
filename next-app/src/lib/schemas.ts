import { z } from 'zod';

export const MediaTypeSchema = z.enum(['movie', 'tv']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

export const GenreSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});
export type Genre = z.infer<typeof GenreSchema>;

export const MediaItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().optional(),
  name: z.string().optional(),
  overview: z.string().default(''),
  poster_path: z.string().nullable().optional().default(null),
  backdrop_path: z.string().nullable().optional().default(null),
  vote_average: z.number().min(0).max(10).optional().default(0),
  release_date: z.string().optional().default(''),
  first_air_date: z.string().optional().default(''),
  media_type: MediaTypeSchema.optional().default('movie'),
  genre_ids: z.array(z.number().int()).optional().default([]),
});
export type MediaItem = z.infer<typeof MediaItemSchema>;

export const SeasonSchema = z.object({
  id: z.number().int(),
  season_number: z.number().int().min(0),
  name: z.string().default('Season'),
  episode_count: z.number().int().min(0).optional().default(0),
  poster_path: z.string().nullable().optional().default(null),
  air_date: z.string().nullable().optional().default(null),
});
export type Season = z.infer<typeof SeasonSchema>;

export const EpisodeSchema = z.object({
  id: z.number().int(),
  episode_number: z.number().int().min(1),
  season_number: z.number().int().min(0).optional().default(1),
  name: z.string().default('Episode'),
  overview: z.string().optional().default(''),
  still_path: z.string().nullable().optional().default(null),
  runtime: z.number().nullable().optional().default(null),
  air_date: z.string().nullable().optional().default(null),
  vote_average: z.number().optional().default(0),
});
export type Episode = z.infer<typeof EpisodeSchema>;

export const MediaDetailsSchema = MediaItemSchema.extend({
  genres: z.array(GenreSchema).optional().default([]),
  runtime: z.number().nullable().optional().default(null),
  tagline: z.string().nullable().optional().default(null),
  status: z.string().nullable().optional().default(null),
  number_of_seasons: z.number().int().optional().default(1),
  seasons: z.array(SeasonSchema).optional().default([]),
});
export type MediaDetails = z.infer<typeof MediaDetailsSchema>;

export const PaginatedResponseSchema = z.object({
  page: z.number().int().min(1).default(1),
  results: z.array(z.record(z.unknown())).default([]),
  total_pages: z.number().int().min(0).default(1),
  total_results: z.number().int().min(0).optional().default(0),
});

export const ALLOWED_IMAGE_HOSTS = ['image.tmdb.org'] as const;
export const ALLOWED_PROVIDER_HOSTS = [
  'vidcore.org',
  'embed.su',
] as const;

export const ExternalHttpsUrlSchema = z.string().url().refine(
  (val) => {
    try {
      const parsed = new URL(val);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },
  { message: 'External URL must use HTTPS protocol' }
);

export const AuthorizedProviderUrlSchema = ExternalHttpsUrlSchema.refine(
  (val) => {
    try {
      const parsed = new URL(val);
      return (ALLOWED_PROVIDER_HOSTS as readonly string[]).includes(parsed.hostname);
    } catch {
      return false;
    }
  },
  { message: 'URL hostname is not in the authorized streaming providers list' }
);

export const TmdbImageUrlSchema = ExternalHttpsUrlSchema.refine(
  (val) => {
    try {
      const parsed = new URL(val);
      return (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(parsed.hostname) &&
        parsed.pathname.startsWith('/t/p/');
    } catch {
      return false;
    }
  },
  { message: 'Image URL must originate from image.tmdb.org/t/p/' }
);

export const WatchlistItemsStorageSchema = z.array(MediaItemSchema);
export const StringIdArrayStorageSchema = z.array(z.union([z.string(), z.number()])).transform((arr) =>
  arr.map((v) => String(v))
);

/**
 * Helper to get normalized display title from a MediaItem
 */
export function getMediaTitle(item: Pick<MediaItem, 'title' | 'name'>): string {
  return item.title || item.name || 'Untitled';
}

/**
 * Helper to get normalized release year from a MediaItem
 */
export function getMediaYear(item: Pick<MediaItem, 'release_date' | 'first_air_date'>): string {
  const raw = item.release_date || item.first_air_date || '';
  return raw.slice(0, 4);
}

/**
 * Safe TMDB image URL builder with path validation
 */
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';
const VALID_IMG_SIZES = new Set(['w185', 'w300', 'w342', 'w500', 'w780', 'w1280', 'original']);

export function getTmdbImageUrl(
  size: 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original',
  path: string | null | undefined
): string | null {
  if (!path || typeof path !== 'string') return null;
  if (!VALID_IMG_SIZES.has(size)) return null;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!/^\/[a-zA-Z0-9._-]+$/.test(normalizedPath)) return null;
  const candidate = `${TMDB_IMG_BASE}/${size}${normalizedPath}`;
  const result = TmdbImageUrlSchema.safeParse(candidate);
  return result.success ? result.data : null;
}
