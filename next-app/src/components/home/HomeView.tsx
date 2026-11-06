'use client';

import React, { useState } from 'react';
import { type MediaItem } from '@/lib/schemas';
import { ROW_CONFIGS } from '@/lib/tmdb/config';
import HeroCarousel from './HeroCarousel';
import HomeGenrePills from './HomeGenrePills';
import ContentRow from '@/components/content/ContentRow';
import Top10Row from '@/components/content/Top10Row';
import BrowseCatalog from '@/components/browse/BrowseCatalog';

interface HomeViewProps {
  featuredItems: MediaItem[];
  initialRows: Record<string, MediaItem[]>;
}

export default function HomeView({ featuredItems, initialRows }: HomeViewProps) {
  const [homeGenre, setHomeGenre] = useState<string[] | null>(null);

  const top10Items = initialRows['trending_movies'] ?? featuredItems;

  return (
    <div data-testid="home-view">
      <HeroCarousel items={featuredItems} />

      <HomeGenrePills activeGenre={homeGenre} onChange={setHomeGenre} />

      {homeGenre === null ? (
        <div className="relative z-10 pt-3">
          <Top10Row items={top10Items} />
          {ROW_CONFIGS.map((cfg) => (
            <ContentRow
              key={cfg.key}
              title={cfg.title}
              items={initialRows[cfg.key] ?? []}
              landscape={cfg.landscape}
            />
          ))}
        </div>
      ) : (
        <BrowseCatalog
          categoryKeys={homeGenre}
          initialItems={initialRows[homeGenre[0] ?? 'trending_movies'] ?? []}
          topOffsetClass="pt-4"
        />
      )}
    </div>
  );
}
