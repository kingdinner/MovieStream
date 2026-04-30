import { memo } from 'react';

const PILLS = [
  { label: 'All',          keys: null },
  { label: '🔥 Trending',   keys: ['trending_movies', 'trending_tv'] },
  { label: '⭐ Top Rated',  keys: ['top_movies', 'top_tv'] },
  { label: '💥 Action',     keys: ['action'] },
  { label: '😰 Thrillers',  keys: ['thriller'] },
  { label: '👻 Horror',     keys: ['horror'] },
  { label: '🚀 Sci-Fi',     keys: ['scifi'] },
  { label: '😂 Comedy',     keys: ['comedy'] },
  { label: '📺 TV Shows',   keys: ['trending_tv', 'top_tv', 'anime'] },
  { label: '🎌 Anime',      keys: ['anime'] },
];

const HomeGenrePills = memo(({ activeGenre, onChange }) => (
  <div style={{
    position: 'relative', zIndex: 2,
    display: 'flex', gap: 8, overflowX: 'auto',
    padding: '18px 4% 4px',
    scrollbarWidth: 'none', msOverflowStyle: 'none',
  }}>
    {PILLS.map(pill => {
      const active = pill.keys === null
        ? activeGenre === null
        : JSON.stringify(activeGenre) === JSON.stringify(pill.keys);
      return (
        <button
          key={pill.label}
          onClick={() => onChange(pill.keys)}
          style={{
            flexShrink: 0,
            padding: '8px 18px',
            borderRadius: 22,
            background: active ? '#e50914' : 'rgba(255,255,255,.08)',
            border: `1.5px solid ${active ? '#e50914' : 'rgba(255,255,255,.14)'}`,
            color: '#fff', cursor: 'pointer',
            fontSize: 13, fontWeight: active ? 700 : 500,
            fontFamily: "'DM Sans',sans-serif",
            transition: 'all .18s', outline: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {pill.label}
        </button>
      );
    })}
  </div>
));

HomeGenrePills.displayName = 'HomeGenrePills';
export default HomeGenrePills;
