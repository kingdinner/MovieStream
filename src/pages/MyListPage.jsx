import { useEffect } from 'react';
import { ArrowLeft, BookMarked } from 'lucide-react';
import ContentCard from '../components/content/ContentCard';

/**
 * MyListPage
 *
 * Full-screen overlay showing the user's saved items.
 */
export default function MyListPage({
  myList,
  myListItems,
  onSelect,
  onPlay,
  onToggleList,
  onClose,
}) {
  /* ── Lock body scroll while open ── */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 66, left: 0, right: 0, bottom: 0,
      background: '#000', zIndex: 80,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      padding: '0 4% 60px',
    }}>
      {/* Sticky header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 0 22px',
        position: 'sticky', top: 0,
        background: 'rgba(0,0,0,.95)', zIndex: 10,
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%',
            width: 42, height: 42, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#fff',
          }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#fff', letterSpacing: 1 }}>
          My List
        </h2>
      </div>

      {/* Empty state */}
      {myListItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
          <BookMarked size={56} style={{ margin: '0 auto 16px', display: 'block', opacity: .3 }} />
          <p style={{ fontSize: 18 }}>Your list is empty</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Add movies and shows by clicking the + button on any card
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
          {myListItems.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              onSelect={onSelect}
              onPlay={onPlay}
              onToggleList={onToggleList}
              inList={myList.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
