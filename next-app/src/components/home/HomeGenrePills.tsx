'use client';

import React, { memo } from 'react';
import { HOME_GENRE_PILLS } from '@/lib/tmdb/config';

interface HomeGenrePillsProps {
  activeGenre: string[] | null;
  onChange: (keys: string[] | null) => void;
}

const HomeGenrePills = memo(({ activeGenre, onChange }: HomeGenrePillsProps) => {
  return (
    <div
      role="tablist"
      aria-label="Genre filter pills"
      className="relative z-10 flex gap-2 overflow-x-auto no-scrollbar px-[4%] pt-5 pb-2"
    >
      {HOME_GENRE_PILLS.map((pill) => {
        const active =
          pill.keys === null
            ? activeGenre === null
            : JSON.stringify(activeGenre) === JSON.stringify(pill.keys);
        return (
          <button
            key={pill.label}
            type="button"
            role="tab"
            aria-selected={active}
            data-testid={`genre-pill-${pill.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            onClick={() => onChange(pill.keys)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-[13px] transition-all whitespace-nowrap border ${
              active
                ? 'bg-brand border-brand text-white font-bold shadow-md'
                : 'bg-white/10 border-white/15 text-white/85 font-medium hover:bg-white/20'
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
});

HomeGenrePills.displayName = 'HomeGenrePills';
export default HomeGenrePills;
