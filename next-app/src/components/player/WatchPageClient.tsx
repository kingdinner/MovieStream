'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Episode, type MediaItem } from '@/lib/schemas';
import VideoPlayer from './VideoPlayer';

interface WatchPageClientProps {
  item: MediaItem;
  season: number;
  episode: number;
  episodes: Episode[];
}

export default function WatchPageClient({
  item,
  season,
  episode: initialEpisode,
  episodes,
}: WatchPageClientProps) {
  const router = useRouter();
  const [episode, setEpisode] = useState(initialEpisode);

  const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';

  return (
    <VideoPlayer
      item={item}
      season={season}
      episode={episode}
      episodes={episodes}
      onEpisodeChange={(nextEp) => {
        setEpisode(nextEp);
        router.replace(`/watch/tv/${item.id}/${season}/${nextEp}`);
      }}
      onClose={() => router.push(`/${mediaType}/${item.id}`)}
      fullViewport
    />
  );
}
