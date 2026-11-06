import React from 'react';
import type { Metadata } from 'next';
import { getCatalogRow } from '@/lib/tmdb/server';
import BrowseCatalog from '@/components/browse/BrowseCatalog';

export const metadata: Metadata = {
  title: 'TV Shows',
  description: 'Browse trending TV shows, top-rated series, and latest anime.',
};

export default async function TvShowsPage() {
  const initial = await getCatalogRow('trending_tv', 1);

  return (
    <div data-testid="tv-page">
      <div className="pt-24 px-[4%] pb-2">
        <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wider">
          TV Shows
        </h1>
      </div>
      <BrowseCatalog
        tab="tv"
        initialItems={initial.items}
        topOffsetClass="pt-4"
      />
    </div>
  );
}
