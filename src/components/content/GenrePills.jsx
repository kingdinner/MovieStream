import { memo } from 'react';

export const GENRE_PILLS = {
  movies: [
    { id: 'all',             label: 'All' },
    { id: 'trending_movies', label: '🔥 Trending' },
    { id: 'top_movies',      label: '⭐ Top Rated' },
    { id: 'action',          label: '💥 Action' },
    { id: 'thriller',        label: '😰 Thriller' },
    { id: 'horror',          label: '👻 Horror' },
    { id: 'scifi',           label: '🚀 Sci-Fi' },
    { id: 'comedy',          label: '😂 Comedy' },
  ],
  tv: [
    { id: 'all',         label: 'All' },
    { id: 'trending_tv', label: '🔥 Trending' },
    { id: 'top_tv',      label: '🏆 Top Rated' },
    { id: 'anime',       label: '🎌 Anime' },
  ],
};

/**
 * GenrePills
 * ──────────
 * Horizontal scrollable row of genre filter pills shown under the header
 * when the user is on the Movies or TV tab.
 *
 * Props:
 *   tab          — 'movies' | 'tv'  (determines which pill set to show)
 *   activeGenre  — currently selected genre key
 *   onChange     — (genreId: string) => void
 */
const GenrePills = memo(({ tab, activeGenre, onChange }) => {
  const pills = GENRE_PILLS[tab];
  if (!pills) return null;

  return (
    <div style={{
      display: 'flex', gap: 8,
      overflowX: 'auto',
      padding: '10px 4% 14px',
      /* hide scrollbar */
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {pills.map(({ id, label }) => {
        const active = id === activeGenre;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flexShrink: 0,
              padding: '7px 18px',
              borderRadius: 20,
              border: active
                ? '1.5px solid #e50914'
                : '1.5px solid rgba(255,255,255,.18)',
              background: active
                ? 'rgba(229,9,20,.18)'
                : 'rgba(255,255,255,.06)',
              color: active ? '#fff' : 'rgba(255,255,255,.65)',
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              fontFamily: "'DM Sans',sans-serif",
              cursor: 'pointer',
              transition: 'all .18s',
              whiteSpace: 'nowrap',
              letterSpacing: .3,
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = 'rgba(255,255,255,.12)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = 'rgba(255,255,255,.06)';
                e.currentTarget.style.color = 'rgba(255,255,255,.65)';
              }
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
});

GenrePills.displayName = 'GenrePills';
export default GenrePills;
