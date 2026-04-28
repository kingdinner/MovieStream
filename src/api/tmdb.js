export const TMDB_API_KEY = 'b8d6458a6244de711c4934b1896ac164';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const fetchTrending = () =>
  fetch(`${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`).then(r => r.json());

export const fetchTopMovies = () =>
  fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`).then(r => r.json());

export const fetchTopTV = () =>
  fetch(`${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}`).then(r => r.json());

export const searchMulti = (query) =>
  fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${query}`).then(r => r.json());

/* 🔥 GENRES */
export const fetchGenres = async () => {
  const movie = await fetch(
    `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`
  ).then(r => r.json());

  const tv = await fetch(
    `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`
  ).then(r => r.json());

  const map = {};
  [...movie.genres, ...tv.genres].forEach(g => (map[g.id] = g));
  return Object.values(map);
};

export const fetchByGenre = (genreId) =>
  fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}`
  ).then(r => r.json());
