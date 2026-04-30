import { ArrowLeft } from 'lucide-react';

/**
 * PlayerModal
 *
 * Full-screen iframe player. Shown when the user hits Play.
 */
export default function PlayerModal({ selected, closeAll, embedSrc, selSeason, selEpisode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000', zIndex: 500,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', background: 'rgba(0,0,0,.9)',
      }}>
        <button
          onClick={closeAll}
          style={{
            background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#fff',
          }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <span style={{ color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 15 }}>
          {selected.title || selected.name}
          {selected.media_type === 'tv' && ` · S${selSeason} E${selEpisode}`}
        </span>
      </div>

      {/* Video iframe */}
      <iframe
        src={embedSrc}
        title={`${selected.title || selected.name} — Video Player`}
        style={{ flex: 1, border: 'none', width: '100%' }}
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
      />
    </div>
  );
}
