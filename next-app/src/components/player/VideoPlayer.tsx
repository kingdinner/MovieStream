'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  getMediaTitle,
  type Episode,
  type MediaItem,
} from '@/lib/schemas';
import {
  IFRAME_ALLOW_PERMISSIONS,
  resolveNextSourceState,
} from '@/lib/video/adapter';
import { buildAuthorizedVideoSources } from '@/lib/video/providers';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  item: MediaItem;
  season?: number;
  episode?: number;
  episodes?: Episode[];
  onEpisodeChange?: (episodeNumber: number) => void;
  onClose?: () => void;
  fullViewport?: boolean;
}

export default function VideoPlayer({
  item,
  season = 1,
  episode = 1,
  episodes = [],
  onEpisodeChange,
  onClose,
  fullViewport = true,
}: VideoPlayerProps) {
  const [srcIdx, setSrcIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const title = getMediaTitle(item);
  const isTv = item.media_type === 'tv';

  const sources = useMemo(
    () =>
      buildAuthorizedVideoSources({
        tmdbId: item.id,
        mediaType: isTv ? 'tv' : 'movie',
        season,
        episode,
      }),
    [item.id, isTv, season, episode]
  );

  const activeSource = sources[srcIdx] ?? null;
  const totalSources = sources.length;
  const hasNextSource = srcIdx < totalSources - 1;

  const currentEpIdx = isTv
    ? episodes.findIndex((ep) => ep.episode_number === episode)
    : -1;
  const hasPrevEp = isTv && currentEpIdx > 0;
  const hasNextEp =
    isTv && currentEpIdx >= 0 && currentEpIdx < episodes.length - 1;

  const goPrevEp = useCallback(() => {
    if (!hasPrevEp || !onEpisodeChange) return;
    const prevEp = episodes[currentEpIdx - 1];
    if (prevEp) {
      setSrcIdx(0);
      onEpisodeChange(prevEp.episode_number);
    }
  }, [hasPrevEp, onEpisodeChange, episodes, currentEpIdx]);

  const goNextEp = useCallback(() => {
    if (!hasNextEp || !onEpisodeChange) return;
    const nextEp = episodes[currentEpIdx + 1];
    if (nextEp) {
      setSrcIdx(0);
      onEpisodeChange(nextEp.episode_number);
    }
  }, [hasNextEp, onEpisodeChange, episodes, currentEpIdx]);

  // Reset loading state when source or episode changes
  useEffect(() => {
    setLoaded(false);
    setLoadError(false);
    setShowNudge(false);
  }, [srcIdx, episode, season]);

  // Reset source index when episode changes
  useEffect(() => {
    setSrcIdx(0);
  }, [episode, season]);

  // Show helpful fallback nudge after 6s if user wants to switch source
  useEffect(() => {
    if (loadError) return;
    const timer = setTimeout(() => {
      setShowNudge(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [srcIdx, loadError]);

  const tryNextSource = useCallback(() => {
    const nextState = resolveNextSourceState(srcIdx, totalSources);
    setSrcIdx(nextState.nextIndex);
    setLoadError(nextState.loadError);
  }, [srcIdx, totalSources]);

  // Keyboard shortcuts for TV episode navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'ArrowLeft' && isTv) {
        goPrevEp();
      } else if (e.key === 'ArrowRight' && isTv) {
        goNextEp();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTv, goPrevEp, goNextEp]);

  return (
    <div
      ref={playerContainerRef}
      data-testid="video-player-container"
      className={
        fullViewport
          ? 'fixed inset-0 z-[500] bg-black flex flex-col'
          : 'relative w-full aspect-video bg-black flex flex-col rounded-xl overflow-hidden border border-white/15 shadow-2xl'
      }
    >
      {/* Top Bar: Back Button, Title, and Source Selector (Visible on Mobile & Desktop) */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 bg-black/95 border-b border-white/10 shrink-0 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              data-testid="player-close-btn"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <p
              data-testid="player-title"
              className="text-white font-bold text-sm sm:text-base truncate"
            >
              {title}
            </p>
            {isTv && (
              <p
                data-testid="player-episode-meta"
                className="text-neutral-400 text-xs truncate"
              >
                Season {season} · Episode {episode}
              </p>
            )}
          </div>
        </div>

        {/* Source Switcher — Accessible on ALL viewports including mobile */}
        {totalSources > 1 && (
          <div
            role="group"
            aria-label="Streaming source selector"
            data-testid="player-source-selector"
            className="flex items-center gap-1.5 shrink-0"
          >
            <span className="text-neutral-400 text-xs hidden sm:inline mr-1">
              Source
            </span>
            {sources.map((src, i) => {
              const active = i === srcIdx;
              return (
                <button
                  key={src.providerId}
                  type="button"
                  onClick={() => {
                    setSrcIdx(i);
                    setLoadError(false);
                  }}
                  aria-label={`Source ${i + 1}: ${src.name}`}
                  aria-pressed={active}
                  data-testid={`player-source-btn-${i + 1}`}
                  title={`${src.name} (${src.hostname})`}
                  className={`h-8 px-2.5 rounded text-xs font-bold border transition-all flex items-center justify-center ${
                    active
                      ? 'border-brand bg-brand/20 text-[#ff7070]'
                      : 'border-white/20 bg-white/5 text-neutral-300 hover:bg-white/15'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
            <button
              type="button"
              onClick={tryNextSource}
              aria-label="Switch to fallback source"
              data-testid="control-fallback-btn"
              className="h-8 px-2.5 rounded bg-white/10 hover:bg-white/20 text-xs text-neutral-200 flex items-center gap-1 transition-colors ml-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Next Source</span>
            </button>
          </div>
        )}
      </div>

      {/* Video Iframe Area (Native embedded player controls handle play/pause, seek, audio/subtitles, and fullscreen) */}
      <div className="flex-1 relative bg-black min-h-[260px]">
        {loadError && (
          <div
            role="alert"
            data-testid="player-error-overlay"
            className="absolute inset-0 z-20 bg-black/95 flex flex-col items-center justify-center gap-4 p-6 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-brand" />
            <p className="text-white font-bold text-xl">Video not available</p>
            <p className="text-neutral-400 text-sm max-w-sm">
              This title isn&apos;t responding on any of our authorized streaming sources right now.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="brand"
                onClick={() => {
                  setSrcIdx(0);
                  setLoadError(false);
                }}
                data-testid="player-retry-sources-btn"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Sources
              </Button>
              {onClose && (
                <Button variant="secondary" onClick={onClose}>
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              )}
            </div>
          </div>
        )}

        {!loaded && !loadError && (
          <div
            data-testid="player-loading-shimmer"
            className="absolute inset-0 bg-[#141414] animate-pulse flex items-center justify-center"
          >
            <span className="text-neutral-400 text-xs tracking-wider uppercase">
              Connecting to {activeSource?.name ?? 'Authorized Provider'}…
            </span>
          </div>
        )}

        {showNudge && !loadError && hasNextSource && (
          <div
            data-testid="player-fallback-nudge"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/90 border border-white/20 rounded-lg px-4 py-2 flex items-center gap-3 shadow-lg whitespace-nowrap"
          >
            <span className="text-neutral-300 text-xs">
              Having trouble with {activeSource?.name}?
            </span>
            <button
              type="button"
              onClick={tryNextSource}
              data-testid="player-try-next-source-btn"
              className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-brand-hover flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Try Source {srcIdx + 2}
            </button>
          </div>
        )}

        {activeSource && !loadError && (
          <iframe
            ref={iframeRef}
            key={`${activeSource.url}-${srcIdx}`}
            src={activeSource.url}
            title={`${title} — Player`}
            data-testid="player-iframe"
            className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-90'
            }`}
            sandbox="allow-scripts allow-same-origin"
            allowFullScreen
            allow={IFRAME_ALLOW_PERMISSIONS}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={tryNextSource}
          />
        )}
      </div>

      {/* TV Episode Navigation Bar */}
      {isTv && (hasPrevEp || hasNextEp) && (
        <div
          data-testid="player-episode-nav"
          className="flex items-center justify-between gap-3 px-4 py-2.5 bg-black/95 border-t border-white/10 shrink-0"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={goPrevEp}
            disabled={!hasPrevEp}
            aria-label="Previous episode"
            data-testid="player-prev-episode-btn"
          >
            <SkipBack className="w-4 h-4" />
            <span>Prev Episode</span>
          </Button>

          <span className="text-neutral-400 text-xs sm:text-sm text-center flex-1 truncate">
            {episodes[currentEpIdx]?.name
              ? `E${episode} · ${episodes[currentEpIdx]?.name}`
              : `Season ${season} · Episode ${episode}`}
          </span>

          <Button
            variant="brand"
            size="sm"
            onClick={goNextEp}
            disabled={!hasNextEp}
            aria-label="Next episode"
            data-testid="player-next-episode-btn"
          >
            <span>Next Episode</span>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
