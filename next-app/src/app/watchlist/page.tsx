'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookMarked } from 'lucide-react';
import { useStreaming } from '@/context/StreamingContext';
import ContentCard from '@/components/content/ContentCard';
import { Button } from '@/components/ui/button';

export default function WatchlistPage() {
  const { myListItems } = useStreaming();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const filteredItems = myListItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.media_type === filterType;
  });

  return (
    <div
      data-testid="watchlist-page"
      className="pt-24 px-[4%] pb-16 min-h-[80vh]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Back to Home"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wider">
              My List
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm">
              {myListItems.length} saved{' '}
              {myListItems.length === 1 ? 'title' : 'titles'}
            </p>
          </div>
        </div>

        {myListItems.length > 0 && (
          <div className="flex items-center gap-2" role="tablist">
            {(['all', 'movie', 'tv'] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={filterType === type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filterType === type
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white/10 border-white/15 text-neutral-300 hover:bg-white/20'
                }`}
              >
                {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div
          data-testid="watchlist-empty-state"
          className="text-center py-20 text-neutral-500"
        >
          <BookMarked className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="text-lg text-neutral-300 font-semibold">
            Your list is empty
          </p>
          <p className="text-sm mt-2 mb-6">
            Add movies and shows by clicking the + button on any card
          </p>
          <Button asChild variant="brand">
            <Link href="/">Explore Catalog</Link>
          </Button>
        </div>
      ) : (
        <div
          data-testid="watchlist-grid"
          className="grid gap-3 justify-items-center sm:justify-items-start"
          style={{
            gridTemplateColumns:
              'repeat(auto-fill, minmax(var(--card-w), 1fr))',
          }}
        >
          {filteredItems.map((item) => (
            <ContentCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
