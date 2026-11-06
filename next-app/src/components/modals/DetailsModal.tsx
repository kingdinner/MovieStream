'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  Plus,
  X,
} from 'lucide-react';
import {
  getMediaTitle,
  getMediaYear,
  getTmdbImageUrl,
  type Episode,
  type MediaDetails,
  type MediaItem,
  type Season,
} from '@/lib/schemas';
import { useStreaming } from '@/context/StreamingContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const EP_PER_PAGE = 6;

interface DetailsModalProps {
  selected: MediaItem;
  onClose: () => void;
}

export default function DetailsModal({ selected, onClose }: DetailsModalProps) {
  const {
    isInWatchlist,
    toggleWatchlist,
    openDetailsModal,
    openPlayerModal,
  } = useStreaming();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selSeason, setSelSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [epPage, setEpPage] = useState(0);

  const recRef = useRef<HTMLDivElement | null>(null);

  const title = getMediaTitle(selected);
  const year = getMediaYear(selected);
  const isTv = selected.media_type === 'tv';
  const mediaType = isTv ? 'tv' : 'movie';
  const inList = isInWatchlist(selected.id);
  const backdrop =
    getTmdbImageUrl('w1280', selected.backdrop_path) ||
    getTmdbImageUrl('w780', selected.poster_path);

  useEffect(() => {
    let cancelled = false;
    setSeasons([]);
    setEpisodes([]);
    setRecommendations([]);
    setSelSeason(1);
    setEpPage(0);

    fetch(`/api/tmdb/details/${mediaType}/${selected.id}`)
      .then((r) => r.json())
      .then(
        (data: {
          details?: MediaDetails;
          recommendations?: MediaItem[];
          episodes?: Episode[];
        }) => {
          if (cancelled) return;
          if (data.details?.seasons) {
            setSeasons(data.details.seasons);
          }
          if (data.recommendations) {
            setRecommendations(data.recommendations);
          }
          if (data.episodes) {
            setEpisodes(data.episodes);
          }
        }
      )
      .catch(() => {
        // Ignore network errors in modal; base item info is still displayed
      });

    return () => {
      cancelled = true;
    };
  }, [selected.id, mediaType]);

  useEffect(() => {
    if (!isTv || selSeason === 1) return;
    let cancelled = false;
    setEpPage(0);
    fetch(`/api/tmdb/tv/${selected.id}/season/${selSeason}`)
      .then((r) => r.json())
      .then((data: { episodes?: Episode[] }) => {
        if (!cancelled && data.episodes) {
          setEpisodes(data.episodes);
        }
      })
      .catch(() => {
        // Ignore error
      });
    return () => {
      cancelled = true;
    };
  }, [isTv, selected.id, selSeason]);

  const totalEpPages = Math.ceil(episodes.length / EP_PER_PAGE);
  const visibleEps = episodes.slice(
    epPage * EP_PER_PAGE,
    (epPage + 1) * EP_PER_PAGE
  );

  const scrollRec = (dir: 'l' | 'r') => {
    if (!recRef.current) return;
    recRef.current.scrollBy({
      left: dir === 'l' ? -520 : 520,
      behavior: 'smooth',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid="details-modal"
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-black/85 flex overflow-y-auto p-0 sm:p-6 items-end sm:items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#181818] rounded-t-2xl sm:rounded-xl max-w-[980px] w-full my-auto relative overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Backdrop Header */}
        <div className="relative h-[320px] sm:h-[420px] shrink-0 bg-neutral-900">
          {backdrop && (
            <img
              src={backdrop}
              alt={title}
              className="w-full h-full object-cover block"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-testid="details-modal-close"
            className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-[#181818]/90 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 sm:left-9 sm:right-9">
            <h2 className="font-display text-3xl sm:text-5xl text-white tracking-wide leading-none mb-4 drop-shadow">
              {title}
            </h2>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                size="lg"
                onClick={() => openPlayerModal(selected, selSeason, 1)}
                data-testid="modal-play-btn"
              >
                <Play className="w-4 h-4 fill-black" />
                Play
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => toggleWatchlist(selected)}
                data-testid="modal-watchlist-btn"
              >
                {inList ? (
                  <>
                    <Check className="w-4 h-4" />
                    In My List
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    My List
                  </>
                )}
              </Button>
              <Link
                href={`/${mediaType}/${selected.id}`}
                onClick={onClose}
                data-testid="modal-full-page-link"
                className="inline-flex items-center gap-1.5 h-12 px-5 rounded-md text-sm font-semibold border border-white/25 bg-black/50 text-white hover:bg-white/15 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Details Page
              </Link>
            </div>
          </div>
        </div>

        {/* Info Body */}
        <div className="p-6 sm:px-9 sm:py-6">
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <Badge variant="match">
              {Math.round((selected.vote_average ?? 0) * 10)}% Match
            </Badge>
            {year && <span className="text-neutral-400 text-sm">{year}</span>}
            <Badge variant="hd">HD</Badge>
            <Badge variant="brand">
              ★ {(selected.vote_average ?? 0).toFixed(1)}
            </Badge>
            <span className="text-neutral-400 text-xs bg-white/10 px-2.5 py-1 rounded">
              {isTv ? 'TV Series' : 'Movie'}
            </span>
          </div>

          <p className="text-neutral-200 text-sm sm:text-[15px] leading-relaxed">
            {selected.overview || 'No description available.'}
          </p>
        </div>

        {/* TV Episodes List */}
        {isTv && episodes.length > 0 && (
          <div className="px-6 pb-8 sm:px-9" data-testid="modal-episodes-section">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h3 className="text-white font-bold text-lg sm:text-xl">
                Episodes
                <span className="text-neutral-500 font-normal text-sm ml-2">
                  ({episodes.length} total)
                </span>
              </h3>
              {seasons.filter((s) => s.season_number > 0).length > 0 && (
                <select
                  aria-label="Select Season"
                  data-testid="modal-season-select"
                  value={selSeason}
                  onChange={(e) => setSelSeason(Number(e.target.value))}
                  className="bg-[#2a2a2a] text-white border border-white/20 px-3.5 py-2 rounded text-sm cursor-pointer"
                >
                  {seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <option key={s.id} value={s.season_number}>
                        Season {s.season_number}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {visibleEps.map((ep) => {
                const still = getTmdbImageUrl('w300', ep.still_path);
                return (
                  <button
                    key={ep.id}
                    type="button"
                    data-testid={`modal-episode-btn-${ep.episode_number}`}
                    onClick={() =>
                      openPlayerModal(selected, selSeason, ep.episode_number)
                    }
                    className="flex items-center gap-3.5 bg-white/5 hover:bg-white/15 rounded-md p-3 w-full text-left transition-colors"
                  >
                    <div className="w-24 sm:w-[120px] h-14 sm:h-[68px] rounded overflow-hidden relative bg-white/10 shrink-0">
                      {still && (
                        <img
                          src={still}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover block"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white mb-1 truncate">
                        E{ep.episode_number} — {ep.name}
                      </p>
                      <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2">
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

            {totalEpPages > 1 && (
              <div className="flex items-center justify-center gap-3.5 mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEpPage((p) => p - 1)}
                  disabled={epPage === 0}
                >
                  ‹ Prev
                </Button>
                <span className="text-neutral-400 text-xs sm:text-sm">
                  Page {epPage + 1} of {totalEpPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEpPage((p) => p + 1)}
                  disabled={epPage >= totalEpPages - 1}
                >
                  Next ›
                </Button>
              </div>
            )}
          </div>
        )}

        {/* More Like This Recommendations */}
        {recommendations.length > 0 && (
          <div className="pb-8" data-testid="modal-recommendations">
            <h3 className="text-white font-bold text-lg sm:text-xl px-6 sm:px-9 mb-4">
              More Like This
            </h3>
            <div className="relative">
              <button
                type="button"
                onClick={() => scrollRec('l')}
                aria-label="Scroll recommendations left"
                className="absolute top-0 bottom-0 left-0 z-10 bg-gradient-to-r from-[#181818] to-transparent text-white px-3 flex items-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div
                ref={recRef}
                className="flex gap-2.5 overflow-x-auto no-scrollbar px-6 sm:px-9 py-1"
              >
                {recommendations.map((rec) => {
                  const recTitle = getMediaTitle(rec);
                  const recPoster = getTmdbImageUrl('w342', rec.poster_path);
                  return (
                    <div
                      key={rec.id}
                      onClick={() =>
                        openDetailsModal({
                          ...rec,
                          media_type: rec.media_type || selected.media_type,
                        })
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openDetailsModal({
                            ...rec,
                            media_type: rec.media_type || selected.media_type,
                          });
                        }
                      }}
                      title={recTitle}
                      className="shrink-0 w-[130px] cursor-pointer group"
                    >
                      <div className="w-[130px] h-[195px] rounded-md overflow-hidden bg-neutral-800">
                        {recPoster ? (
                          <img
                            src={recPoster}
                            alt={recTitle}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-2 text-xs text-neutral-400">
                            {recTitle}
                          </div>
                        )}
                      </div>
                      <p className="text-neutral-300 text-xs font-semibold mt-1.5 truncate">
                        {recTitle}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollRec('r')}
                aria-label="Scroll recommendations right"
                className="absolute top-0 bottom-0 right-0 z-10 bg-gradient-to-l from-[#181818] to-transparent text-white px-3 flex items-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
