'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Captions,
  FastForward,
  Maximize,
  Minimize,
  Pause,
  Play,
  RefreshCw,
  Rewind,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  getMediaTitle,
  type Episode,
  type MediaItem,
} from '@/lib/schemas';
import {
  buildAuthorizedVideoSources,
  SUBTITLE_OPTIONS,
  type SubtitleLanguage,
} from '@/lib/video/providers';
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
  const [subtitleLang, setSubtitleLang] = useState<SubtitleLanguage>('en');
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  // Accessible playback control state (synchronizes with wrapper + postMessage commands)
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(85);
  const [seekProgress, setSeekProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        subtitle: subtitleLang,
      }),
    [item.id, isTv, season, episode, subtitleLang]
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
  }, [srcIdx, episode, season, subtitleLang]);

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
    if (hasNextSource) {
      setSrcIdx((prev) => prev + 1);
    } else {
      setLoadError(true);
    }
  }, [hasNextSource]);

  const postPlayerCommand = useCallback((command: string, value?: unknown) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: value !== undefined ? [value] : [] }),
        '*'
      );
    } catch {
      // Cross-origin frame may ignore custom postMessage
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      postPlayerCommand(next ? 'playVideo' : 'pauseVideo');
      return next;
    });
  }, [postPlayerCommand]);

  const handleSeek = useCallback(
    (delta: number) => {
      setSeekProgress((prev) => {
        const next = Math.max(0, Math.min(100, prev + delta));
        postPlayerCommand('seekTo', next);
        return next;
      });
    },
    [postPlayerCommand]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      postPlayerCommand(next ? 'mute' : 'unMute');
      return next;
    });
  }, [postPlayerCommand]);

  const handleVolumeChange = useCallback(
    (nextVol: number) => {
      const clamped = Math.max(0, Math.min(100, nextVol));
      setVolume(clamped);
      setIsMuted(clamped === 0);
      postPlayerCommand('setVolume', clamped);
    },
    [postPlayerCommand]
  );

  const toggleFullscreen = useCallback(async () => {
    const el = playerContainerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Keyboard shortcuts for accessible playback
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        if (e.shiftKey && isTv) goPrevEp();
        else handleSeek(-5);
      } else if (e.key === 'ArrowRight') {
        if (e.shiftKey && isTv) goNextEp();
        else handleSeek(5);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        void toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTv, goPrevEp, goNextEp, handleSeek, toggleFullscreen, toggleMute]);

  return (
    <div
      ref={playerContainerRef}
      data-testid="video-player-container"
      data-fullscreen={isFullscreen ? 'true' : 'false'}
      className={
        fullViewport
          ? 'fixed inset-0 z-[500] bg-black flex flex-col'
          : 'relative w-full aspect-video bg-black flex flex-col rounded-xl overflow-hidden border border-white/15 shadow-2xl'
      }
    >
      {/* Top Bar: Back Button, Title, Subtitle Selector, and Source Selector (Visible on Mobile & Desktop) */}
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
          </div>
        )}
      </div>

      {/* Video Iframe Area */}
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
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="origin"
            onLoad={() => setLoaded(true)}
            onError={tryNextSource}
          />
        )}
      </div>

      {/* Accessible Playback Controls Toolbar */}
      <div
        role="toolbar"
        aria-label="Playback controls"
        data-testid="playback-controls-toolbar"
        className="flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 bg-neutral-950 border-t border-white/10 shrink-0 flex-wrap"
      >
        {/* Play / Pause & Seek Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            data-testid="control-play-pause"
            className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleSeek(-10)}
            aria-label="Rewind 10 seconds"
            data-testid="control-rewind"
            className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSeek(10)}
            aria-label="Forward 10 seconds"
            data-testid="control-forward"
            className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <div className="hidden md:flex items-center gap-2 ml-2">
            <input
              type="range"
              min={0}
              max={100}
              value={seekProgress}
              onChange={(e) => handleSeek(Number(e.target.value) - seekProgress)}
              aria-label="Seek timeline"
              data-testid="control-seek-slider"
              className="w-28 accent-brand cursor-pointer"
            />
          </div>
        </div>

        {/* Volume, Subtitles, Source Fallback Trigger, and Fullscreen Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              data-testid="control-mute-toggle"
              className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-brand" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              aria-label="Volume"
              data-testid="control-volume-slider"
              className="w-20 accent-brand cursor-pointer hidden sm:inline-block"
            />
          </div>

          {/* Subtitles Selector */}
          <div className="flex items-center gap-1.5">
            <Captions
              className={`w-4 h-4 ${
                subtitleLang !== 'off' ? 'text-brand' : 'text-neutral-400'
              }`}
            />
            <select
              aria-label="Subtitles"
              data-testid="control-subtitles-select"
              value={subtitleLang}
              onChange={(e) => setSubtitleLang(e.target.value as SubtitleLanguage)}
              className="bg-neutral-900 text-white text-xs border border-white/20 rounded px-2 py-1.5 focus:outline-none focus:border-brand"
            >
              {SUBTITLE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Manual Fallback / Report Unresponsive Source */}
          <button
            type="button"
            onClick={tryNextSource}
            aria-label="Switch to fallback source"
            data-testid="control-fallback-btn"
            className="h-8 px-2.5 rounded bg-white/10 hover:bg-white/20 text-xs text-neutral-200 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Next Source</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            data-testid="control-fullscreen-btn"
            className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        </div>
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
