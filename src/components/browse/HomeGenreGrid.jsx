import { useState, useEffect, useMemo } from 'react';
import ContentCard   from '../content/ContentCard';
import LandscapeCard from '../content/LandscapeCard';
import { API_KEY, ROW_CONFIGS } from '../../constants/api';

/**
 * HomeGenreGrid
 *
 * Shown on the Home tab when a specific genre pill is selected.
 * Fetches from the matching ROW_CONFIG URL(s) and shows a paginated grid.
 * If the genre maps to multiple configs (e.g. Trending → movies + tv),
 * small sub-tabs let the user switch between them.
 */
export default function HomeGenreGrid({
  genreKeys,
  myList,
  onSelect,
  onPlay,
  onToggleList,
  filterAvailable,
}) {
  const configs = useMemo(
    () => ROW_CONFIGS.filter(cfg => genreKeys.includes(cfg.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [genreKeys.join(',')]
  );

  const [selectedCfg, setSelectedCfg] = useState(configs[0] || null);
  const [items,   setItems]   = useState([]);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(1);
  const [loading, setLoading] = useState(false);

  /* Reset when genre changes */
  useEffect(() => {
    setSelectedCfg(configs[0] || null);
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreKeys.join(',')]);

  /* Fetch page */
  useEffect(() => {
    if (!selectedCfg) return;
    let cancelled = false;
    setLoading(true);
    setItems([]);
    const sep = selectedCfg.url.includes('?') ? '&' : '?';
    fetch(`${selectedCfg.url}${sep}api_key=${API_KEY}&page=${page}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        setItems(
          (d.results || []).map(i => ({
            ...i,
            media_type: i.media_type || (selectedCfg.tab === 'tv' ? 'tv' : 'movie'),
          }))
        );
        setTotal(Math.min(d.total_pages || 1, 20));
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCfg, page]);

  const handlePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubCat = (cfg) => {
    setSelectedCfg(cfg);
    setPage(1);
  };

  const pageNums = useMemo(() => {
    const arr   = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(total, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, total]);

  const visibleItems = filterAvailable(items);
  const isLandscape  = selectedCfg?.landscape;
  const gridCols     = isLandscape
    ? 'repeat(auto-fill, minmax(268px, 1fr))'
    : 'repeat(auto-fill, minmax(155px, 1fr))';

  return (
    <div style={{ padding: '8px 4% 60px' }}>

      {/* Sub-category tabs (only when genre maps to multiple configs) */}
      {configs.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 20,
          overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none',
        }}>
          {configs.map(cfg => {
            const active = selectedCfg?.key === cfg.key;
            return (
              <button
                key={cfg.key}
                onClick={() => handleSubCat(cfg)}
                style={{
                  flexShrink: 0, padding: '7px 16px', borderRadius: 20,
                  background: active ? 'rgba(229,9,20,.18)' : 'rgba(255,255,255,.06)',
                  border: `1.5px solid ${active ? 'rgba(229,9,20,.45)' : 'rgba(255,255,255,.12)'}`,
                  color: active ? '#ff7070' : '#aaa',
                  cursor: 'pointer', fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  fontFamily: "'DM Sans',sans-serif",
                  outline: 'none', whiteSpace: 'nowrap',
                  transition: 'all .18s',
                }}
              >
                {cfg.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="shim" style={{ height: isLandscape ? 151 : 232, borderRadius: 6 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
          {visibleItems.map(item => (
            isLandscape
              ? <LandscapeCard key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
              : <ContentCard   key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 10, marginTop: 48, flexWrap: 'wrap',
      }}>
        <button className="pgbtn" onClick={() => handlePage(page - 1)} disabled={page === 1}>
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

        <button className="pgbtn" onClick={() => handlePage(page + 1)} disabled={page === total}>
          Next ›
        </button>
      </div>
    </div>
  );
}
