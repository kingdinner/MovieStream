import React from 'react';
import { notFound } from 'next/navigation';
import { getMediaDetailsBundle } from '@/lib/tmdb/server';
import WatchPageClient from '@/components/player/WatchPageClient';

export default async function WatchMoviePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const bundle = await getMediaDetailsBundle('movie', numericId);

  return (
    <WatchPageClient
      item={bundle.details}
      season={1}
      episode={1}
      episodes={[]}
    />
  );
}
