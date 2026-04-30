import { useEffect, useRef } from 'react';
import { SHOW_ADS, ADSENSE_CLIENT } from '../../constants/api';

const IS_PLACEHOLDER = ADSENSE_CLIENT === 'ca-pub-XXXXXXXXXXXXXXXX';

/**
 * AdUnit
 * ──────
 * Renders a Google AdSense ad unit (or a visible dev placeholder).
 *
 * Props:
 *   slot      — 10-digit AdSense slot ID from AD_SLOTS in constants/api.js
 *   format    — AdSense format string (default: 'auto')
 *   style     — extra styles on the outer wrapper
 *   label     — optional text shown in the dev placeholder (e.g. "Top Banner")
 *
 * When SHOW_ADS = false  → renders nothing (null).
 * When publisher ID is still placeholder → renders a labelled grey box so you
 *   can see exactly where ads will appear during development.
 * When publisher ID is real → renders the live AdSense <ins> tag.
 */
export default function AdUnit({ slot, format = 'auto', style = {}, label = 'Advertisement' }) {
  const insRef = useRef(null);

  useEffect(() => {
    if (!SHOW_ADS || IS_PLACEHOLDER) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push failed:', e);
    }
  }, []);

  if (!SHOW_ADS) return null;

  return (
    <div style={{
      textAlign: 'center',
      padding: '8px 0',
      ...style,
    }}>
      {/* Dev placeholder — replace with real AdSense once publisher ID is set */}
      {IS_PLACEHOLDER ? (
        <div style={{
          display: 'inline-flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          width: '100%', minHeight: 90,
          background: 'rgba(255,255,255,.04)',
          border: '1px dashed rgba(255,255,255,.15)',
          borderRadius: 6, padding: '12px 0', gap: 6,
        }}>
          <span style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase' }}>
            Ad Placeholder
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.2)' }}>
            Set ADSENSE_CLIENT in src/constants/api.js to go live
          </span>
        </div>
      ) : (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
