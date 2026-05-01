import { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

/**
 * PlayerModal
 *
 * Full-screen iframe player.
 * - Top bar is always visible (high z-index, no hover needed) — works on Smart TV
 * - Tracks iframe load; shows "not available" if it fails
 */
export default function PlayerModal({ selected, closeAll, embedSrc, selSeason, selEpisode }) {
  const [loadError, setLoadError] = useState(false);
  const [loaded,    setLoaded]    = useState(false);

  const title = selected.title || selected.name || '';
  const isTv  = selected.media_type === 'tv';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000', zIndex: 500,
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Top bar — always on top, never hidden ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 20px',
        background: 'rgba(0,0,0,.95)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        flexShrink: 0,
      }}>
        <button
          onClick={closeAll}
          aria-label="Back"
          style={{
            background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.2)',
            borderRadius: '50%', width: 46, height: 46,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', flexShrink: 0,
            transition: 'background .18s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
        >
          <ArrowLeft size={22} />
        </button>

        <div style={{ minWidth: 0 }}>
          <p style={{
            color: '#fff', fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700, fontSize: 16, lineHeight: 1.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {title}
          </p>
          {isTv && (
            <p style={{ color: '#aaa', fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginTop: 2 }}>
              Season {selSeason} · Episode {selEpisode}
            </p>
          )}
        </div>
      </div>

      {/* ── Video area ── */}
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>

        {/* Not-available overlay */}
        {loadError && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 5,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <AlertTriangle size={48} color="#e50914" />
            <p style={{
              color: '#fff', fontFamily: "'DM Sans',sans-serif",
              fontSize: 20, fontWeight: 700, textAlign: 'center',
            }}>
              Video not available
            </p>
            <p style={{ color: '#888', fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>
              This title isn't available to stream right now.
            </p>
            <button
              className="hbtn nf"
              onClick={closeAll}
              style={{ marginTop: 8 }}
            >
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        )}

        {/* Loading shimmer */}
        {!loaded && !loadError && (
          <div className="shim" style={{ position: 'absolute', inset: 0 }} />
        )}

        <iframe
          key={embedSrc}
          src={embedSrc}
          title={`${title} — Player`}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            border: 'none',
            opacity: loaded && !loadError ? 1 : 0,
            transition: 'opacity .3s',
          }}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setLoadError(true); }}
        />
      </div>
    </div>
  );
}
