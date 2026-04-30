import { useState, useEffect, useCallback } from 'react';
import { SHOW_ADS, AD_SLOTS, INTERSTITIAL_SKIP_AFTER } from '../../constants/api';
import AdUnit from './AdUnit';

/**
 * InterstitialAd
 * ──────────────
 * Full-screen pre-play ad shown before the video player opens.
 *
 * Props:
 *   onComplete — called when the user skips or the ad finishes.
 *                The player opens immediately after this fires.
 *
 * When SHOW_ADS = false → calls onComplete on mount (transparent pass-through).
 * When INTERSTITIAL_SKIP_AFTER = 0 → "Skip Ad" button is available instantly.
 */
export default function InterstitialAd({ onComplete }) {
  const [seconds, setSeconds] = useState(INTERSTITIAL_SKIP_AFTER);

  /* If ads are disabled, skip immediately */
  useEffect(() => {
    if (!SHOW_ADS) { onComplete(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Countdown timer */
  useEffect(() => {
    if (!SHOW_ADS) return;
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  if (!SHOW_ADS) return null;

  const canSkip = seconds <= 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: 'rgba(0,0,0,.96)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Header bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(0,0,0,.7)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}>
        <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, letterSpacing: 1 }}>
          YOUR VIDEO WILL START AFTER THIS AD
        </span>

        {/* Skip button */}
        <button
          onClick={canSkip ? handleSkip : undefined}
          style={{
            background: canSkip ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.2)',
            color: canSkip ? '#fff' : 'rgba(255,255,255,.4)',
            padding: '7px 18px',
            borderRadius: 4,
            cursor: canSkip ? 'pointer' : 'not-allowed',
            fontSize: 13,
            fontFamily: "'DM Sans',sans-serif",
            fontWeight: 600,
            transition: 'all .18s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          aria-label={canSkip ? 'Skip Ad' : `Skip available in ${seconds}s`}
        >
          {canSkip ? 'Skip Ad ›' : `Skip in ${seconds}s`}
        </button>
      </div>

      {/* Ad unit */}
      <div style={{
        width: '100%', maxWidth: 640,
        background: 'rgba(255,255,255,.04)',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,.08)',
        padding: 8,
      }}>
        <AdUnit
          slot={AD_SLOTS.interstitial}
          format="rectangle"
          label="Pre-Play Interstitial (300×250)"
          style={{ minHeight: 260 }}
        />
      </div>

      {/* Progress bar */}
      {!canSkip && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: 'rgba(255,255,255,.1)',
        }}>
          <div style={{
            height: '100%',
            background: '#e50914',
            width: `${((INTERSTITIAL_SKIP_AFTER - seconds) / INTERSTITIAL_SKIP_AFTER) * 100}%`,
            transition: 'width 1s linear',
          }} />
        </div>
      )}
    </div>
  );
}
