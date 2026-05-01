import { memo } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { img } from '../../constants/api';

const DOT_STYLE = (active) => ({
  display:      'inline-block',   /* span — no browser min-height */
  width:        active ? 22 : 8,
  height:       8,
  borderRadius: active ? 4 : '50%',
  background:   active ? '#e50914' : 'rgba(255,255,255,.45)',
  cursor:       'pointer',
  flexShrink:   0,
  transition:   'all .35s ease',
});

const HeroCarousel = memo(({ items, activeIdx, setActiveIdx, onPlay, onSelect }) => {
  const prev = () => setActiveIdx(i => (i - 1 + items.length) % items.length);
  const next = () => setActiveIdx(i => (i + 1) % items.length);

  if (!items.length) {
    return (
      <div style={{ position: 'relative', height: '88vh', minHeight: 480, background: '#0d0d0d', marginBottom: -80 }}>
        <div className="shim" style={{ width: '100%', height: '100%', position: 'absolute' }} />
      </div>
    );
  }

  return (
    <div
      className="hero-wrap"
      style={{ position: 'relative', height: '88vh', minHeight: 480, marginBottom: -80, overflow: 'hidden' }}
    >
      {/* Slides */}
      {items.map((fi, i) => (
        <div key={fi.id} className={`hero-slide ${i === activeIdx ? 'active' : 'hidden'}`}>
          <img
            src={img('original', fi.backdrop_path)}
            alt={fi.title || fi.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.9) 20%, rgba(0,0,0,.1) 65%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,.55) 30%, transparent 60%)' }} />

          <div style={{ position: 'absolute', bottom: '22%', left: '4%', maxWidth: 560 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14, background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.38)', padding: '4px 12px', borderRadius: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e50914' }} />
              <span style={{ color: '#ff7070', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                {fi.media_type === 'tv' ? 'Series' : 'Movie'} · #{i + 1} Trending
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(42px,6.5vw,80px)', color: '#fff', lineHeight: .94, letterSpacing: 2, marginBottom: 14, textShadow: '0 2px 24px rgba(0,0,0,.6)' }}>
              {fi.title || fi.name}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className="b-match">{Math.round((fi.vote_average || 0) * 10)}% Match</span>
              <span style={{ color: '#aaa', fontSize: 14 }}>{(fi.release_date || fi.first_air_date || '').slice(0, 4)}</span>
              <span className="badge b-hd">HD</span>
              <span className="badge b-rt">★ {fi.vote_average?.toFixed(1)}</span>
            </div>

            {/* Overview */}
            <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 15, lineHeight: 1.65, marginBottom: 24, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {fi.overview}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="hbtn pl" onClick={() => onPlay(fi)}>
                <Play size={20} fill="#000" /> Play
              </button>
              <button className="hbtn nf" onClick={() => onSelect(fi)}>
                <Info size={20} /> More Info
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      {items.length > 1 && (
        <>
          <button className="hero-nav prev" onClick={prev} aria-label="Previous">
            <ChevronLeft size={22} />
          </button>
          <button className="hero-nav next" onClick={next} aria-label="Next">
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {items.length > 1 && (
        <div style={{ position: 'absolute', bottom: '10%', left: '4%', display: 'flex', alignItems: 'center', gap: 8, zIndex: 8 }}>
          {items.map((_, i) => (
            <span
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`Slide ${i + 1}`}
              style={DOT_STYLE(i === activeIdx)}
              onClick={() => setActiveIdx(i)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActiveIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

HeroCarousel.displayName = 'HeroCarousel';
export default HeroCarousel;
