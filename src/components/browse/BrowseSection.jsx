import { useState, useEffect, useCallback, useMemo } from 'react';
import ContentCard   from '../content/ContentCard';
import LandscapeCard from '../content/LandscapeCard';
import { API_KEY, ROW_CONFIGS } from '../../constants/api';

/**
 * BrowseSection
 *
 * Shown when the user is on the Movies or TV tabs.
 * Replaces the old ViewAllPage overlay.
 *
 * Layout:
 *   ┌────────────────────────────────────────────────────────┐
 *   │  [Pill 1]  [Pill 2]  [Pill 3]  …  (horizontal scroll) │
 *   ├────────────────────────────────────────────────────────┤
 *   │  Grid of cards (auto-fill, 20 per page)                │
 *   ├────────────────────────────────────────────────────────┤
 *   │  ‹ Prev  1  2  3  …  20  Next ›                       │
 *   └────────────────────────────────────────────────────────┘
 */
export default function BrowseSection({
  activeTab,
  myList,
  onSelect,
  onPlay,
  onToggleList,
  filterAvailable,
  topOffset = 86,   /* override when used inside home (not as primary page) */
}) {
  /* Categories for the active tab */
  const categories = useMemo(
    () => ROW_CONFIGS.filter(r => r.tab === activeTab),
    [activeTab]
  );

  const [selectedCat, setSelectedCat] = useState(categories[0] || null);
  const [items,   setItems]   = useState([]);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(1);
  const [loading, setLoading] = useState(false);

  /* Reset when the tab switches */
  useEffect(() => {
    setSelectedCat(categories[0] || null);
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /* Fetch whenever category or page changes */
  useEffect(() => {
    if (!selectedCat) return;
    let cancelled = false;
    setLoading(true);
    setItems([]);

    const run = async () => {
      try {
        const sep  = selectedCat.url.includes('?') ? '&' : '?';
        const res  = await fetch(`${selectedCat.url}${sep}api_key=${API_KEY}&page=${page}`);
        const data = await res.json();
        if (cancelled) return;
        setItems((data.results || []).map(i => ({
          ...i,
          media_type: i.media_type || (activeTab === 'tv' ? 'tv' : 'movie'),
        })));
        setTotal(Math.min(data.total_pages || 1, 20));
      } catch (e) {
        console.error(e);
      }
      if (!cancelled) setLoading(false);
    };

    run();
    return () => { cancelled = true; };
  }, [selectedCat, page, activeTab]);

  /* Handlers */
  const handleCategory = useCallback((cat) => {
    setSelectedCat(cat);
    setPage(1);
    window.scrollTo({ top: 66, behavior: 'smooth' });
  }, []);

  const handlePage = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 66, behavior: 'smooth' });
  }, []);

  /* Pagination page numbers to show */
  const pageNums = useMemo(() => {
    const arr   = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(total, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, total]);

  const visibleItems = filterAvailable(items);
  const isLandscape  = selectedCat?.landscape;
  const gridCols     = isLandscape
    ? 'repeat(auto-fill, minmax(var(--grid-ls-min-w, 268px), 1fr))'
    : 'repeat(auto-fill, minmax(var(--grid-min-w, 155px), 1fr))';

  return (
    <div style={{ padding: `${topOffset}px 4% 60px` }}>

      {/* ── Category filter pills ── */}
      <div style={{
        display: 'flex', gap: 10,
        overflowX: 'auto', paddingBottom: 6,
        marginBottom: 28,
      }}>
        {categories.map(cat => {
          const active = selectedCat?.key === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleCategory(cat)}
              className="section-pill"
              style={{
                flexShrink: 0,
                padding: '9px 20px',
                borderRadius: 22,
                background: active ? '#e50914' : 'rgba(255,255,255,.08)',
                border: `1.5px solid ${active ? '#e50914' : 'rgba(255,255,255,.14)'}`,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                fontFamily: "'DM Sans',sans-serif",
                transition: 'all .18s',
                whiteSpace: 'nowrap',
                outline: 'none',
              }}
            >
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* ── Content grid ── */}
      {loading ? (
        /* Skeleton shimmer */
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="shim"
              style={{ height: isLandscape ? 151 : 232, borderRadius: 6 }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
          {visibleItems.map(item => (
            isLandscape
              ? <LandscapeCard
                  key={item.id} item={item}
                  onSelect={onSelect} onPlay={onPlay}
                  onToggleList={onToggleList} inList={myList.has(item.id)}
                />
              : <ContentCard
                  key={item.id} item={item}
                  onSelect={onSelect} onPlay={onPlay}
                  onToggleList={onToggleList} inList={myList.has(item.id)}
                />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 10, marginTop: 48, flexWrap: 'wrap',
      }}>
        <button
          className="pgbtn"
          onClick={() => handlePage(page - 1)}
          disabled={page === 1}
        >
          ‹ Prev
        </button>

        {page > 3 && (
          <>
            <button className="pgbtn" onClick={() => handlePage(1)}>1</button>
            <span style={{ color: '#555' }}>…</span>
          </>
        )}

        {pageNums.map(p => (
          <button
            key={p}
            className={`pgbtn ${p === page ? 'act' : ''}`}
            onClick={() => handlePage(p)}
          >
            {p}
          </button>
        ))}

        {page < total - 2 && (
          <>
            <span style={{ color: '#555' }}>…</span>
            <button className="pgbtn" onClick={() => handlePage(total)}>{total}</button>
          </>
        )}

        <button
          className="pgbtn"
          onClick={() => handlePage(page + 1)}
          disabled={page === total}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
