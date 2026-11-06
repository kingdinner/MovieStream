import React from 'react';
import { getHomeCatalogBundle } from '@/lib/tmdb/server';
import HomeView from '@/components/home/HomeView';

export default async function HomePage() {
  const { featured, rows } = await getHomeCatalogBundle();

  return <HomeView featuredItems={featured} initialRows={rows} />;
}
