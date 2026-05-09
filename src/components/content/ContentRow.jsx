import { memo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentCard   from './ContentCard';
import LandscapeCard from './LandscapeCard';

const ContentRow = memo(({ title, items, landscape, onSelect, onPlay, onToggleList, myList }) => {
  const ref = useRef(null);

  const scroll = useCallback((dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'l' ? -860 : 860, behavior: 'smooth' });
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section style={{ marginBottom: 36 }}>
      {/* Row title */}
      <h3 className="row-title" style={{
        color: '#e5e5e5', fontFamily: "'DM Sans',sans-serif",
        fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 700,
        padding: '0 4% 10px',
      }}>
        {title}
      </h3>

      {/* Scrollable card strip */}
      <div className="rw" style={{ position: 'relative' }}>
        <button className="rarr" onClick={() => scroll('l')} aria-label="Scroll left">
          <ChevronLeft size={44} />
        </button>
        <div
          ref={ref}
          style={{ display: 'flex', gap: 'var(--row-gap, 8px)', overflowX: 'auto', padding: '4px 4% 12px' }}
        >
          {items.map(item => (
            landscape
              ? <LandscapeCard key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
              : <ContentCard   key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
          ))}
        </div>
        <button className="rarr r" onClick={() => scroll('r')} aria-label="Scroll right">
          <ChevronRight size={44} />
        </button>
      </div>
    </section>
  );
});

ContentRow.displayName = 'ContentRow';
export default ContentRow;
