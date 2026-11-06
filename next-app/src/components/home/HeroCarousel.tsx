'use client';

import React, { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Info, Play } from 'lucide-react';
import {
  getMediaTitle,
  getMediaYear,
  getTmdbImageUrl,
  type MediaItem,
} from '@/lib/schemas';
import { useStreaming } from '@/context/StreamingContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HeroCarouselProps {
  items: MediaItem[];
}

const HeroCarousel = memo(({ items }: HeroCarouselProps) => {
  const { openDetailsModal, openPlayerModal } = useStreaming();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [items.length, paused]);

  if (items.length === 0) {
    return (
      <div className="relative h-[clamp(380px,85vh,85vh)] min-h-[380px] bg-[#0d0d0d] -mb-16 animate-pulse" />
    );
  }

  const prevSlide = () => {
    setActiveIdx((i) => (i - 1 + items.length) % items.length);
  };

  const nextSlide = () => {
    setActiveIdx((i) => (i + 1) % items.length);
  };

  return (
    <section
      data-testid="hero-carousel"
      aria-label="Featured Titles"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group/hero relative h-[clamp(420px,86vh,86vh)] min-h-[420px] -mb-16 overflow-hidden bg-black"
    >
      {items.map((item, idx) => {
        const isActive = idx === activeIdx;
        const title = getMediaTitle(item);
        const year = getMediaYear(item);
        const backdrop =
          getTmdbImageUrl('w1280', item.backdrop_path) ||
          getTmdbImageUrl('w780', item.poster_path);
        const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';

        return (
          <div
            key={`hero-${item.id}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isActive
                ? 'opacity-100 pointer-events-auto z-[2]'
                : 'opacity-0 pointer-events-none z-[1]'
            }`}
          >
            {backdrop && (
              <img
                src={backdrop}
                alt={title}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover block"
              />
            )}

            {/* Cinematic Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Hero Copy & CTAs */}
            <div className="absolute bottom-[clamp(90px,20%,24%)] left-[4%] right-[4%] max-w-[580px]">
              <div className="inline-flex items-center gap-2 mb-3.5 bg-brand/15 border border-brand/40 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span className="text-[#ff7070] text-[11px] font-bold tracking-wider uppercase">
                  {mediaType === 'tv' ? 'Series' : 'Movie'} · #{idx + 1} Trending
                </span>
              </div>

              <h1 className="font-display text-[clamp(36px,6.2vw,78px)] text-white leading-[0.95] tracking-[2px] mb-3.5 drop-shadow-lg">
                {title}
              </h1>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Badge variant="match">
                  {Math.round((item.vote_average ?? 0) * 10)}% Match
                </Badge>
                {year && <span className="text-neutral-300 text-sm">{year}</span>}
                <Badge variant="hd">HD</Badge>
                <Badge variant="brand">★ {(item.vote_average ?? 0).toFixed(1)}</Badge>
              </div>

              <p className="text-white/85 text-sm sm:text-[15px] leading-relaxed mb-6 line-clamp-2 sm:line-clamp-3">
                {item.overview}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="lg"
                  onClick={() => openPlayerModal(item)}
                  data-testid={isActive ? 'hero-play-btn' : undefined}
                >
                  <Play className="w-5 h-5 fill-black" />
                  Play
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => openDetailsModal(item)}
                  data-testid={isActive ? 'hero-more-info-btn' : undefined}
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Button>
                <Link
                  href={`/${mediaType}/${item.id}`}
                  className="inline-flex items-center justify-center h-12 px-5 rounded-md text-sm font-semibold border border-white/25 bg-black/50 text-white hover:bg-white/15 transition-colors"
                >
                  Full Page
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next Controls */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-5 z-10 w-11 h-11 rounded-full bg-black/55 border border-white/25 text-white items-center justify-center opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100 hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 right-5 z-10 w-11 h-11 rounded-full bg-black/55 border border-white/25 text-white items-center justify-center opacity-0 group-hover/hero:opacity-100 focus-visible:opacity-100 hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slide Indicator Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-[11%] left-[4%] flex items-center gap-2 z-10">
          {items.map((item, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={`dot-${item.id}`}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => setActiveIdx(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active ? 'w-6 bg-brand' : 'w-2 bg-white/45 hover:bg-white/75'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
});

HeroCarousel.displayName = 'HeroCarousel';
export default HeroCarousel;
