'use client';

import React, { memo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type MediaItem } from '@/lib/schemas';
import ContentCard from './ContentCard';
import LandscapeCard from './LandscapeCard';

interface ContentRowProps {
  title: string;
  items: MediaItem[];
  landscape?: boolean;
}

const ContentRow = memo(({ title, items, landscape = false }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = useCallback((dir: 'l' | 'r') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'l' ? -860 : 860,
      behavior: 'smooth',
    });
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-9" aria-label={title}>
      <h2 className="text-[#e5e5e5] font-sans text-base sm:text-xl font-bold px-[4%] pb-2.5">
        {title}
      </h2>

      <div className="group/row relative">
        <button
          type="button"
          onClick={() => scroll('l')}
          aria-label={`Scroll ${title} left`}
          className="hidden sm:flex absolute top-0 bottom-8 left-0 z-10 items-center justify-center px-3 min-w-[56px] text-white bg-gradient-to-r from-black/85 to-transparent opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-10 h-10 drop-shadow" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto no-scrollbar px-[4%] pt-1 pb-3"
        >
          {items.map((item) =>
            landscape ? (
              <LandscapeCard key={`${item.media_type}-${item.id}`} item={item} />
            ) : (
              <ContentCard key={`${item.media_type}-${item.id}`} item={item} />
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => scroll('r')}
          aria-label={`Scroll ${title} right`}
          className="hidden sm:flex absolute top-0 bottom-8 right-0 z-10 items-center justify-center px-3 min-w-[56px] text-white bg-gradient-to-l from-black/85 to-transparent opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-10 h-10 drop-shadow" />
        </button>
      </div>
    </section>
  );
});

ContentRow.displayName = 'ContentRow';
export default ContentRow;
