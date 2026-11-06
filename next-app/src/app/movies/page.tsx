import React from 'react';
import type { Metadata } from 'next';
import { getCatalogRow } from '@/lib/tmdb/server';
import BrowseCatalog from '@/components/browse/BrowseCatalog';

export const metadata: Metadata = {
  title: 'Movies',
  description: 'Browse trending, top-rated, action, sci-fi, horror, thriller, and comedy movies.',
};

export default async function MoviesPage() {
  const initial = await getCatalogRow('trending_movies', 1);

  return (
    <div data-testid="movies-page">
      <div className="pt-24 px-[4%] pb-2">
        <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wider">
          Movies
        </h1>
      </div>
      <BrowseCatalog
        tab="movies"
        initialItems={initial.items}
        topOffsetClass="pt-4"
      />
    </div>
  );
}
