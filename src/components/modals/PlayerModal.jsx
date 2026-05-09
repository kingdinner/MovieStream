import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * PlayerModal
 *
 * Full-screen iframe player with multi-source fallback.
 *
 * - Cycles through embedSources[] when the user hits "Try another source"
 * - Shows a "Not loading?" nudge after 10 s so the user knows to switch sources
 * - 503 / unavailable titles show a clear error state
 */
export default function PlayerModal({ selected, closeAll, embedSources = [], selSeason, selEpisode }) {
  const [srcIdx,     setSrcIdx]     = useState(0);
  const [loadError,  setLoadError]  = useState(false);
  const [loaded,     setLoaded]     = useState(false);
  const [nudge,      setNudge]      = useState(false);   // "Not loading?" hint

  const title  = selected.title || selected.name || '';
  const isTv   = selected.media_type === 'tv';
  const src    = embedSources[srcIdx] ?? '';
  const total  = embedSources.length;
  const hasNext = srcIdx < total - 1;

  /* Reset state when source changes */
  useEffect(() => {
    setLoaded(false);
    setLoadError(false);
    setNudge(false);
  }, [srcIdx]);

  /* Show "Not loading?" nudge 5 s after switching to a source */
  useEffect(() => {
    if (loaded || loadError) return;
    const t = setTimeout(() => setNudge(true), 5000);
    return () => clearTimeout(t);
  }, [srcIdx, loaded, loadError]);

  // Called both by onError (auto) and by the manual "Try Source N" button.
  const tryNext = () => {
    if (hasNext) {
      setSrcIdx(i => i + 1);   // resets loaded/loadError/nudge via the effect above
    } else {
      setLoadError(true);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000', zIndex: 500,
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 20px',
        background: 'rgba(0,0,0,.95)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        flexShrink: 0,
      }}>
        {/* Back */}
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

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
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

        {/* Source selector */}
        {total > 1 && !loadError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ color: '#666', fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
              Source
            </span>
            {embedSources.map((_, i) => (
              <button
                key={i}
                onClick={() => setSrcIdx(i)}
                title={`Source ${i + 1}`}
                style={{
                  width: 30, height: 30, borderRadius: 6,
                  border: `1.5px solid ${i === srcIdx ? '#e50914' : 'rgba(255,255,255,.2)'}`,
                  background: i === srcIdx ? 'rgba(229,9,20,.18)' : 'rgba(255,255,255,.06)',
                  color: i === srcIdx ? '#ff7070' : '#aaa',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  fontFamily: "'DM Sans',sans-serif",
                  transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Video area ── */}
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>

        {/* All-sources-failed overlay */}
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
            <p style={{ color: '#888', fontSize: 14, fontFamily: "'DM Sans',sans-serif", textAlign: 'center', maxWidth: 320 }}>
              This title isn't available on any of our sources right now.
            </p>
            <button className="hbtn nf" onClick={closeAll} style={{ marginTop: 8 }}>
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        )}

        {/* Loading shimmer */}
        {!loaded && !loadError && (
          <div className="shim" style={{ position: 'absolute', inset: 0 }} />
        )}

        {/* "Not loading?" nudge — shown after 5 s if video hasn't started */}
        {nudge && !loadError && hasNext && (
          <div style={{
            position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            zIndex: 6, background: 'rgba(0,0,0,.92)',
            border: '1px solid rgba(255,255,255,.15)', borderRadius: 10,
            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap',
          }}>
            <span style={{ color: '#aaa', fontSize: 14 }}>
              Source {srcIdx + 1} not responding
            </span>
            <button
              onClick={tryNext}
              style={{
                background: '#e50914', border: 'none', borderRadius: 6,
                color: '#fff', fontSize: 13, fontWeight: 700,
                padding: '7px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <RefreshCw size={13} /> Try Source {srcIdx + 2}
            </button>
          </div>
        )}

        <iframe
          key={src}
          src={src}
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
          onError={tryNext}
        />
      </div>
    </div>
  );
}
