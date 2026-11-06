'use client';

import React, { useEffect, useState } from 'react';
import { type Episode } from '@/lib/schemas';
import { useStreaming } from '@/context/StreamingContext';
import DetailsModal from './DetailsModal';
import VideoPlayer from '@/components/player/VideoPlayer';

export default function GlobalModals() {
  const {
    selectedItem,
    activePlayback,
    openPlayerModal,
    closeModals,
  } = useStreaming();

  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    if (!activePlayback || activePlayback.item.media_type !== 'tv') {
      setEpisodes([]);
      return;
    }
    let cancelled = false;
    fetch(
      `/api/tmdb/tv/${activePlayback.item.id}/season/${activePlayback.season}`
    )
      .then((r) => r.json())
      .then((data: { episodes?: Episode[] }) => {
        if (!cancelled && data.episodes) {
          setEpisodes(data.episodes);
        }
      })
      .catch(() => {
        // Ignore network error
      });
    return () => {
      cancelled = true;
    };
  }, [activePlayback]);

  if (activePlayback) {
    return (
      <VideoPlayer
        item={activePlayback.item}
        season={activePlayback.season}
        episode={activePlayback.episode}
        episodes={episodes}
        onEpisodeChange={(ep) =>
          openPlayerModal(activePlayback.item, activePlayback.season, ep)
        }
        onClose={closeModals}
        fullViewport
      />
    );
  }

  if (selectedItem) {
    return <DetailsModal selected={selectedItem} onClose={closeModals} />;
  }

  return null;
}
