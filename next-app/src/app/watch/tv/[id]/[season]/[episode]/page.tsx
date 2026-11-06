import React from 'react';
import { notFound } from 'next/navigation';
import { getMediaDetailsBundle, getTvSeasonEpisodes } from '@/lib/tmdb/server';
import WatchPageClient from '@/components/player/WatchPageClient';

export default async function WatchTvEpisodePage(props: {
  params: Promise<{ id: string; season: string; episode: string }>;
}) {
  const { id, season, episode } = await props.params;
  const numericId = Number(id);
  const numericSeason = Number(season);
  const numericEpisode = Number(episode);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0 ||
    !Number.isInteger(numericSeason) ||
    numericSeason < 1 ||
    !Number.isInteger(numericEpisode) ||
    numericEpisode < 1
  ) {
    notFound();
  }

  const [bundle, seasonEpisodes] = await Promise.all([
    getMediaDetailsBundle('tv', numericId),
    getTvSeasonEpisodes(numericId, numericSeason),
  ]);

  return (
    <WatchPageClient
      item={bundle.details}
      season={numericSeason}
      episode={numericEpisode}
      episodes={seasonEpisodes}
    />
  );
}
