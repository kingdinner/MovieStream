import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  Play, Info, ChevronLeft, ChevronRight, X, Search,
  Home as HomeIcon, Film, Tv, Star, Plus, Check,
  Bell, BookMarked, ArrowLeft
} from 'lucide-react';

/* ─────────────── CONSTANTS ─────────────── */
const API_KEY  = 'b8d6458a6244de711c4934b1896ac164';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG      = 'https://image.tmdb.org/t/p';
const img      = (size, path) => path ? `${IMG}/${size}${path}` : null;

const ROW_CONFIGS = [
  { key:'trending_movies',  title:'🔥 Trending Movies',   landscape:true,  tab:'movies', url:`${BASE_URL}/trending/movie/week` },
  { key:'top_movies',       title:'⭐ Top Rated Movies',   landscape:false, tab:'movies', url:`${BASE_URL}/movie/top_rated` },
  { key:'action',           title:'💥 Action & Adventure', landscape:false, tab:'movies', url:`${BASE_URL}/discover/movie?with_genres=28&sort_by=popularity.desc` },
  { key:'thriller',         title:'😰 Thrillers',          landscape:false, tab:'movies', url:`${BASE_URL}/discover/movie?with_genres=53&sort_by=popularity.desc` },
  { key:'horror',           title:'👻 Horror',             landscape:false, tab:'movies', url:`${BASE_URL}/discover/movie?with_genres=27&sort_by=popularity.desc` },
  { key:'scifi',            title:'🚀 Sci-Fi',             landscape:true,  tab:'movies', url:`${BASE_URL}/discover/movie?with_genres=878&sort_by=popularity.desc` },
  { key:'comedy',           title:'😂 Comedies',           landscape:false, tab:'movies', url:`${BASE_URL}/discover/movie?with_genres=35&sort_by=popularity.desc` },
  { key:'trending_tv',      title:'📺 Trending TV Shows',  landscape:true,  tab:'tv',     url:`${BASE_URL}/trending/tv/week` },
  { key:'top_tv',           title:'🏆 Top Rated Series',   landscape:false, tab:'tv',     url:`${BASE_URL}/tv/top_rated` },
  { key:'anime',            title:'🎌 Anime',              landscape:false, tab:'tv',     url:`${BASE_URL}/discover/tv?with_genres=16&sort_by=popularity.desc` },
];

