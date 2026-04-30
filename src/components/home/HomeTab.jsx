import { useMemo } from 'react';
import { ROW_CONFIGS } from '../../constants/api';
import HeroCarousel  from './HeroCarousel';
import HomeGenrePills from './HomeGenrePills';
import ContentRow    from '../content/ContentRow';
import HomeGenreGrid from '../browse/HomeGenreGrid';

/**
 * HomeTab
 *
 * Renders the full Home tab content:
 *   HeroCarousel → HomeGenrePills → ContentRows (All) | HomeGenreGrid (genre)
 */
export default function HomeTab({
  featuredItems,
  featuredIdx,
  setFeaturedIdx,
  homeGenre,
  setHomeGenre,
  rows,
  myList,
  onSelect,
  onPlay,
  onToggleList,
  filterAvailable,
}) {
  const homeRows = useMemo(() => ROW_CONFIGS, []);

  return (
    <>
      {/* Hero carousel */}
      <HeroCarousel
        items={featuredItems}
        activeIdx={featuredIdx}
        setActiveIdx={setFeaturedIdx}
        onPlay={onPlay}
        onSelect={onSelect}
      />

      {/* Genre filter pills */}
      <HomeGenrePills activeGenre={homeGenre} onChange={setHomeGenre} />

      {/* Content: horizontal rows (All) or paginated grid (genre) */}
      {homeGenre === null ? (
        <div style={{ position: 'relative', zIndex: 2, paddingTop: 8 }}>
          {homeRows.map(cfg => (
            <ContentRow
              key={cfg.key}
              title={cfg.title}
              items={filterAvailable(rows[cfg.title] || [])}
              landscape={cfg.landscape}
              onSelect={onSelect}
              onPlay={onPlay}
              onToggleList={onToggleList}
              myList={myList}
            />
          ))}
        </div>
      ) : (
        <HomeGenreGrid
          genreKeys={homeGenre}
          myList={myList}
          onSelect={onSelect}
          onPlay={onPlay}
          onToggleList={onToggleList}
          filterAvailable={filterAvailable}
        />
      )}
    </>
  );
}
