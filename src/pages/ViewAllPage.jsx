import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import ContentCard from '../components/content/ContentCard';
import LandscapeCard from '../components/content/LandscapeCard';
import { API_KEY, ROW_CONFIGS } from '../constants/api';

/**
 * ViewAllPage
 *
 * Full-screen paginated grid for a single content row.
 * Manages its own body-overflow lock so the fixed overlay scrolls correctly.
 */
export default function ViewAllPage({
  title,
  landscape,
  myList,
  onSelect,
  onPlay,
  onToggleList,
  onClose,
}) {
  const [items, setItems]     = useState([]);
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(1);
  const [loading, setLoading] = useState(false);

  const cfg = ROW_CONFIGS.find(r => r.title === title);

  /* ── Lock body scroll while this overlay is open ── */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* ── Scroll overlay back to top on page change ── */
  const overlayRef = useCallback(node => {
    if (node) node.scrollTop = 0;
  }, []);

  /* ── Fetch page ── */
  const load = useCallback(async (p) => {
    if (!cfg) return;
    setLoading(true);
    try {
      const sep = cfg.url.includes('?') ? '&' : '?';
      const res  = await fetch(`${cfg.url}${sep}api_key=${API_KEY}&page=${p}`);
      const data = await res.json();
      setItems(data.results || []);
      setTotal(Math.min(data.total_pages || 1, 20));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [cfg]);

  useEffect(() => { load(page); }, [page, load]);

  /* ── Pagination range ── */
  const pages = useMemo(() => {
    const arr   = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(total, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, total]);

  const gridCols = landscape
    ? 'repeat(auto-fill, minmax(268px, 1fr))'
    : 'repeat(auto-fill, minmax(155px, 1fr))';

  const shimHeight = landscape ? 151 : 232;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed', top: 66, left: 0, right: 0, bottom: 0,
        background: '#000', zIndex: 80,
        overflowY: 'auto',           /* this element scrolls */
        WebkitOverflowScrolling: 'touch',
        padding: '0 4% 60px',
      }}
    >
      {/* Sticky header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 0 22px',
        position: 'sticky', top: 0,
        background: 'rgba(0,0,0,.95)', zIndex: 10,
        backdropFilter: 'blur(8px)',
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%',
            width: 42, height: 42, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0,
          }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#fff', letterSpacing: 1 }}>
          {title}
        </h2>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="shim" style={{ height: shimHeight, borderRadius: 6 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12 }}>
          {items.map(item => (
            landscape
              ? <LandscapeCard key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
              : <ContentCard   key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 10, marginTop: 52, flexWrap: 'wrap',
      }}>
        <button className="pgbtn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹ Prev</button>

        {page > 3 && (
          <>
            <button className="pgbtn" onClick={() => setPage(1)}>1</button>
            <span style={{ color: '#555' }}>…</span>
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            className={`pgbtn ${p === page ? 'act' : ''}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}

        {page < total - 2 && (
          <>
            <span style={{ color: '#555' }}>…</span>
            <button className="pgbtn" onClick={() => setPage(total)}>{total}</button>
          </>
        )}

        <button className="pgbtn" onClick={() => setPage(p => p + 1)} disabled={page === total}>Next ›</button>
      </div>
    </div>
  );
}
