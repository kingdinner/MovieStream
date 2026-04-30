import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { API_KEY, BASE_URL, ROW_CONFIGS } from '../constants/api';
import { injectStyles } from '../styles/globalStyles';

import Header        from '../components/layout/Header';
import Footer        from '../components/layout/Footer';
import BrowseSection from '../components/browse/BrowseSection';
import DetailsModal  from '../components/modals/DetailsModal';
import PlayerModal   from '../components/modals/PlayerModal';
import MyListPage    from './MyListPage';
import HomeTab       from '../components/home/HomeTab';
import SearchResults from '../components/home/SearchResults';

injectStyles();

export default function Home() {

  /* ── UI state ── */
  const [activeTab,  setActiveTab]  = useState('home');
  const [homeGenre,  setHomeGenre]  = useState(null);
  const [scrolled,   setScrolled]   = useState(false);
  const [showMyList, setShowMyList] = useState(false);
  const [toast,      setToast]      = useState(null);

  /* ── Hero carousel ── */
  const [featuredItems, setFeaturedItems] = useState([]);
  const [featuredIdx,   setFeaturedIdx]   = useState(0);

  /* ── Home-tab rows ── */
  const [rows, setRows] = useState({});

  /* ── Availability filter ── */
  const [availableIds, setAvailableIds] = useState(null);

  /* ── Details / player modal ── */
  const [selected,   setSelected]   = useState(null);
  const [playing,    setPlaying]    = useState(false);
  const [seasons,    setSeasons]    = useState([]);
  const [selSeason,  setSelSeason]  = useState(1);
  const [episodes,   setEpisodes]   = useState([]);
  const [selEpisode, setSelEpisode] = useState(1);

  /* ── Search ── */
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);

  /* ── My List (persisted) ── */
  const [myList, setMyList] = useState(
    () => new Set(JSON.parse(localStorage.getItem('mylist-ids') || '[]'))
  );
  const [myListItems, setMyListItems] = useState(
    () => JSON.parse(localStorage.getItem('mylist-items') || '[]')
  );

  const toastTimer   = useRef(null);
  const searchTimer  = useRef(null);
  const scrollPosRef = useRef(0);

  /* ─────────── Effects ─────────── */

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') closeAll(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Auto-rotate hero every 7 s */
  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const t = setInterval(() => setFeaturedIdx(i => (i + 1) % featuredItems.length), 7000);
    return () => clearInterval(t);
  }, [featuredItems.length]);

  /* Fetch streamable IDs from VidSrc */
  useEffect(() => {
    const run = async () => {
      try {
        const ids = new Set();
        const fetchPage = async (type, page) => {
          const res = await fetch(`https://vidsrc.xyz/${type}/latest/page-${page}.json`, { signal: AbortSignal.timeout(6000) });
          if (!res.ok) return;
          const data  = await res.json();
          const items = data?.result?.items ?? data?.items ?? (Array.isArray(data) ? data : []);
          items.forEach(i => { const id = i.tmdb_id || i.tmdb; if (id) ids.add(String(id)); });
        };
        const tasks = [];
        for (let p = 1; p <= 10; p++) { tasks.push(fetchPage('movies', p)); tasks.push(fetchPage('tvshows', p)); }
        await Promise.allSettled(tasks);
        setAvailableIds(ids.size > 0 ? ids : new Set());
      } catch { setAvailableIds(new Set()); }
    };
    run();
  }, []);

  /* Fetch hero items + home rows */
  useEffect(() => {
    setRows({}); setFeaturedItems([]); setFeaturedIdx(0);
    let cancelled = false;

    fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        setFeaturedItems((d.results || []).filter(i => i.backdrop_path && i.overview).slice(0, 6));
      });

    const allRows   = ROW_CONFIGS.filter(r => r.tab === 'movies' || r.tab === 'tv');
    const fetchRow  = async (cfg) => {
      const sep  = cfg.url.includes('?') ? '&' : '?';
      const res  = await fetch(`${cfg.url}${sep}api_key=${API_KEY}&page=1`);
      const data = await res.json();
      if (cancelled) return;
      setRows(prev => ({
        ...prev,
        [cfg.title]: (data.results || []).slice(0, 18).map(i => ({
          ...i, media_type: i.media_type || (cfg.tab === 'tv' ? 'tv' : 'movie'),
        })),
      }));
    };
    const fetchInBatches = async () => {
      for (let i = 0; i < allRows.length; i += 2) {
        if (cancelled) return;
        await Promise.all(allRows.slice(i, i + 2).map(fetchRow));
        if (i + 2 < allRows.length) await new Promise(r => setTimeout(r, 120));
      }
    };
    fetchInBatches();
    return () => { cancelled = true; };
  }, []);

  /* TV seasons */
  useEffect(() => {
    if (!selected || selected.media_type !== 'tv') return;
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

  /* ─────────── Callbacks ─────────── */

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    clearTimeout(searchTimer.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      const res  = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults((data.results || []).filter(i => i.media_type === 'movie' || i.media_type === 'tv'));
    }, 350);
  }, []);

  const filterAvailable = useCallback((items) => {
    if (!availableIds || availableIds.size === 0) return items;
    return items.filter(i => availableIds.has(String(i.id)));
  }, [availableIds]);

  const toggleList = useCallback((item) => {
    setMyList(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        setMyListItems(its => { const u = its.filter(i => i.id !== item.id); localStorage.setItem('mylist-items', JSON.stringify(u)); return u; });
        showToast('Removed from My List');
      } else {
        next.add(item.id);
        setMyListItems(its => { const u = [...its, item]; localStorage.setItem('mylist-items', JSON.stringify(u)); return u; });
        showToast('Added to My List ✓');
      }
      localStorage.setItem('mylist-ids', JSON.stringify([...next]));
      return next;
    });
  }, [showToast]);

  const lockBody = useCallback(() => {
    if (document.body.style.position === 'fixed') return;
    scrollPosRef.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top      = `-${scrollPosRef.current}px`;
    document.body.style.width    = '100%';
    document.body.style.overflow = 'hidden';
  }, []);

  const unlockBody = useCallback(() => {
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollPosRef.current);
  }, []);

  const playItem = useCallback((item, ep = null) => {
    setSelected(item);
    if (ep !== null) setSelEpisode(ep);
    setPlaying(true);
    lockBody();
  }, [lockBody]);

  const selectItem = useCallback((item) => {
    setSelected(item);
    setPlaying(false);
    lockBody();
  }, [lockBody]);

  const closeAll = useCallback(() => {
    setSelected(null);
    setPlaying(false);
    unlockBody();
  }, [unlockBody]);

  const handleLogoClick = useCallback(() => {
    setActiveTab('home');
    setShowMyList(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ── Embed URL ── */
  const embedSrc = useMemo(() => {
    if (!selected) return '';
    const base = selected.media_type === 'tv'
      ? `https://vidsrc.xyz/embed/tv/${selected.id}/${selSeason}/${selEpisode}`
      : `https://vidsrc.xyz/embed/movie/${selected.id}`;
    return `${base}?ds_lang=en`;
  }, [selected, selSeason, selEpisode]);

  /* ─────────── Render ─────────── */
  return (
    <>
      {showMyList && (
        <MyListPage myList={myList} myListItems={myListItems} onSelect={selectItem} onPlay={playItem} onToggleList={toggleList} onClose={() => setShowMyList(false)} />
      )}

      <Header
        scrolled={scrolled} viewAllRow={null} showMyList={showMyList}
        activeTab={activeTab} setActiveTab={setActiveTab} setViewAllRow={() => {}}
        searchOpen={searchOpen} setSearchOpen={setSearchOpen}
        searchQuery={searchQuery} handleSearch={handleSearch}
        setSearchQuery={setSearchQuery} setSearchResults={setSearchResults}
        myList={myList} setShowMyList={setShowMyList} onLogoClick={handleLogoClick}
      />

      {playing && selected && (
        <PlayerModal selected={selected} closeAll={closeAll} embedSrc={embedSrc} selSeason={selSeason} selEpisode={selEpisode} />
      )}

      {selected && !playing && (
        <DetailsModal
          selected={selected} closeAll={closeAll} playItem={playItem}
          onSelect={selectItem} toggleList={toggleList} myList={myList}
          seasons={seasons} selSeason={selSeason} setSelSeason={setSelSeason}
          episodes={episodes} selEpisode={selEpisode}
        />
      )}

      <main style={{ background: '#000', minHeight: '100vh' }}>

        {searchResults.length > 0 ? (
          <SearchResults
            query={searchQuery} results={searchResults}
            filterAvailable={filterAvailable}
            onSelect={selectItem} onPlay={playItem}
            onToggleList={toggleList} myList={myList}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeTab
                featuredItems={featuredItems} featuredIdx={featuredIdx} setFeaturedIdx={setFeaturedIdx}
                homeGenre={homeGenre} setHomeGenre={setHomeGenre}
                rows={rows} myList={myList}
                onSelect={selectItem} onPlay={playItem}
                onToggleList={toggleList} filterAvailable={filterAvailable}
              />
            )}

            {(activeTab === 'movies' || activeTab === 'tv') && (
              <BrowseSection
                activeTab={activeTab} myList={myList}
                onSelect={selectItem} onPlay={playItem}
                onToggleList={toggleList} filterAvailable={filterAvailable}
              />
            )}
          </>
        )}

        <Footer />
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
