import { type MediaType } from '@/lib/schemas';

export interface RowConfig {
  key: string;
  title: string;
  landscape: boolean;
  tab: 'movies' | 'tv';
  mediaType: MediaType;
  endpoint: string;
  params?: Record<string, string>;
}

export const ROW_CONFIGS: readonly RowConfig[] = [
  {
    key: 'trending_movies',
    title: '🔥 Trending Movies',
    landscape: true,
    tab: 'movies',
    mediaType: 'movie',
    endpoint: '/trending/movie/week',
  },
  {
    key: 'top_movies',
    title: '⭐ Top Rated Movies',
    landscape: false,
    tab: 'movies',
    mediaType: 'movie',
    endpoint: '/movie/top_rated',
  },
  {
    key: 'action',
    title: '💥 Action & Adventure',
    landscape: false,
    tab: 'movies',
    mediaType: 'movie',
    endpoint: '/discover/movie',
    params: { with_genres: '28', sort_by: 'popularity.desc' },
  },
  {
    key: 'thriller',
    title: '😰 Thrillers',
    landscape: false,
    tab: 'movies',
    mediaType: 'movie',
    endpoint: '/discover/movie',
    params: { with_genres: '53', sort_by: 'popularity.desc' },
  },
  {
    key: 'horror',
    title: '👻 Horror',
    landscape: false,
    tab: 'movies',
    mediaType: 'movie',
    endpoint: '/discover/movie',
    params: { with_genres: '27', sort_by: 'popularity.desc' },
  },
  {
    key: 'scifi',
    title: '🚀 Sci-Fi',
    landscape: true,
    tab: 'movies',
    mediaType: 'movie',
    endpoint: '/discover/movie',
    params: { with_genres: '878', sort_by: 'popularity.desc' },
  },
  {
    key: 'comedy',
    title: '😂 Comedies',
    landscape: false,
    tab: 'movies',
    mediaType: 'movie',
    endpoint: '/discover/movie',
    params: { with_genres: '35', sort_by: 'popularity.desc' },
  },
  {
    key: 'trending_tv',
    title: '📺 Trending TV Shows',
    landscape: true,
    tab: 'tv',
    mediaType: 'tv',
    endpoint: '/trending/tv/week',
  },
  {
    key: 'top_tv',
    title: '🏆 Top Rated Series',
    landscape: false,
    tab: 'tv',
    mediaType: 'tv',
    endpoint: '/tv/top_rated',
  },
  {
    key: 'anime',
    title: '🎌 Latest Anime',
    landscape: false,
    tab: 'tv',
    mediaType: 'tv',
    endpoint: '/discover/tv',
    params: {
      with_genres: '16',
      with_original_language: 'ja',
      sort_by: 'first_air_date.desc',
    },
  },
] as const;

export interface GenrePillOption {
  label: string;
  keys: string[] | null;
}

export const HOME_GENRE_PILLS: readonly GenrePillOption[] = [
  { label: 'All', keys: null },
  { label: '🔥 Trending', keys: ['trending_movies', 'trending_tv'] },
  { label: '⭐ Top Rated', keys: ['top_movies', 'top_tv'] },
  { label: '💥 Action', keys: ['action'] },
  { label: '😰 Thrillers', keys: ['thriller'] },
  { label: '👻 Horror', keys: ['horror'] },
  { label: '🚀 Sci-Fi', keys: ['scifi'] },
  { label: '😂 Comedy', keys: ['comedy'] },
  { label: '📺 TV Shows', keys: ['trending_tv', 'top_tv', 'anime'] },
  { label: '🎌 Anime', keys: ['anime'] },
] as const;
