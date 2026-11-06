'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock,
  Play,
  Plus,
} from 'lucide-react';
import {
  getMediaTitle,
  getMediaYear,
  getTmdbImageUrl,
  type Episode,
  type MediaDetails,
  type MediaItem,
} from '@/lib/schemas';
import { useStreaming } from '@/context/StreamingContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ContentRow from '@/components/content/ContentRow';
import VideoPlayer from '@/components/player/VideoPlayer';

interface MediaDetailsViewProps {
  details: MediaDetails;
  recommendations: MediaItem[];
  initialEpisodes: Episode[];
}

export default function MediaDetailsView({
  details,
  recommendations,
  initialEpisodes,
}: MediaDetailsViewProps) {
  const { isInWatchlist, toggleWatchlist, markWatched } = useStreaming();

  const [selSeason, setSelSeason] = useState(1);
  const [selEpisode, setSelEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [inlinePlaying, setInlinePlaying] = useState(false);

  const isTv = details.media_type === 'tv';
  const title = getMediaTitle(details);
  const year = getMediaYear(details);
  const inList = isInWatchlist(details.id);
  const backdrop =
    getTmdbImageUrl('w1280', details.backdrop_path) ||
    getTmdbImageUrl('w780', details.poster_path);

  useEffect(() => {
    if (!isTv || selSeason === 1) {
      if (selSeason === 1) setEpisodes(initialEpisodes);
      return;
    }
    let cancelled = false;
    fetch(`/api/tmdb/tv/${details.id}/season/${selSeason}`)
      .then((r) => r.json())
      .then((data: { episodes?: Episode[] }) => {
        if (!cancelled && data.episodes) {
          setEpisodes(data.episodes);
          setSelEpisode(1);
        }
      })
      .catch(() => {
        // Ignore error
      });
    return () => {
      cancelled = true;
    };
  }, [isTv, details.id, selSeason, initialEpisodes]);

  const handleStartPlayback = (episodeNumber = selEpisode) => {
    setSelEpisode(episodeNumber);
    setInlinePlaying(true);
    markWatched(details.id);
  };

  return (
    <div data-testid="media-details-page" className="min-h-screen bg-black pb-16">
      {/* Hero Banner */}
      <div className="relative h-[clamp(420px,74vh,74vh)] w-full overflow-hidden bg-neutral-950">
        {backdrop && (
          <img
            src={backdrop}
            alt={title}
            className="w-full h-full object-cover block"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute top-20 left-[4%] z-10">
          <Link
            href={isTv ? '/tv' : '/movies'}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-300 hover:text-white bg-black/60 border border-white/20 px-3.5 py-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {isTv ? 'TV Shows' : 'Movies'}
          </Link>
        </div>

        <div className="absolute bottom-10 left-[4%] right-[4%] max-w-2xl z-10">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {details.genres.map((g) => (
              <span
                key={g.id}
                className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-brand/20 border border-brand/40 text-[#ff7070]"
              >
                {g.name}
              </span>
            ))}
          </div>

          <h1
            data-testid="details-page-title"
            className="font-display text-4xl sm:text-6xl text-white tracking-wider leading-none mb-3"
          >
            {title}
          </h1>

          {details.tagline && (
            <p className="text-neutral-400 italic text-sm mb-3">
              &ldquo;{details.tagline}&rdquo;
            </p>
          )}

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge variant="match">
              {Math.round((details.vote_average ?? 0) * 10)}% Match
            </Badge>
            {year && <span className="text-neutral-300 text-sm">{year}</span>}
            {details.runtime && details.runtime > 0 ? (
              <span className="inline-flex items-center gap-1 text-neutral-300 text-sm">
                <Clock className="w-3.5 h-3.5" />
                {details.runtime}m
              </span>
            ) : null}
            <Badge variant="hd">HD</Badge>
            <Badge variant="brand">
              ★ {(details.vote_average ?? 0).toFixed(1)}
            </Badge>
          </div>

          <p className="text-neutral-200 text-sm sm:text-base leading-relaxed mb-6">
            {details.overview || 'No description available.'}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="lg"
              onClick={() => handleStartPlayback(selEpisode)}
              data-testid="details-play-btn"
            >
              <Play className="w-5 h-5 fill-black" />
              {isTv ? `Play S${selSeason}:E${selEpisode}` : 'Play Movie'}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => toggleWatchlist(details)}
              data-testid="details-watchlist-btn"
            >
              {inList ? (
                <>
                  <Check className="w-5 h-5" />
                  In My List
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add to My List
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Inline Responsive Player Section */}
      {inlinePlaying && (
        <section
          aria-label="Video Player"
          data-testid="inline-player-section"
          className="px-[4%] py-8 max-w-6xl mx-auto"
        >
          <VideoPlayer
            item={details}
            season={selSeason}
            episode={selEpisode}
            episodes={episodes}
            onEpisodeChange={(ep) => setSelEpisode(ep)}
            onClose={() => setInlinePlaying(false)}
            fullViewport={false}
          />
        </section>
      )}

      {/* Series Season & Episode Selector */}
      {isTv && (
        <section
          aria-label="Seasons and Episodes"
          data-testid="series-episodes-section"
          className="px-[4%] py-8 max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="text-white font-bold text-xl sm:text-2xl">
              Episodes
              <span className="text-neutral-500 font-normal text-sm ml-2">
                ({episodes.length} episodes)
              </span>
            </h2>

            {details.seasons.filter((s) => s.season_number > 0).length > 0 && (
              <select
                aria-label="Select Season"
                data-testid="details-season-select"
                value={selSeason}
                onChange={(e) => setSelSeason(Number(e.target.value))}
                className="bg-neutral-900 text-white border border-white/25 px-4 py-2 rounded-md text-sm cursor-pointer"
              >
                {details.seasons
                  .filter((s) => s.season_number > 0)
                  .map((s) => (
                    <option key={s.id} value={s.season_number}>
                      Season {s.season_number}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {episodes.map((ep) => {
              const isCurrent = ep.episode_number === selEpisode && inlinePlaying;
              const still = getTmdbImageUrl('w300', ep.still_path);
              return (
                <button
                  key={ep.id}
                  type="button"
                  data-testid={`episode-card-${ep.episode_number}`}
                  onClick={() => handleStartPlayback(ep.episode_number)}
                  className={`flex items-center gap-4 p-3.5 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-brand/20 border-brand'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="w-32 h-[72px] rounded overflow-hidden relative bg-neutral-800 shrink-0">
                    {still && (
                      <img
                        src={still}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover block"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white mb-1 truncate">
                      E{ep.episode_number} — {ep.name}
                    </p>
                    <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed">
                      {ep.overview || 'No description available.'}
                    </p>
                  </div>

                  {ep.runtime && ep.runtime > 0 ? (
                    <span className="text-neutral-500 text-xs shrink-0">
                      {ep.runtime}m
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommendations Carousel */}
      {recommendations.length > 0 && (
        <div className="pt-6">
          <ContentRow title="More Like This" items={recommendations} />
        </div>
      )}
    </div>
  );
}
