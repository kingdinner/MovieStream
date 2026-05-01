import { useState, useEffect, useRef } from 'react';
import { X, Play, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { img, BASE_URL, API_KEY } from '../../constants/api';

const EP_PER_PAGE = 6;

/**
 * DetailsModal
 *
 * Improvements:
 *  - Modal is now vertically + horizontally centered (.moverlay uses display:flex)
 *  - Wider max-width (980px)
 *  - Taller backdrop (420px)
 *  - Episode pagination (6 per page), bigger thumbnails (120×68)
 *  - Recommendations row fetched from TMDB
 *  - Cleaner single-column info layout
 */
export default function DetailsModal({
  selected,
  closeAll,
  playItem,
  onSelect,
  toggleList,
  myList,
  seasons,
  selSeason,
  setSelSeason,
  episodes,
  selEpisode,
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [epPage, setEpPage] = useState(0);
  const recRef = useRef(null);

  /* Fetch recommendations whenever the selected item changes */
  useEffect(() => {
    if (!selected?.id) return;
    setRecommendations([]);
    const type = selected.media_type === 'tv' ? 'tv' : 'movie';
    fetch(`${BASE_URL}/${type}/${selected.id}/recommendations?api_key=${API_KEY}`)
      .then(r => r.json())
      .then(d => setRecommendations((d.results || []).filter(r => r.poster_path).slice(0, 12)))
      .catch(() => setRecommendations([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, selected?.media_type]);

  /* Reset episode page when season changes */
  useEffect(() => {
    setEpPage(0);
  }, [selSeason]);

  const totalEpPages = Math.ceil(episodes.length / EP_PER_PAGE);
  const visibleEps   = episodes.slice(epPage * EP_PER_PAGE, (epPage + 1) * EP_PER_PAGE);

  const scrollRec = (dir) => {
    if (!recRef.current) return;
    recRef.current.scrollBy({ left: dir === 'l' ? -520 : 520, behavior: 'smooth' });
  };

  const inList = myList.has(selected.id);

  return (
    <div className="moverlay" onClick={closeAll} role="dialog" aria-modal="true" aria-label={selected.title || selected.name}>
      <div className="mbox" onClick={e => e.stopPropagation()}>

        {/* ── Backdrop ── */}
        <div style={{ position: 'relative', height: 420, flexShrink: 0 }}>
          <img
            src={img('w1280', selected.backdrop_path) || img('w780', selected.poster_path)}
            alt={selected.title || selected.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              borderRadius: '12px 12px 0 0', display: 'block',
            }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, #181818 4%, rgba(24,24,24,.38) 55%, transparent 100%)',
            borderRadius: '12px 12px 0 0',
          }} />

          {/* Close button */}
          <button
            onClick={closeAll}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(24,24,24,.88)', border: 'none', borderRadius: '50%',
              width: 40, height: 40, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#fff',
              transition: 'background .18s',
            }}
            aria-label="Close"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(60,60,60,.95)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(24,24,24,.88)'}
          >
            <X size={20} />
          </button>

          {/* Title + action buttons */}
          <div style={{ position: 'absolute', bottom: 28, left: 36, right: 36 }}>
            <h2 style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 'clamp(30px,4vw,50px)',
              color: '#fff', letterSpacing: 1, lineHeight: 1, marginBottom: 20,
              textShadow: '0 2px 12px rgba(0,0,0,.5)',
            }}>
              {selected.title || selected.name}
            </h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="hbtn pl" onClick={() => playItem(selected)}>
                <Play size={18} fill="#000" /> Play
              </button>
              <button className="hbtn nf" onClick={() => toggleList(selected)}>
                {inList ? <><Check size={18} /> In My List</> : <><Plus size={18} /> My List</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Info body ── */}
        <div style={{ padding: '24px 36px 24px' }}>
          {/* Meta badges row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 16, flexWrap: 'wrap',
          }}>
            <span className="b-match">{Math.round((selected.vote_average || 0) * 10)}% Match</span>
            <span style={{ color: '#aaa', fontSize: 14 }}>
              {(selected.release_date || selected.first_air_date || '').slice(0, 4)}
            </span>
            <span className="badge b-hd">HD</span>
            <span className="badge b-rt">★ {selected.vote_average?.toFixed(1)}</span>
            <span style={{
              color: '#888', fontSize: 13,
              background: 'rgba(255,255,255,.07)',
              padding: '2px 10px', borderRadius: 4,
            }}>
              {selected.media_type === 'tv' ? 'TV Series' : 'Movie'}
            </span>
            {/* Save button aligned right */}
            <button
              className="hbtn nf"
              style={{ padding: '7px 16px', fontSize: 13, marginLeft: 'auto', flexShrink: 0 }}
              onClick={() => toggleList(selected)}
            >
              {inList ? <><Check size={14} /> Saved</> : <><Plus size={14} /> Save to My List</>}
            </button>
          </div>

          {/* Overview */}
          <p style={{ color: '#d2d2d2', fontSize: 15, lineHeight: 1.78 }}>
            {selected.overview || 'No description available.'}
          </p>
        </div>

        {/* ── Episodes (TV only) ── */}
        {selected.media_type === 'tv' && episodes.length > 0 && (
          <div style={{ padding: '0 36px 36px' }}>
            {/* Header row */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 18,
              gap: 12, flexWrap: 'wrap',
            }}>
              <h3 style={{
                color: '#fff', fontFamily: "'DM Sans',sans-serif",
                fontWeight: 700, fontSize: 20,
              }}>
                Episodes
                <span style={{ color: '#666', fontWeight: 400, fontSize: 14, marginLeft: 10 }}>
                  ({episodes.length} total)
                </span>
              </h3>
              <select
                className="sels"
                value={selSeason}
                onChange={e => setSelSeason(Number(e.target.value))}
              >
                {seasons.filter(s => s.season_number > 0).map(s => (
                  <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                ))}
              </select>
            </div>

            {/* Episode list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visibleEps.map(ep => (
                <button
                  key={ep.id}
                  className={`epb ${ep.episode_number === selEpisode ? 'playing' : ''}`}
                  onClick={() => playItem(selected, ep.episode_number)}
                  style={{ padding: '12px 16px' }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 120, height: 68, borderRadius: 5, flexShrink: 0,
                    overflow: 'hidden', position: 'relative',
                    background: 'rgba(255,255,255,.07)',
                  }}>
                    {ep.still_path && (
                      <img
                        src={img('w300', ep.still_path)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />
                    )}
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,.3)',
                    }}>
                      <Play size={16} fill="#fff" color="#fff" />
                    </div>
                  </div>

                  {/* Episode info */}
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 5, color: '#fff' }}>
                      E{ep.episode_number} — {ep.name}
                    </p>
                    <p style={{
                      color: '#888', fontSize: 13, lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {ep.overview || 'No description available.'}
                    </p>
                  </div>

                  {ep.runtime > 0 && (
                    <span style={{ color: '#555', fontSize: 12, flexShrink: 0 }}>{ep.runtime}m</span>
                  )}
                </button>
              ))}
            </div>

            {/* Episode pagination */}
            {totalEpPages > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 14, marginTop: 20,
              }}>
                <button
                  className="pgbtn"
                  style={{ padding: '8px 20px', fontSize: 13, minWidth: 'auto' }}
                  onClick={() => setEpPage(p => p - 1)}
                  disabled={epPage === 0}
                >
                  ‹ Prev
                </button>
                <span style={{ color: '#aaa', fontSize: 14 }}>
                  Page {epPage + 1} of {totalEpPages}
                </span>
                <button
                  className="pgbtn"
                  style={{ padding: '8px 20px', fontSize: 13, minWidth: 'auto' }}
                  onClick={() => setEpPage(p => p + 1)}
                  disabled={epPage >= totalEpPages - 1}
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── More Like This ── */}
        {recommendations.length > 0 && (
          <div style={{ paddingBottom: 36 }}>
            <h3 style={{
              color: '#fff', fontFamily: "'DM Sans',sans-serif",
              fontWeight: 700, fontSize: 20,
              padding: '0 36px', marginBottom: 16,
            }}>
              More Like This
            </h3>

            <div style={{ position: 'relative' }}>
              {/* Left arrow */}
              <button
                onClick={() => scrollRec('l')}
                aria-label="Scroll left"
                style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 2,
                  background: 'linear-gradient(to right, rgba(24,24,24,.92), transparent)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  padding: '0 14px', display: 'flex', alignItems: 'center',
                }}
              >
                <ChevronLeft size={26} />
              </button>

              {/* Scrollable strip */}
              <div
                ref={recRef}
                style={{
                  display: 'flex', gap: 10, overflowX: 'auto',
                  padding: '4px 36px 8px',
                  scrollbarWidth: 'none', msOverflowStyle: 'none',
                }}
              >
                {recommendations.map(rec => {
                  const title  = rec.title || rec.name || '';
                  const poster = img('w342', rec.poster_path);
                  const mtype  = rec.media_type || selected.media_type;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => onSelect && onSelect({ ...rec, media_type: mtype })}
                      title={title}
                      style={{ flexShrink: 0, width: 130, cursor: 'pointer' }}
                    >
                      <div
                        className="sc"
                        style={{ width: 130, height: 195, display: 'block' }}
                      >
                        {poster
                          ? <img src={poster} alt={title} loading="lazy" decoding="async" />
                          : <div className="shim" style={{ width: '100%', height: '100%' }} />
                        }
                      </div>
                      <p style={{
                        color: '#ccc', fontSize: 12, fontWeight: 600, marginTop: 6,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {title}
                      </p>
                      {rec.vote_average > 0 && (
                        <p style={{ color: '#666', fontSize: 11, marginTop: 2 }}>
                          ★ {rec.vote_average?.toFixed(1)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => scrollRec('r')}
                aria-label="Scroll right"
                style={{
                  position: 'absolute', top: 0, bottom: 0, right: 0, zIndex: 2,
                  background: 'linear-gradient(to left, rgba(24,24,24,.92), transparent)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  padding: '0 14px', display: 'flex', alignItems: 'center',
                }}
              >
                <ChevronRight size={26} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
