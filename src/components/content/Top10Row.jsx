import { memo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Check } from 'lucide-react';
import { img } from '../../constants/api';

/**
 * Top10Card
 * Large rank number on the left, poster card on the right.
 */
const Top10Card = memo(({ item, rank, onSelect, onPlay, onToggleList, inList }) => {
  const poster = img('w342', item.poster_path);
  const title  = item.title || item.name || '';

  const handlePlay = (e) => { e.stopPropagation(); onPlay(item); };
  const handleList = (e) => { e.stopPropagation(); onToggleList(item); };

  return (
    <div
      style={{
        position: 'relative', display: 'flex',
        alignItems: 'flex-end', flexShrink: 0,
        /* wide enough for number + card */
        width: rank >= 10 ? 200 : 185,
        cursor: 'pointer',
      }}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      aria-label={`#${rank} ${title}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } }}
    >
      {/* Big rank number */}
      <span style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 148,
        lineHeight: 1,
        color: '#0d0d0d',
        WebkitTextStroke: '3px rgba(255,255,255,.22)',
        position: 'absolute',
        left: 0,
        bottom: -8,
        zIndex: 1,
        userSelect: 'none',
        letterSpacing: -4,
      }}>
        {rank}
      </span>

      {/* Poster card — overlaps the number */}
      <div style={{ marginLeft: rank >= 10 ? 68 : 58, zIndex: 2, flexShrink: 0 }}>
        <div className="sc" style={{ width: 124, height: 186, display: 'block', borderRadius: 6 }}>
          {poster
            ? <img src={poster} alt={title} loading="lazy" decoding="async" />
            : <div className="shim" style={{ width: '100%', height: '100%' }} />
          }
          <div className="ov">
            <div className="ca">
              <button className="cbtn pl" onClick={handlePlay} aria-label={`Play ${title}`} title="Play">
                <Play size={12} fill="#000" />
              </button>
              <button className={`cbtn ${inList ? 'added' : ''}`} onClick={handleList} title={inList ? 'Remove' : 'Add'}>
                {inList ? <Check size={12} /> : <Plus size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Top10Card.displayName = 'Top10Card';

/**
 * Top10Row
 * Horizontal scrollable row showing items #1–10 with rank number overlays.
 */
const Top10Row = memo(({ items, onSelect, onPlay, onToggleList, myList }) => {
  const ref = useRef(null);
  const scroll = useCallback((dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'l' ? -600 : 600, behavior: 'smooth' });
  }, []);

  const top10 = items.slice(0, 10);
  if (top10.length === 0) return null;

  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ padding: '0 4% 10px' }}>
        <h3 style={{
          color: '#e5e5e5', fontFamily: "'DM Sans',sans-serif",
          fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 700,
        }}>
          🏅 Top 10 This Week
        </h3>
      </div>

      <div className="rw" style={{ position: 'relative' }}>
        <button className="rarr" onClick={() => scroll('l')} aria-label="Scroll left">
          <ChevronLeft size={44} />
        </button>

        <div
          ref={ref}
          style={{
            display: 'flex', gap: 0,
            overflowX: 'auto',
            padding: '12px 4% 24px',
            alignItems: 'flex-end',
          }}
        >
          {top10.map((item, i) => (
            <Top10Card
              key={item.id}
              item={item}
              rank={i + 1}
              onSelect={onSelect}
              onPlay={onPlay}
              onToggleList={onToggleList}
              inList={myList.has(item.id)}
            />
          ))}
        </div>

        <button className="rarr r" onClick={() => scroll('r')} aria-label="Scroll right">
          <ChevronRight size={44} />
        </button>
      </div>
    </section>
  );
});

Top10Row.displayName = 'Top10Row';
export default Top10Row;
