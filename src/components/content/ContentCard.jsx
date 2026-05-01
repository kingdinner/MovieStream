import { memo } from 'react';
import { Play, Plus, Check, Star, Eye } from 'lucide-react';
import { img } from '../../constants/api';
import { useWatched } from '../../context/WatchedContext';

const ContentCard = memo(({ item, onSelect, onPlay, onToggleList, inList }) => {
  const { watchedIds } = useWatched();
  const isWatched = watchedIds.has(String(item.id));

  const poster  = img('w342', item.poster_path);
  const title   = item.title || item.name || '';
  const year    = (item.release_date || item.first_air_date || '').slice(0, 4);

  const handlePlay    = (e) => { e.stopPropagation(); onPlay(item); };
  const handleList    = (e) => { e.stopPropagation(); onToggleList(item); };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); }
  };

  return (
    <div
      style={{ width: 155, flexShrink: 0, cursor: 'pointer', outline: 'none' }}
      onClick={() => onSelect(item)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      <div className="sc" style={{ width: 155, height: 232, display: 'block' }}>
        {poster
          ? <img src={poster} alt={title} loading="lazy" decoding="async" />
          : <div className="shim" style={{ width: '100%', height: '100%' }} />
        }

        {/* Watched badge */}
        {isWatched && (
          <div style={{
            position: 'absolute', top: 6, left: 6, zIndex: 5,
            background: 'rgba(70,211,105,.92)', borderRadius: 4,
            padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Eye size={10} color="#fff" />
            <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
              WATCHED
            </span>
          </div>
        )}

        <div className="ov">
          <div className="ca">
            <button className="cbtn pl" onClick={handlePlay} aria-label={`Play ${title}`} title="Play">
              <Play size={13} fill="#000" />
            </button>
            <button
              className={`cbtn ${inList ? 'added' : ''}`}
              onClick={handleList}
              aria-label={inList ? 'Remove from My List' : 'Add to My List'}
              title={inList ? 'Remove' : 'Add to list'}
            >
              {inList ? <Check size={13} /> : <Plus size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Always-visible title + meta */}
      <div style={{ padding: '8px 2px 4px' }}>
        <p style={{
          color: isWatched ? '#888' : '#e5e5e5',
          fontSize: 13, fontWeight: 600, lineHeight: 1.35,
          marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Star size={10} fill="#f5c518" color="#f5c518" />
          <span style={{ color: '#999', fontSize: 11 }}>{item.vote_average?.toFixed(1)}</span>
          {year && (
            <>
              <span style={{ color: '#444', fontSize: 11 }}>·</span>
              <span style={{ color: '#777', fontSize: 11 }}>{year}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ContentCard.displayName = 'ContentCard';
export default ContentCard;
