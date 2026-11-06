'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { type MediaItem } from '@/lib/schemas';
import { ROW_CONFIGS, type RowConfig } from '@/lib/tmdb/config';
import ContentCard from '@/components/content/ContentCard';
import LandscapeCard from '@/components/content/LandscapeCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface BrowseCatalogProps {
  tab?: 'movies' | 'tv';
  categoryKeys?: string[];
  initialItems?: MediaItem[];
  topOffsetClass?: string;
}

export default function BrowseCatalog({
  tab,
  categoryKeys,
  initialItems = [],
  topOffsetClass = 'pt-24',
}: BrowseCatalogProps) {
  const categories = useMemo<RowConfig[]>(() => {
    if (categoryKeys && categoryKeys.length > 0) {
      return ROW_CONFIGS.filter((r) => categoryKeys.includes(r.key));
    }
    if (tab) {
      return ROW_CONFIGS.filter((r) => r.tab === tab);
    }
    return [...ROW_CONFIGS];
  }, [tab, categoryKeys]);

  const [selectedCat, setSelectedCat] = useState<RowConfig | null>(
    categories[0] ?? null
  );
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCat(categories[0] ?? null);
    setPage(1);
  }, [categories]);

  const fetchCatalogPage = useCallback(
    async (cfg: RowConfig, targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/tmdb/catalog?key=${encodeURIComponent(cfg.key)}&page=${targetPage}`
        );
        if (!res.ok) {
          throw new Error(`Failed to load catalog (${res.status})`);
        }
        const data = (await res.json()) as {
          results?: MediaItem[];
          total_pages?: number;
        };
        setItems(data.results ?? []);
        setTotalPages(Math.min(Math.max(1, data.total_pages ?? 1), 20));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to reach catalog service. Please check your connection.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedCat) return;
    fetchCatalogPage(selectedCat, page);
  }, [selectedCat, page, fetchCatalogPage]);

  const handleCategorySelect = (cat: RowConfig) => {
    setSelectedCat(cat);
    setPage(1);
  };

  const handlePageSelect = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 66, behavior: 'smooth' });
  };

  const pageNums = useMemo(() => {
    const arr: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  const isLandscape = Boolean(selectedCat?.landscape);

  return (
    <div
      data-testid="browse-catalog"
      className={`${topOffsetClass} px-[4%] pb-16`}
    >
      {/* Category / Genre Filter Pills */}
      {categories.length > 1 && (
        <div
          role="tablist"
          aria-label="Category filters"
          className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-7"
        >
          {categories.map((cat) => {
            const active = selectedCat?.key === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`category-pill-${cat.key}`}
                onClick={() => handleCategorySelect(cat)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-xs sm:text-[13px] transition-all whitespace-nowrap border ${
                  active
                    ? 'bg-brand border-brand text-white font-bold shadow'
                    : 'bg-white/10 border-white/15 text-white/85 font-medium hover:bg-white/20'
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Network Failure / Error Banner */}
      {error && (
        <div
          role="alert"
          data-testid="catalog-error-alert"
          className="mb-8 rounded-lg border border-brand/40 bg-brand/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-brand shrink-0" />
            <div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                Network Error Loading Catalog
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm">{error}</p>
            </div>
          </div>
          <Button
            variant="brand"
            size="sm"
            onClick={() => selectedCat && fetchCatalogPage(selectedCat, page)}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div
          data-testid="catalog-loading-skeleton"
          className="grid gap-3"
          style={{
            gridTemplateColumns: isLandscape
              ? 'repeat(auto-fill, minmax(var(--card-ls-w), 1fr))'
              : 'repeat(auto-fill, minmax(var(--card-w), 1fr))',
          }}
        >
          {Array.from({ length: 12 }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="w-full rounded-md"
              style={{ height: isLandscape ? 151 : 232 }}
            />
          ))}
        </div>
      ) : (
        <div
          data-testid="catalog-grid"
          className="grid gap-3 justify-items-center sm:justify-items-start"
          style={{
            gridTemplateColumns: isLandscape
              ? 'repeat(auto-fill, minmax(var(--card-ls-w), 1fr))'
              : 'repeat(auto-fill, minmax(var(--card-w), 1fr))',
          }}
        >
          {items.map((item) =>
            isLandscape ? (
              <LandscapeCard key={`${item.media_type}-${item.id}`} item={item} />
            ) : (
              <ContentCard key={`${item.media_type}-${item.id}`} item={item} />
            )
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!error && totalPages > 1 && (
        <nav
          aria-label="Catalog pagination"
          className="flex justify-center items-center gap-2.5 mt-12 flex-wrap"
        >
          <Button
            variant="outline"
            onClick={() => handlePageSelect(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            ‹ Prev
          </Button>

          {page > 3 && (
            <>
              <Button variant="outline" onClick={() => handlePageSelect(1)}>
                1
              </Button>
              <span className="text-neutral-500">…</span>
            </>
          )}

          {pageNums.map((p) => (
            <Button
              key={p}
              variant={p === page ? 'brand' : 'outline'}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => handlePageSelect(p)}
            >
              {p}
            </Button>
          ))}

          {page < totalPages - 2 && (
            <>
              <span className="text-neutral-500">…</span>
              <Button
                variant="outline"
                onClick={() => handlePageSelect(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => handlePageSelect(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next ›
          </Button>
        </nav>
      )}
    </div>
  );
}
