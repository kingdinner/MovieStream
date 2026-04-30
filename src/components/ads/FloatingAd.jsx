import { useState } from 'react';
import { X } from 'lucide-react';
import { SHOW_ADS, AD_SLOTS } from '../../constants/api';
import AdUnit from './AdUnit';

/**
 * FloatingAd
 * ──────────
 * Sticky 300×250 ad that sits in the bottom-right corner.
 * The user can dismiss it for the session by clicking ✕.
 *
 * Returns null when SHOW_ADS = false.
 */
export default function FloatingAd() {
  const [dismissed, setDismissed] = useState(false);

  if (!SHOW_ADS || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 180,
      width: 310,
      background: '#1a1a1a',
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,.7)',
      overflow: 'hidden',
      animation: 'floatIn .35s ease',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px',
        background: 'rgba(0,0,0,.4)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
      }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: 1, textTransform: 'uppercase' }}>
          Sponsored
        </span>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,.4)', display: 'flex',
            alignItems: 'center', padding: 2,
            transition: 'color .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.4)'; }}
          aria-label="Close ad"
        >
          <X size={14} />
        </button>
      </div>

      {/* Ad unit */}
      <AdUnit
        slot={AD_SLOTS.floating}
        format="rectangle"
        label="Floating Ad (300×250)"
        style={{ padding: 8 }}
      />
    </div>
  );
}
