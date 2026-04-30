export const API_KEY  = 'b8d6458a6244de711c4934b1896ac164';
export const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE        = 'https://image.tmdb.org/t/p';

/** Returns a full TMDB image URL or null if path is missing. */
export const img = (size, path) => path ? `${IMG_BASE}/${size}${path}` : null;

export const ROW_CONFIGS = [
  { key: 'trending_movies', title: '🔥 Trending Movies',   landscape: true,  tab: 'movies', url: `${BASE_URL}/trending/movie/week` },
  { key: 'top_movies',      title: '⭐ Top Rated Movies',   landscape: false, tab: 'movies', url: `${BASE_URL}/movie/top_rated` },
  { key: 'action',          title: '💥 Action & Adventure', landscape: false, tab: 'movies', url: `${BASE_URL}/discover/movie?with_genres=28&sort_by=popularity.desc` },
  { key: 'thriller',        title: '😰 Thrillers',          landscape: false, tab: 'movies', url: `${BASE_URL}/discover/movie?with_genres=53&sort_by=popularity.desc` },
  { key: 'horror',          title: '👻 Horror',             landscape: false, tab: 'movies', url: `${BASE_URL}/discover/movie?with_genres=27&sort_by=popularity.desc` },
  { key: 'scifi',           title: '🚀 Sci-Fi',             landscape: true,  tab: 'movies', url: `${BASE_URL}/discover/movie?with_genres=878&sort_by=popularity.desc` },
  { key: 'comedy',          title: '😂 Comedies',           landscape: false, tab: 'movies', url: `${BASE_URL}/discover/movie?with_genres=35&sort_by=popularity.desc` },
  { key: 'trending_tv',     title: '📺 Trending TV Shows',  landscape: true,  tab: 'tv',     url: `${BASE_URL}/trending/tv/week` },
  { key: 'top_tv',          title: '🏆 Top Rated Series',   landscape: false, tab: 'tv',     url: `${BASE_URL}/tv/top_rated` },
  { key: 'anime',           title: '🎌 Anime',              landscape: false, tab: 'tv',     url: `${BASE_URL}/discover/tv?with_genres=16&sort_by=popularity.desc` },
];
