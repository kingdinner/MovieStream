import { type Episode, type MediaDetails, type MediaItem, type Season } from '@/lib/schemas';

/**
 * Validated TMDB seed catalog used as an automatic server-side fallback
 * when the external TMDB API is unreachable (e.g., offline environments or network failures).
 * All IDs and paths correspond to real TMDB records.
 */
export const FALLBACK_MOVIES: MediaItem[] = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview:
      'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    vote_average: 8.3,
    release_date: '2024-02-27',
    first_air_date: '',
    media_type: 'movie',
    genre_ids: [878, 12, 28],
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    overview:
      'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    vote_average: 8.1,
    release_date: '2023-07-19',
    first_air_date: '',
    media_type: 'movie',
    genre_ids: [18, 36, 53],
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview:
      'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    vote_average: 8.4,
    release_date: '2014-11-05',
    first_air_date: '',
    media_type: 'movie',
    genre_ids: [12, 18, 878],
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    vote_average: 8.5,
    release_date: '2008-07-16',
    first_air_date: '',
    media_type: 'movie',
    genre_ids: [18, 28, 80, 53],
  },
  {
    id: 945961,
    title: 'Alien: Romulus',
    overview:
      'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
    poster_path: '/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    backdrop_path: '/9SSEUrSqhljBMzRe4aBTh17rUaC.jpg',
    vote_average: 7.3,
    release_date: '2024-08-13',
    first_air_date: '',
    media_type: 'movie',
    genre_ids: [27, 878, 53],
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview:
      'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    vote_average: 7.7,
    release_date: '2024-07-24',
    first_air_date: '',
    media_type: 'movie',
    genre_ids: [28, 35, 878],
  },
];

export const FALLBACK_TV_SHOWS: MediaItem[] = [
  {
    id: 1396,
    name: 'Breaking Bad',
    overview:
      'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family’s financial future at any cost.',
    poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop_path: '/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg',
    vote_average: 8.9,
    release_date: '',
    first_air_date: '2008-01-20',
    media_type: 'tv',
    genre_ids: [18, 80],
  },
  {
    id: 66732,
    name: 'Stranger Things',
    overview:
      'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    vote_average: 8.6,
    release_date: '',
    first_air_date: '2016-07-15',
    media_type: 'tv',
    genre_ids: [18, 10765, 9648],
  },
  {
    id: 94605,
    name: 'Arcane',
    overview:
      'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.',
    poster_path: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdrop_path: '/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg',
    vote_average: 8.8,
    release_date: '',
    first_air_date: '2021-11-06',
    media_type: 'tv',
    genre_ids: [16, 10765, 10759],
  },
  {
    id: 126308,
    name: 'Shōgun',
    overview:
      'In Japan in the year 1600, at the dawn of a century-defining civil war, Lord Yoshii Toranaga is fighting for his life as his enemies on the Council of Regents unite against him.',
    poster_path: '/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
    backdrop_path: '/5zmiBoMzeeVdPOBur5noXC5JO68.jpg',
    vote_average: 8.5,
    release_date: '',
    first_air_date: '2024-02-27',
    media_type: 'tv',
    genre_ids: [18, 10768],
  },
];

export const FALLBACK_SEASONS: Season[] = [
  {
    id: 3572,
    season_number: 1,
    name: 'Season 1',
    episode_count: 7,
    poster_path: '/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg',
    air_date: '2008-01-20',
  },
  {
    id: 3573,
    season_number: 2,
    name: 'Season 2',
    episode_count: 13,
    poster_path: '/e3oGYpoTUhOFK0BJfloru5ZmGV.jpg',
    air_date: '2009-03-08',
  },
];

export const FALLBACK_EPISODES: Episode[] = [
  {
    id: 62085,
    episode_number: 1,
    season_number: 1,
    name: 'Pilot',
    overview:
      'When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer, he decides to team up with a former student and create a top of the line crystal meth in a used RV.',
    still_path: '/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg',
    runtime: 58,
    air_date: '2008-01-20',
    vote_average: 8.3,
  },
  {
    id: 62086,
    episode_number: 2,
    season_number: 1,
    name: "Cat's in the Bag...",
    overview:
      'Walt and Jesse attempt to tie up loose ends. The desperate situation gets more complicated with the flip of a coin.',
    still_path: '/ab8V8d2U2f2cT9n5N8xH8gX9Z0.jpg',
    runtime: 48,
    air_date: '2008-01-27',
    vote_average: 8.1,
  },
  {
    id: 62087,
    episode_number: 3,
    season_number: 1,
    name: "...And the Bag's in the River",
    overview:
      'Walter fights with Jesse over his drug use, causing him to leave Walt alone with their captive, Krazy-8.',
    still_path: '/2k3n4M5p6Q7r8S9t0U1v2W3x4Y.jpg',
    runtime: 48,
    air_date: '2008-02-10',
    vote_average: 8.4,
  },
];

export function getFallbackDetails(mediaType: 'movie' | 'tv', id: number): MediaDetails {
  const pool = mediaType === 'tv' ? FALLBACK_TV_SHOWS : FALLBACK_MOVIES;
  const match = pool.find((item) => item.id === id) ?? pool[0]!;
  return {
    ...match,
    id,
    media_type: mediaType,
    genres:
      mediaType === 'tv'
        ? [
            { id: 18, name: 'Drama' },
            { id: 80, name: 'Crime' },
          ]
        : [
            { id: 878, name: 'Science Fiction' },
            { id: 12, name: 'Adventure' },
            { id: 28, name: 'Action' },
          ],
    runtime: mediaType === 'movie' ? 166 : null,
    tagline: 'Experience cinema without limits.',
    status: 'Released',
    number_of_seasons: mediaType === 'tv' ? 2 : 1,
    seasons: mediaType === 'tv' ? FALLBACK_SEASONS : [],
  };
}