/* ─────────────── GLOBAL STYLES ─────────────── */
const injectStyles = () => {
  if (document.getElementById('stream-styles')) return;
  const el = document.createElement('style');
  el.id = 'stream-styles';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #000; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { display: none; }
    * { scrollbar-width: none; -ms-overflow-style: none; }

    /* ── Cards ── */
    .sc { position:relative; flex-shrink:0; cursor:pointer; border-radius:6px; overflow:hidden; outline:none; }
    .sc img { display:block; width:100%; height:100%; object-fit:cover; transition:transform .35s ease; }
    .sc:focus, .sc:focus-visible { box-shadow: 0 0 0 3px #e50914; }
    .sc:hover img, .sc:focus img { transform:scale(1.06); }
    .sc .ov { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.96) 0%, rgba(0,0,0,.25) 55%, transparent 100%); opacity:0; transition:opacity .25s; display:flex; flex-direction:column; justify-content:flex-end; padding:12px; pointer-events:none; }
    .sc:hover .ov, .sc:focus .ov { opacity:1; pointer-events:all; }
    .sc .ov .ca { display:flex; gap:7px; margin-bottom:7px; }
    .cbtn { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,255,255,.75); background:rgba(0,0,0,.45); cursor:pointer; color:#fff; transition:all .15s; flex-shrink:0; }
    .cbtn.pl { background:#fff; border-color:#fff; color:#000; }
    .cbtn:hover, .cbtn:focus { border-color:#fff; background:rgba(255,255,255,.25); outline:none; }
    .cbtn.pl:hover, .cbtn.pl:focus { background:rgba(255,255,255,.82); }
    .cbtn.added { background:#e50914; border-color:#e50914; }

    /* ── Row arrows ── */
    .rarr { position:absolute; top:0; bottom:0; z-index:10; display:flex; align-items:center; padding:0 14px; cursor:pointer; opacity:0; transition:opacity .25s; color:#fff; border:none; background:linear-gradient(to right,rgba(0,0,0,.85),transparent); min-width:72px; justify-content:center; }
    .rarr.r { right:0; background:linear-gradient(to left,rgba(0,0,0,.85),transparent); }
    .rw:hover .rarr, .rw:focus-within .rarr { opacity:1; }
    .rarr svg { filter:drop-shadow(0 0 6px rgba(0,0,0,.8)); }

    /* ── Buttons ── */
    .hbtn { display:inline-flex; align-items:center; gap:9px; padding:11px 26px; border-radius:5px; font-family:'DM Sans',sans-serif; font-size:16px; font-weight:600; cursor:pointer; border:none; transition:all .18s; white-space:nowrap; }
    .hbtn.pl { background:#fff; color:#000; }
    .hbtn.pl:hover,.hbtn.pl:focus { background:rgba(255,255,255,.82); outline:none; }
    .hbtn.nf { background:rgba(109,109,110,.7); color:#fff; }
    .hbtn.nf:hover,.hbtn.nf:focus { background:rgba(109,109,110,.5); outline:none; }

    /* ── Nav ── */
    .ni { display:inline-flex; align-items:center; justify-content:center; gap:6px; height:36px; padding:0 10px; font-size:14px; font-weight:500; color:rgba(255,255,255,.7); background:none; border:none; cursor:pointer; transition:color .18s; font-family:'DM Sans',sans-serif; position:relative; white-space:nowrap; line-height:1; }
    .ni.act { color:#fff; }
    .ni.act::after { content:''; position:absolute; bottom:-6px; left:10px; right:10px; height:2px; background:#e50914; border-radius:1px; }
    .ni:hover,.ni:focus { color:#fff; outline:none; }
    .ni svg { display:block; }

    /* ── Modal ── */
    .moverlay { position:fixed; inset:0; background:rgba(0,0,0,.82); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; animation:fi .22s ease; }
    @keyframes fi { from{opacity:0} to{opacity:1} }
    .mbox { background:#181818; border-radius:12px; max-width:880px; width:100%; max-height:92vh; overflow-y:auto; position:relative; animation:su .28s cubic-bezier(.25,.46,.45,.94); }
    @keyframes su { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }

    /* ── Episode btn ── */
    .epb { display:flex; align-items:center; gap:12px; background:rgba(255,255,255,.07); border:none; border-radius:5px; padding:11px 14px; width:100%; text-align:left; cursor:pointer; transition:background .18s; color:#fff; font-family:'DM Sans',sans-serif; }
    .epb:hover,.epb:focus { background:rgba(255,255,255,.15); outline:none; }
    .epb.playing { background:rgba(229,9,20,.18); border:1px solid rgba(229,9,20,.4); }

    /* ── Misc ── */
    .badge { display:inline-block; padding:2px 8px; border-radius:3px; font-size:12px; font-weight:600; }
    .b-hd   { background:rgba(255,255,255,.13); color:#ccc; border:1px solid rgba(255,255,255,.18); }
    .b-rt   { background:rgba(229,9,20,.13); color:#ff7070; border:1px solid rgba(229,9,20,.28); }
    .b-match{ color:#46d369; font-weight:700; font-size:14px; }
    @keyframes sh { 0%,100%{opacity:.35} 50%{opacity:.7} }
    .shim { animation:sh 1.4s ease-in-out infinite; background:#1c1c1c; }
    .toast { position:fixed; bottom:32px; left:50%; transform:translateX(-50%); background:#fff; color:#000; padding:10px 22px; border-radius:24px; font-weight:600; font-size:14px; z-index:999; animation:toastin .3s ease; pointer-events:none; white-space:nowrap; }
    @keyframes toastin { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

    /* ── Search input ── */
    .sinput { background:rgba(0,0,0,.8); border:1.5px solid rgba(255,255,255,.7); color:#fff; padding:8px 14px 8px 38px; font-size:14px; font-family:'DM Sans',sans-serif; border-radius:3px; width:210px; outline:none; }
    .sinput::placeholder { color:rgba(255,255,255,.45); }
    .sinput:focus { border-color:#fff; }

    /* ── Select ── */
    .sels { background:#2a2a2a; color:#fff; border:1.5px solid rgba(255,255,255,.18); padding:8px 14px; border-radius:4px; font-size:14px; font-family:'DM Sans',sans-serif; cursor:pointer; outline:none; }

    /* ── Pagination ── */
    .pgbtn { background:rgba(255,255,255,.1); border:2px solid rgba(255,255,255,.25); color:#fff; padding:13px 26px; border-radius:8px; cursor:pointer; font-size:16px; font-weight:600; font-family:'DM Sans',sans-serif; transition:all .18s; min-width:52px; }
    .pgbtn:hover,.pgbtn:focus { background:rgba(255,255,255,.22); border-color:rgba(255,255,255,.5); outline:none; transform:translateY(-1px); }
    .pgbtn.act { background:#e50914; border-color:#e50914; }
    .pgbtn:disabled { opacity:.3; cursor:not-allowed; transform:none; }

    /* ── Smart TV / large screen ── */
    @media (min-width:1920px) {
      .ni { font-size:18px; padding:10px 6px; }
      .hbtn { font-size:20px; padding:14px 34px; }
      .cbtn { width:40px; height:40px; }
      .sinput { width:270px; font-size:16px; }
      .rarr { min-width:60px; }
    }
    @media (max-width:640px) {
      .ni span.nl { display:none; }
      .hbtn { padding:9px 16px; font-size:14px; }
    }
  `;
  document.head.appendChild(el);
};

/* ─────────────── CARD COMPONENTS (outside App = no re-create) ─────────────── */
const ContentCard = memo(({ item, onSelect, onPlay, onToggleList, inList }) => {
  const poster = img('w342', item.poster_path);
  const title  = item.title || item.name || '';
  const year   = (item.release_date || item.first_air_date || '').slice(0, 4);

  const handlePlay = (e) => { e.stopPropagation(); onPlay(item); };
  const handleList = (e) => { e.stopPropagation(); onToggleList(item); };
  const handleKey  = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } };

  return (
    <div
      style={{ width: 155, flexShrink: 0, cursor: 'pointer', outline: 'none' }}
      onClick={() => onSelect(item)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      {/* Image portion — clips the scale effect */}
      <div className="sc" style={{ width: 155, height: 232, display: 'block' }}>
        {poster
          ? <img src={poster} alt={title} loading="lazy" decoding="async" />
          : <div className="shim" style={{ width: '100%', height: '100%' }} />
        }
        <div className="ov">
          <div className="ca">
            <button className="cbtn pl" onClick={handlePlay} aria-label={`Play ${title}`} title="Play">
              <Play size={13} fill="#000" />
            </button>
            <button className={`cbtn ${inList ? 'added' : ''}`} onClick={handleList} aria-label={inList ? 'Remove from My List' : 'Add to My List'} title={inList ? 'Remove' : 'Add to list'}>
              {inList ? <Check size={13} /> : <Plus size={13} />}
            </button>
          </div>
        </div>
      </div>
      {/* Always-visible title + meta below image */}
      <div style={{ padding: '8px 2px 4px' }}>
        <p style={{ color: '#e5e5e5', fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Star size={10} fill="#f5c518" color="#f5c518" />
          <span style={{ color: '#999', fontSize: 11 }}>{item.vote_average?.toFixed(1)}</span>
          {year && <><span style={{ color: '#444', fontSize: 11 }}>·</span><span style={{ color: '#777', fontSize: 11 }}>{year}</span></>}
        </div>
      </div>
    </div>
  );
});

const LandscapeCard = memo(({ item, onSelect, onPlay, onToggleList, inList }) => {
  const backdrop = img('w500', item.backdrop_path) || img('w342', item.poster_path);
  const title    = item.title || item.name || '';

  const handlePlay = (e) => { e.stopPropagation(); onPlay(item); };
  const handleList = (e) => { e.stopPropagation(); onToggleList(item); };
  const handleKey  = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(item); } };

  return (
    <div
      style={{ width: 268, flexShrink: 0, cursor: 'pointer', outline: 'none' }}
      onClick={() => onSelect(item)}
      onKeyDown={handleKey}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      <div className="sc" style={{ width: 268, height: 151, display: 'block' }}>
        {backdrop
          ? <img src={backdrop} alt={title} loading="lazy" decoding="async" />
          : <div className="shim" style={{ width: '100%', height: '100%' }} />
        }
        <div className="ov">
          <div className="ca">
            <button className="cbtn pl" onClick={handlePlay} aria-label={`Play ${title}`} title="Play">
              <Play size={13} fill="#000" />
            </button>
            <button className={`cbtn ${inList ? 'added' : ''}`} onClick={handleList} title={inList ? 'Remove' : 'Add'}>
              {inList ? <Check size={13} /> : <Plus size={13} />}
            </button>
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 2px 4px' }}>
        <p style={{ color: '#e5e5e5', fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Star size={10} fill="#f5c518" color="#f5c518" />
          <span style={{ color: '#999', fontSize: 11 }}>{item.vote_average?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
});

/* ─────────────── CONTENT ROW ─────────────── */
const ContentRow = memo(({ title, items, landscape, onSelect, onPlay, onToggleList, myList, onViewAll }) => {
  const ref = useRef(null);
  const scroll = useCallback((dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'l' ? -860 : 860, behavior: 'smooth' });
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4% 10px' }}>
        <h3 style={{ color: '#e5e5e5', fontFamily: "'DM Sans',sans-serif", fontSize: 'clamp(16px,1.8vw,22px)', fontWeight: 700 }}>{title}</h3>
        <button onClick={() => onViewAll(title)} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0', fontFamily: "'DM Sans',sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color='#fff'}
          onMouseLeave={e => e.currentTarget.style.color='#aaa'}
        >
          View All <ChevronRight size={14} />
        </button>
      </div>
      <div className="rw" style={{ position: 'relative' }}>
        <button className="rarr" onClick={() => scroll('l')} aria-label="Scroll left"><ChevronLeft size={44} /></button>
        <div ref={ref} style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 4% 12px' }}>
          {items.map(item => (
            landscape
              ? <LandscapeCard key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
              : <ContentCard   key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
          ))}
        </div>
        <button className="rarr r" onClick={() => scroll('r')} aria-label="Scroll right"><ChevronRight size={44} /></button>
      </div>
    </section>
  );
});

/* ─────────────── VIEW ALL PAGE ─────────────── */
const ViewAllPage = memo(({ title, landscape, myList, onSelect, onPlay, onToggleList, onClose, rowKey }) => {
  const [items, setItems]   = useState([]);
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(1);
  const [loading, setLoading] = useState(false);

  const cfg = ROW_CONFIGS.find(r => r.title === title);

  const load = useCallback(async (p) => {
    if (!cfg) return;
    setLoading(true);
    try {
      const sep = cfg.url.includes('?') ? '&' : '?';
      const res = await fetch(`${cfg.url}${sep}api_key=${API_KEY}&page=${p}`);
      const data = await res.json();
      setItems(data.results || []);
      setTotal(Math.min(data.total_pages || 1, 20));
    } catch(e) { console.error(e); }
    setLoading(false);
  }, [cfg]);

  useEffect(() => { load(page); }, [page, load]);

  const pages = useMemo(() => {
    const arr = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(total, page + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, total]);

  return (
    <div style={{ position: 'fixed', top: 66, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 80, overflowY: 'auto', padding: '0 4% 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0 22px', position: 'sticky', top: 0, background: 'rgba(0,0,0,.95)', zIndex: 10, backdropFilter: 'blur(8px)' }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}
          aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#fff', letterSpacing: 1 }}>{title}</h2>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: landscape ? 'repeat(auto-fill, minmax(268px, 1fr))' : 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
          {Array.from({length:20}).map((_,i) => (
            <div key={i} className="shim" style={{ height: landscape ? 151 : 232, borderRadius: 6 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: landscape ? 'repeat(auto-fill, minmax(268px, 1fr))' : 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
          {items.map(item => (
            landscape
              ? <LandscapeCard key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
              : <ContentCard   key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 52, flexWrap: 'wrap' }}>
        <button className="pgbtn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹ Prev</button>
        {page > 3 && <><button className="pgbtn" onClick={() => setPage(1)}>1</button><span style={{ color: '#555' }}>…</span></>}
        {pages.map(p => (
          <button key={p} className={`pgbtn ${p === page ? 'act' : ''}`} onClick={() => setPage(p)}>{p}</button>
        ))}
        {page < total - 2 && <><span style={{ color: '#555' }}>…</span><button className="pgbtn" onClick={() => setPage(total)}>{total}</button></>}
        <button className="pgbtn" onClick={() => setPage(p => p + 1)} disabled={page === total}>Next ›</button>
      </div>
    </div>
  );
});

/* ─────────────── MY LIST PAGE ─────────────── */
const MyListPage = memo(({ myList, myListItems, onSelect, onPlay, onToggleList, onClose }) => (
  <div style={{ position: 'fixed', top: 66, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 80, overflowY: 'auto', padding: '0 4% 60px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0 22px', position: 'sticky', top: 0, background: 'rgba(0,0,0,.95)', zIndex: 10 }}>
      <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
        <ArrowLeft size={20} />
      </button>
      <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#fff', letterSpacing: 1 }}>My List</h2>
    </div>
    {myListItems.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
        <BookMarked size={56} style={{ margin: '0 auto 16px', display: 'block', opacity: .3 }} />
        <p style={{ fontSize: 18 }}>Your list is empty</p>
        <p style={{ fontSize: 14, marginTop: 8 }}>Add movies and shows by clicking the + button on any card</p>
      </div>
    ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
        {myListItems.map(item => (
          <ContentCard key={item.id} item={item} onSelect={onSelect} onPlay={onPlay} onToggleList={onToggleList} inList={myList.has(item.id)} />
        ))}
      </div>
    )}
  </div>
));

/* ─────────────── MAIN APP ─────────────── */
export default function App() {
  injectStyles();

  const [activeTab, setActiveTab]   = useState('home');
  const [featured, setFeatured]     = useState(null);
  const [rows, setRows]             = useState({});       // key → items[]
  const [selected, setSelected]     = useState(null);     // detail modal item
  const [playing, setPlaying]       = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [myList, setMyList]         = useState(() => new Set(JSON.parse(localStorage.getItem('mylist-ids') || '[]')));
  const [myListItems, setMyListItems] = useState(() => JSON.parse(localStorage.getItem('mylist-items') || '[]'));
  const [seasons, setSeasons]       = useState([]);
  const [selSeason, setSelSeason]   = useState(1);
  const [episodes, setEpisodes]     = useState([]);
  const [selEpisode, setSelEpisode] = useState(1);
  const [toast, setToast]           = useState(null);
  const [viewAllRow, setViewAllRow] = useState(null);    // { title, landscape }
  const [showMyList, setShowMyList] = useState(false);
  const [availableIds, setAvailableIds] = useState(null); // null = still loading, Set = ready
  const toastTimer = useRef(null);
  const searchTimer = useRef(null);

  /* ── Scroll ── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── Fetch VidSrc available IDs ── */
  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        const PAGES = 10; // 50 items per page → up to 500 movies + 500 TV
        const ids = new Set();

        const fetchPage = async (type, page) => {
          const res = await fetch(`https://vidsrc.xyz/${type}/latest/page-${page}.json`, { signal: AbortSignal.timeout(6000) });
          if (!res.ok) return;
          const data = await res.json();
          // VidSrc returns { result: { items: [...] } } or direct array
          const items = data?.result?.items ?? data?.items ?? (Array.isArray(data) ? data : []);
          items.forEach(item => {
            const id = item.tmdb_id || item.tmdb;
            if (id) ids.add(String(id));
          });
        };

        const tasks = [];
        for (let p = 1; p <= PAGES; p++) {
          tasks.push(fetchPage('movies', p));
          tasks.push(fetchPage('tvshows', p));
        }
        await Promise.allSettled(tasks);

        if (ids.size > 0) {
          setAvailableIds(ids);
        } else {
          // CORS blocked or empty — show everything
          setAvailableIds(new Set());
        }
      } catch {
        // Network error — show everything
        setAvailableIds(new Set());
      }
    };
    fetchAvailable();
  }, []);

  /* ── Fetch rows (staggered to reduce lag) ── */
  useEffect(() => {
    setRows({});
    setFeatured(null);
    const relevant = ROW_CONFIGS.filter(r => r.tab === activeTab || activeTab === 'home');
    let cancelled = false;

    const fetchRow = async (cfg) => {
      const sep = cfg.url.includes('?') ? '&' : '?';
      const res = await fetch(`${cfg.url}${sep}api_key=${API_KEY}&page=1`);
      const data = await res.json();
      if (cancelled) return;
      setRows(prev => ({ ...prev, [cfg.title]: (data.results || []).slice(0, 18).map(i => ({
        ...i,
        media_type: i.media_type || (cfg.tab === 'tv' ? 'tv' : 'movie')
      })) }));
    };

    // Fetch featured from trending first
    fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        const f = (d.results || []).find(i => i.backdrop_path);
        if (f) setFeatured(f);
      });

    // Stagger fetches: 2 at a time every 150ms to avoid rate limit lag
    const fetchInBatches = async () => {
      for (let i = 0; i < relevant.length; i += 2) {
        if (cancelled) return;
        await Promise.all(relevant.slice(i, i + 2).map(fetchRow));
        if (i + 2 < relevant.length) await new Promise(r => setTimeout(r, 120));
      }
    };
    fetchInBatches();

    return () => { cancelled = true; };
  }, [activeTab]);

  /* ── TV seasons ── */
  useEffect(() => {
    if (!selected || (selected.media_type !== 'tv')) return;
    fetch(`${BASE_URL}/tv/${selected.id}?api_key=${API_KEY}`)
      .then(r => r.json())
      .then(d => { setSeasons(d.seasons || []); setSelSeason(1); setSelEpisode(1); });
  }, [selected]);

  useEffect(() => {
    if (!selected || selected.media_type !== 'tv') return;
    fetch(`${BASE_URL}/tv/${selected.id}/season/${selSeason}?api_key=${API_KEY}`)
      .then(r => r.json())
      .then(d => setEpisodes(d.episodes || []));
  }, [selSeason, selected]);

  /* ── Search (debounced) ── */
  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults((data.results || []).filter(i => i.media_type === 'movie' || i.media_type === 'tv'));
    }, 350);
  }, []);

  /* ── Toast ── */
  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  /* ── Availability filter ── */
  // If availableIds is null (still loading) or empty (CORS failed) → show all
  // If it has IDs → only show items whose TMDB id is in the set
  const filterAvailable = useCallback((items) => {
    if (!availableIds || availableIds.size === 0) return items;
    return items.filter(item => availableIds.has(String(item.id)));
  }, [availableIds]);
  const toggleList = useCallback((item) => {
    setMyList(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        setMyListItems(its => {
          const updated = its.filter(i => i.id !== item.id);
          localStorage.setItem('mylist-items', JSON.stringify(updated));
          return updated;
        });
        showToast('Removed from My List');
      } else {
        next.add(item.id);
        setMyListItems(its => {
          const updated = [...its, item];
          localStorage.setItem('mylist-items', JSON.stringify(updated));
          return updated;
        });
        showToast('Added to My List ✓');
      }
      localStorage.setItem('mylist-ids', JSON.stringify([...next]));
      return next;
    });
  }, [showToast]);

  /* ── Play ── */
  const playItem = useCallback((item, ep = null) => {
    setSelected(item);
    if (ep !== null) setSelEpisode(ep);
    setPlaying(true);
    document.body.style.overflow = 'hidden';
  }, []);

  /* ── Select (detail modal) ── */
  const selectItem = useCallback((item) => {
    setSelected(item);
    setPlaying(false);
    document.body.style.overflow = 'hidden';
  }, []);

  /* ── Close ── */
  const closeAll = useCallback(() => {
    setSelected(null);
    setPlaying(false);
    document.body.style.overflow = '';
  }, []);

  /* ── Embed URL (English subtitle via ds_lang param) ── */
  const embedSrc = useMemo(() => {
    if (!selected) return '';
    const base = selected.media_type === 'tv'
      ? `https://vidsrc.xyz/embed/tv/${selected.id}/${selSeason}/${selEpisode}`
      : `https://vidsrc.xyz/embed/movie/${selected.id}`;
    return `${base}?ds_lang=en`;
  }, [selected, selSeason, selEpisode]);

  /* ── Keyboard: Escape closes ── */
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') closeAll(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [closeAll]);

  /* ── Row visibility map ── */
  const visibleRows = useMemo(() => {
    return ROW_CONFIGS.filter(r => r.tab === activeTab || activeTab === 'home');
  }, [activeTab]);

  /* ── Available featured: skip hero if not streamable ── */
  const availableFeatured = useMemo(() => {
    if (!featured) return null;
    if (!availableIds || availableIds.size === 0) return featured; // still loading or CORS fallback
    return availableIds.has(String(featured.id)) ? featured : null;
  }, [featured, availableIds]);

  /* ─────── RENDER ─────── */
  return (
    <>
      {/* View All Overlay */}
      {viewAllRow && (
        <ViewAllPage
          title={viewAllRow.title}
          landscape={viewAllRow.landscape}
          myList={myList}
          onSelect={selectItem}
          onPlay={playItem}
          onToggleList={toggleList}
          onClose={() => setViewAllRow(null)}
        />
      )}

      {/* My List Overlay */}
      {showMyList && (
        <MyListPage
          myList={myList}
          myListItems={myListItems}
          onSelect={selectItem}
          onPlay={playItem}
          onToggleList={toggleList}
          onClose={() => setShowMyList(false)}
        />
      )}

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90,
        padding: '0 4%',
        background: (scrolled || viewAllRow || showMyList) ? 'rgba(0,0,0,.97)' : 'linear-gradient(to bottom, rgba(0,0,0,.88) 0%, transparent 100%)',
        borderBottom: (viewAllRow || showMyList) ? '1px solid rgba(255,255,255,.06)' : 'none',
        transition: 'background .35s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 66,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, height: '100%' }}>
          {/* Logo */}
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, letterSpacing: 3, color: '#e50914', lineHeight: 1, userSelect: 'none', cursor: 'default', display: 'flex', alignItems: 'center', height: '100%' }}>
            KV
          </div>
          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, height: '100%' }}>
            {[
              { id: 'home',   Icon: HomeIcon, label: 'Home' },
              { id: 'movies', Icon: Film,     label: 'Movies' },
              { id: 'tv',     Icon: Tv,       label: 'TV Shows' },
            ].map(({ id, Icon, label }) => (
              <button key={id} className={`ni ${activeTab === id ? 'act' : ''}`} onClick={() => { setActiveTab(id); setViewAllRow(null); }}>
                <Icon size={15} /><span className="nl">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: '100%' }}>
          {/* Search */}
          {searchOpen ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, color: 'rgba(255,255,255,.55)', pointerEvents: 'none' }} />
              <input
                className="sinput"
                autoFocus
                placeholder="Search titles…"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}
                  style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, padding: 0 }} aria-label="Search">
              <Search size={20} />
            </button>
          )}

          {/* My List */}
          <button onClick={() => setShowMyList(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, padding: 0, position: 'relative' }} aria-label="My List">
            <BookMarked size={20} />
            {myList.size > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -4, fontSize: 10, background: '#e50914', color: '#fff', borderRadius: 8, padding: '0 5px', lineHeight: 1.6, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{myList.size}</span>
            )}
          </button>

          {/* Bell */}
          <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, padding: 0 }} aria-label="Notifications">
            <Bell size={20} />
          </button>

          {/* Avatar — click to return home */}
          <button
            onClick={() => {
              setActiveTab('home');
              setViewAllRow(null);
              setShowMyList(false);
              setSearchQuery('');
              setSearchResults([]);
              setSearchOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="Home"
            title="Home"
            style={{
              width: 34, height: 34, borderRadius: 5, flexShrink: 0,
              background: 'linear-gradient(135deg, #e50914, #8b0000)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, color: '#fff',
              cursor: 'pointer', userSelect: 'none', lineHeight: 1,
              border: 'none', padding: 0,
              transition: 'transform .15s ease, box-shadow .15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >K</button>
        </div>
      </header>

      {/* ── PLAYER MODAL ── */}
      {playing && selected && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(0,0,0,.9)' }}>
            <button onClick={closeAll} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <ArrowLeft size={20} />
            </button>
            <span style={{ color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 15 }}>
              {selected.title || selected.name}
              {selected.media_type === 'tv' && ` · S${selSeason} E${selEpisode}`}
            </span>
          </div>
          <iframe
            src={embedSrc}
            title="Video Player"
            style={{ flex: 1, border: 'none', width: '100%' }}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>
      )}

      {/* ── DETAILS MODAL ── */}
      {selected && !playing && (
        <div className="moverlay" onClick={closeAll} role="dialog" aria-modal="true">
          <div className="mbox" onClick={e => e.stopPropagation()}>
            {/* Backdrop */}
            <div style={{ position: 'relative', height: 380 }}>
              <img
                src={img('w1280', selected.backdrop_path) || img('w780', selected.poster_path)}
                alt={selected.title || selected.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #181818 4%, rgba(24,24,24,.35) 55%, transparent 100%)', borderRadius: '12px 12px 0 0' }} />
              <button onClick={closeAll} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(24,24,24,.85)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }} aria-label="Close">
                <X size={18} />
              </button>
              {/* Overlay title + actions */}
              <div style={{ position: 'absolute', bottom: 28, left: 32, right: 32 }}>
                <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(28px,4vw,44px)', color: '#fff', letterSpacing: 1, lineHeight: 1, marginBottom: 18 }}>
                  {selected.title || selected.name}
                </h2>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="hbtn pl" onClick={() => playItem(selected)}>
                    <Play size={18} fill="#000" /> Play
                  </button>
                  <button className="hbtn nf" onClick={() => toggleList(selected)} style={{ gap: 8 }}>
                    {myList.has(selected.id) ? <><Check size={18} /> In My List</> : <><Plus size={18} /> My List</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 32px 12px', display: 'grid', gridTemplateColumns: '1fr minmax(0,240px)', gap: 28 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span className="b-match">{Math.round((selected.vote_average || 0) * 10)}% Match</span>
                  <span style={{ color: '#aaa', fontSize: 14 }}>{(selected.release_date || selected.first_air_date || '').slice(0, 4)}</span>
                  <span className="badge b-hd">HD</span>
                  <span className="badge b-rt">★ {selected.vote_average?.toFixed(1)}</span>
                </div>
                <p style={{ color: '#d2d2d2', fontSize: 15, lineHeight: 1.72 }}>{selected.overview}</p>
              </div>
              <div style={{ fontSize: 13, lineHeight: 2, color: '#777' }}>
                <div><span style={{ color: '#999' }}>Type: </span>{selected.media_type === 'tv' ? 'TV Series' : 'Movie'}</div>
                {selected.vote_count > 0 && <div><span style={{ color: '#999' }}>Votes: </span>{selected.vote_count?.toLocaleString()}</div>}
                <div style={{ marginTop: 12 }}>
                  <button className="hbtn nf" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => toggleList(selected)}>
                    {myList.has(selected.id) ? <><Check size={14} /> Saved</> : <><Plus size={14} /> Save to My List</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Episodes */}
            {selected.media_type === 'tv' && (
              <div style={{ padding: '4px 32px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ color: '#fff', fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 18 }}>Episodes</h3>
                  <select className="sels" value={selSeason} onChange={e => setSelSeason(Number(e.target.value))}>
                    {seasons.filter(s => s.season_number > 0).map(s => (
                      <option key={s.id} value={s.season_number}>Season {s.season_number}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {episodes.map(ep => (
                    <button key={ep.id} className={`epb ${ep.episode_number === selEpisode ? 'playing' : ''}`}
                      onClick={() => playItem(selected, ep.episode_number)}>
                      <div style={{
                        width: 80, height: 46, borderRadius: 4, flexShrink: 0, overflow: 'hidden',
                        background: ep.still_path ? 'none' : 'rgba(255,255,255,.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                      }}>
                        {ep.still_path
                          ? <img src={img('w185', ep.still_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                          : <Play size={16} fill="#fff" color="#fff" />
                        }
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.3)' }}>
                          <Play size={14} fill="#fff" color="#fff" />
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                          E{ep.episode_number} — {ep.name}
                        </p>
                        <p style={{ color: '#777', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          {ep.overview || 'No description available.'}
                        </p>
                      </div>
                      {ep.runtime > 0 && <span style={{ color: '#666', fontSize: 12, flexShrink: 0 }}>{ep.runtime}m</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main style={{ background: '#000', minHeight: '100vh' }}>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{ padding: '90px 4% 40px' }}>
            <h2 style={{ color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 22 }}>
              Results for "{searchQuery}"
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
              {filterAvailable(searchResults).map(item => (
                <ContentCard key={item.id} item={item} onSelect={selectItem} onPlay={playItem} onToggleList={toggleList} inList={myList.has(item.id)} />
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && (
          <>
            {/* ── HERO ── */}
            {availableFeatured ? (
              <div style={{ position: 'relative', height: '88vh', minHeight: 480, marginBottom: -80 }}>
                <img
                  src={img('original', availableFeatured.backdrop_path)}
                  alt={availableFeatured.title || availableFeatured.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="eager"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.88) 25%, rgba(0,0,0,.15) 65%, transparent 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,.5) 28%, transparent 58%)' }} />
                <div style={{ position: 'absolute', bottom: '20%', left: '4%', maxWidth: 540 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14, background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.38)', padding: '4px 12px', borderRadius: 20 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e50914' }} />
                    <span style={{ color: '#ff7070', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                      {availableFeatured.media_type === 'tv' ? 'Series' : 'Movie'} · Trending
                    </span>
                  </div>
                  <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(44px,7vw,82px)', color: '#fff', lineHeight: .94, letterSpacing: 2, marginBottom: 16, textShadow: '0 2px 24px rgba(0,0,0,.6)' }}>
                    {availableFeatured.title || availableFeatured.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <span className="b-match">{Math.round((availableFeatured.vote_average || 0) * 10)}% Match</span>
                    <span style={{ color: '#aaa', fontSize: 14 }}>{(availableFeatured.release_date || availableFeatured.first_air_date || '').slice(0, 4)}</span>
                    <span className="badge b-hd">HD</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,.84)', fontSize: 15, lineHeight: 1.65, marginBottom: 26, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {availableFeatured.overview}
                  </p>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="hbtn pl" onClick={() => playItem(availableFeatured)}>
                      <Play size={20} fill="#000" /> Play
                    </button>
                    <button className="hbtn nf" onClick={() => selectItem(availableFeatured)}>
                      <Info size={20} /> More Info
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: '88vh', minHeight: 480, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="shim" style={{ width: '100%', height: '100%', position: 'absolute' }} />
              </div>
            )}

            {/* ── ROWS ── */}
            <div style={{ position: 'relative', zIndex: 2, paddingTop: 16 }}>
              {visibleRows.map(cfg => (
                <ContentRow
                  key={cfg.key}
                  title={cfg.title}
                  items={filterAvailable(rows[cfg.title] || [])}
                  landscape={cfg.landscape}
                  onSelect={selectItem}
                  onPlay={playItem}
                  onToggleList={toggleList}
                  myList={myList}
                  onViewAll={(title) => setViewAllRow({ title, landscape: cfg.landscape })}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <footer style={{ padding: '44px 4% 28px', borderTop: '1px solid rgba(255,255,255,.07)', marginTop: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#e50914', letterSpacing: 3, marginBottom: 14 }}>KV</div>
          <p style={{ color: '#444', fontSize: 13, maxWidth: 480, lineHeight: 1.65 }}>
            Powered by TMDB · Streaming via VidSrc · For personal use only
          </p>
        </footer>
      </main>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
