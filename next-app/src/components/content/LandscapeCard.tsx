'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Check, Eye, Info, Play, Plus, Star } from 'lucide-react';
import {
  getMediaTitle,
  getMediaYear,
  getTmdbImageUrl,
  type MediaItem,
} from '@/lib/schemas';
import { useStreaming } from '@/context/StreamingContext';

interface LandscapeCardProps {
  item: MediaItem;
}

const LandscapeCard = memo(({ item }: LandscapeCardProps) => {
  const {
    isWatched,
    isInWatchlist,
    toggleWatchlist,
    openDetailsModal,
    openPlayerModal,
  } = useStreaming();

  const watched = isWatched(item.id);
  const inList = isInWatchlist(item.id);
  const backdrop =
    getTmdbImageUrl('w500', item.backdrop_path) ||
    getTmdbImageUrl('w342', item.poster_path);
  const title = getMediaTitle(item);
  const year = getMediaYear(item);
  const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
  const detailHref = `/${mediaType}/${item.id}`;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openPlayerModal(item);
  };

  const handleList = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWatchlist(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetailsModal(item);
    }
  };

  return (
    <div
      data-testid={`landscape-card-${item.id}`}
      className="group relative w-[var(--card-ls-w)] shrink-0 cursor-pointer outline-none"
      onClick={() => openDetailsModal(item)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      <div className="relative w-[var(--card-ls-w)] h-[var(--card-ls-h)] rounded-md overflow-hidden bg-[#1c1c1c] group-focus-visible:ring-2 group-focus-visible:ring-brand">
        {backdrop ? (
          <img
            src={backdrop}
            alt={title}
            loading="lazy"
            decoding="async"
            className="block w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 text-center text-xs text-neutral-400 bg-neutral-900">
            {title}
          </div>
        )}

        {watched && (
          <div className="absolute top-1.5 left-1.5 z-10 bg-[#46d369]/95 rounded px-1.5 py-0.5 flex items-center gap-1 shadow">
            <Eye className="w-2.5 h-2.5 text-white" />
            <span className="text-white text-[9px] font-bold tracking-wider uppercase">
              WATCHED
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <button
              type="button"
              onClick={handlePlay}
              aria-label={`Play ${title}`}
              title="Play"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black border-2 border-white hover:bg-white/85 transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
            </button>
            <button
              type="button"
              onClick={handleList}
              aria-label={inList ? `Remove ${title} from My List` : `Add ${title} to My List`}
              title={inList ? 'Remove from My List' : 'Add to My List'}
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${
                inList
                  ? 'bg-brand border-brand text-white'
                  : 'bg-black/50 border-white/75 text-white hover:border-white hover:bg-white/20'
              }`}
            >
              {inList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
            <Link
              href={detailHref}
              onClick={(e) => e.stopPropagation()}
              aria-label={`View ${title} details page`}
              title="Full Details Page"
              className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white/75 bg-black/50 text-white hover:border-white hover:bg-white/20 transition-colors shrink-0 ml-auto"
            >
              <Info className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-2 px-0.5 pb-1">
        <Link
          href={detailHref}
          onClick={(e) => e.stopPropagation()}
          className={`block text-[13px] font-semibold leading-snug mb-1 truncate hover:text-brand transition-colors ${
            watched ? 'text-neutral-400' : 'text-neutral-100'
          }`}
        >
          {title}
        </Link>
        <div className="flex items-center gap-1.5 text-[11px]">
          <Star className="w-2.5 h-2.5 fill-[#f5c518] text-[#f5c518]" />
          <span className="text-neutral-400">{(item.vote_average ?? 0).toFixed(1)}</span>
          {year && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-500">{year}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

LandscapeCard.displayName = 'LandscapeCard';
export default LandscapeCard;
