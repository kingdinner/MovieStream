'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { type MediaItem } from '@/lib/schemas';
import ContentCard from '@/components/content/ContentCard';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const executeSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/search?q=${encodeURIComponent(trimmed)}`
      );
      if (res.ok) {
        const data = (await res.json()) as { results?: MediaItem[] };
        setResults(data.results ?? []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void executeSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, executeSearch]);

  const filteredResults = results.filter((item) => {
    if (mediaFilter === 'all') return true;
    return item.media_type === mediaFilter;
  });

  return (
    <div data-testid="search-page" className="pt-24 px-[4%] pb-16 min-h-[80vh]">
      <div className="max-w-2xl mb-8">
        <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wider mb-4">
          Search Catalog
        </h1>
        <div className="relative">
          <SearchIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <Input
            type="search"
            aria-label="Search movies and series"
            data-testid="search-page-input"
            placeholder="Search movies, TV shows, anime…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-11 text-base bg-neutral-900 border-white/25"
          />
        </div>

        <div className="flex items-center gap-2 mt-4" role="tablist">
          {(['all', 'movie', 'tv'] as const).map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={mediaFilter === type}
              onClick={() => setMediaFilter(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                mediaFilter === type
                  ? 'bg-brand border-brand text-white'
                  : 'bg-white/10 border-white/15 text-neutral-300 hover:bg-white/20'
              }`}
            >
              {type === 'all' ? 'All Results' : type === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      </div>

      {query.trim().length >= 2 && (
        <h2
          data-testid="search-results-heading"
          className="text-white font-bold text-xl mb-5"
        >
          Results for &ldquo;{query.trim()}&rdquo;
        </h2>
      )}

      {loading ? (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns:
              'repeat(auto-fill, minmax(var(--card-w), 1fr))',
          }}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <Skeleton key={idx} className="w-full h-[232px] rounded-md" />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div
          data-testid="search-results-grid"
          className="grid gap-3 justify-items-center sm:justify-items-start"
          style={{
            gridTemplateColumns:
              'repeat(auto-fill, minmax(var(--card-w), 1fr))',
          }}
        >
          {filteredResults.map((item) => (
            <ContentCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : query.trim().length >= 2 ? (
        <p data-testid="search-no-results" className="text-neutral-400 text-sm">
          No matching titles found for &ldquo;{query.trim()}&rdquo;.
        </p>
      ) : (
        <p className="text-neutral-500 text-sm">
          Type at least 2 characters to search movies and TV series.
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 px-[4%] text-neutral-400">Loading search…</div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
