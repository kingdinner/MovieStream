import React from 'react';
import { notFound } from 'next/navigation';
import { getMediaDetailsBundle } from '@/lib/tmdb/server';
import MediaDetailsView from '@/components/details/MediaDetailsView';

export default async function MovieDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    notFound();
  }

  const bundle = await getMediaDetailsBundle('movie', numericId);

  return (
    <MediaDetailsView
      details={bundle.details}
      recommendations={bundle.recommendations}
      initialEpisodes={[]}
    />
  );
}
