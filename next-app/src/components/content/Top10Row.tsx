'use client';

import React, { memo, useCallback, useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, Play, Plus } from 'lucide-react';
import {
  getMediaTitle,
  getTmdbImageUrl,
  type MediaItem,
} from '@/lib/schemas';
import { useStreaming } from '@/context/StreamingContext';

interface Top10RowProps {
  items: MediaItem[];
}

const Top10Row = memo(({ items }: Top10RowProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { isInWatchlist, toggleWatchlist, openDetailsModal, openPlayerModal } =
    useStreaming();

  const scroll = useCallback((dir: 'l' | 'r') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'l' ? -600 : 600,
      behavior: 'smooth',
    });
  }, []);

  const top10 = items.slice(0, 10);
  if (top10.length === 0) return null;

  return (
    <section className="mb-9" aria-label="Top 10 This Week">
      <div className="px-[4%] pb-2.5">
        <h2 className="text-[#e5e5e5] font-sans text-base sm:text-xl font-bold">
          🏅 Top 10 This Week
        </h2>
      </div>

      <div className="group/row relative">
        <button
          type="button"
          onClick={() => scroll('l')}
          aria-label="Scroll Top 10 left"
          className="hidden sm:flex absolute top-0 bottom-4 left-0 z-10 items-center justify-center px-3 min-w-[56px] text-white bg-gradient-to-r from-black/85 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-10 h-10 drop-shadow" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar px-[4%] pt-3 pb-6 items-end"
        >
          {top10.map((item, idx) => {
            const rank = idx + 1;
            const title = getMediaTitle(item);
            const poster = getTmdbImageUrl('w342', item.poster_path);
            const inList = isInWatchlist(item.id);

            return (
              <div
                key={`top10-${item.id}`}
                onClick={() => openDetailsModal(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetailsModal(item);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`#${rank} ${title}`}
                className="group relative flex items-end shrink-0 cursor-pointer outline-none"
                style={{ width: rank >= 10 ? 200 : 185 }}
              >
                <span
                  className="font-display text-[140px] leading-none text-[#0d0d0d] absolute left-0 -bottom-2 z-[1] select-none tracking-tighter"
                  style={{ WebkitTextStroke: '3px rgba(255,255,255,0.22)' }}
                >
                  {rank}
                </span>

                <div
                  className="z-[2] shrink-0"
                  style={{ marginLeft: rank >= 10 ? 68 : 58 }}
                >
                  <div className="relative w-[124px] h-[186px] rounded-md overflow-hidden bg-[#1c1c1c]">
                    {poster ? (
                      <img
                        src={poster}
                        alt={title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-xs text-neutral-400">
                        {title}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPlayerModal(item);
                          }}
                          aria-label={`Play ${title}`}
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-black"
                        >
                          <Play className="w-3 h-3 fill-black" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(item);
                          }}
                          aria-label={
                            inList
                              ? `Remove ${title} from My List`
                              : `Add ${title} to My List`
                          }
                          className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                            inList
                              ? 'bg-brand border-brand text-white'
                              : 'bg-black/60 border-white/75 text-white'
                          }`}
                        >
                          {inList ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll('r')}
          aria-label="Scroll Top 10 right"
          className="hidden sm:flex absolute top-0 bottom-4 right-0 z-10 items-center justify-center px-3 min-w-[56px] text-white bg-gradient-to-l from-black/85 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-10 h-10 drop-shadow" />
        </button>
      </div>
    </section>
  );
});

Top10Row.displayName = 'Top10Row';
export default Top10Row;
