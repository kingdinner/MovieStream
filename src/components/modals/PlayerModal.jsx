import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertTriangle, RefreshCw, SkipBack, SkipForward } from 'lucide-react';

/**
 * PlayerModal
 *
 * Full-screen iframe player with:
 *  - Multi-source fallback (cycles through embedSources[])
 *  - "Not loading?" nudge after 5 s
 *  - ← Prev Episode / Next Episode → navigation for TV shows
 *  - Responsive layout (mobile / desktop / smart TV)
 */
export default function PlayerModal({
  selected,
  closeAll,
  embedSources = [],
  selSeason,
  selEpisode,
  episodes = [],
  setSelEpisode,
}) {
  const [srcIdx,    setSrcIdx]    = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const [nudge,     setNudge]     = useState(false);

  const iframeRef = useRef(null);

  const title  = selected.title || selected.name || '';
  const isTv   = selected.media_type === 'tv';
  const src    = embedSources[srcIdx] ?? '';
  const total  = embedSources.length;
  const hasNext = srcIdx < total - 1;

  /* Episode navigation helpers (TV only) */
  const currentEpIdx = isTv
    ? episodes.findIndex(ep => ep.episode_number === selEpisode)
    : -1;
  const hasPrevEp = isTv && currentEpIdx > 0;
  const hasNextEp = isTv && currentEpIdx >= 0 && currentEpIdx < episodes.length - 1;

  const goPrevEp = () => {
    if (!hasPrevEp) return;
    setSrcIdx(0);
    setSelEpisode(episodes[currentEpIdx - 1].episode_number);
  };

  const goNextEp = () => {
    if (!hasNextEp) return;
    setSrcIdx(0);
    setSelEpisode(episodes[currentEpIdx + 1].episode_number);
  };

  /* Reset state when source index changes */
  useEffect(() => {
    setLoaded(false);
    setLoadError(false);
    setNudge(false);
  }, [srcIdx]);

  /* Reset source index when episode changes */
  useEffect(() => {
    setSrcIdx(0);
  }, [selEpisode]);

  /*
   * Show "Try another source" nudge after 8 s regardless of whether the
   * iframe fired onLoad — embed players often load their own error pages
   * (e.g. "This media is unavailable") which still trigger onLoad, so we
   * cannot rely on the loaded flag alone to decide if playback is healthy.
   */
  useEffect(() => {
    if (loadError) return;
    const t = setTimeout(() => setNudge(true), 8000);
    return () => clearTimeout(t);
  }, [srcIdx, loadError]);

  /* Keyboard: left/right arrow = prev/next episode */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  goPrevEp();
      if (e.key === 'ArrowRight') goNextEp();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpIdx, episodes]);

  const tryNext = () => {
    if (hasNext) {
      setSrcIdx(i => i + 1);
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
      <div
        className="player-bar"
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 20px',
          background: 'rgba(0,0,0,.95)',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
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
          <div className="player-src-btns" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ color: '#666', fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
              Source
            </span>
            {embedSources.map((_, i) => (
              <button
                key={i}
                onClick={() => { setSrcIdx(i); setNudge(false); }}
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

        {/* "Not loading?" nudge */}
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
          ref={iframeRef}
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

      {/* ── Episode navigation bar (TV only) ── */}
      {isTv && (hasPrevEp || hasNextEp) && (
        <div
          className="player-ep-bar"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 20px',
            background: 'rgba(0,0,0,.95)',
            borderTop: '1px solid rgba(255,255,255,.08)',
            flexShrink: 0, gap: 12,
          }}
        >
          {/* Prev Episode */}
          <button
            onClick={goPrevEp}
            disabled={!hasPrevEp}
            aria-label="Previous episode"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: hasPrevEp ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.03)',
              border: `1.5px solid ${hasPrevEp ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.08)'}`,
              borderRadius: 8, color: hasPrevEp ? '#fff' : '#444',
              padding: '9px 18px', cursor: hasPrevEp ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600,
              transition: 'all .18s',
            }}
            onMouseEnter={e => { if (hasPrevEp) e.currentTarget.style.background = 'rgba(255,255,255,.2)'; }}
            onMouseLeave={e => { if (hasPrevEp) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
          >
            <SkipBack size={16} />
            <span>Prev Episode</span>
          </button>

          {/* Current episode indicator */}
          <span style={{
            color: '#888', fontSize: 13, fontFamily: "'DM Sans',sans-serif",
            textAlign: 'center', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {episodes[currentEpIdx]?.name
              ? `E${selEpisode} · ${episodes[currentEpIdx].name}`
              : `Season ${selSeason} · Episode ${selEpisode}`}
          </span>

          {/* Next Episode */}
          <button
            onClick={goNextEp}
            disabled={!hasNextEp}
            aria-label="Next episode"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: hasNextEp ? 'rgba(229,9,20,.15)' : 'rgba(255,255,255,.03)',
              border: `1.5px solid ${hasNextEp ? 'rgba(229,9,20,.4)' : 'rgba(255,255,255,.08)'}`,
              borderRadius: 8, color: hasNextEp ? '#ff7070' : '#444',
              padding: '9px 18px', cursor: hasNextEp ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600,
              transition: 'all .18s',
            }}
            onMouseEnter={e => { if (hasNextEp) e.currentTarget.style.background = 'rgba(229,9,20,.28)'; }}
            onMouseLeave={e => { if (hasNextEp) e.currentTarget.style.background = 'rgba(229,9,20,.15)'; }}
          >
            <span>Next Episode</span>
            <SkipForward size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
