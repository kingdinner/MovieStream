import { Search, X, BookMarked, Bell, Home as HomeIcon, Film, Tv } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home',   Icon: HomeIcon, label: 'Home' },
  { id: 'movies', Icon: Film,     label: 'Movies' },
  { id: 'tv',     Icon: Tv,       label: 'TV Shows' },
];

/**
 * Header
 *
 * Fixed top navigation bar with logo, tabs, search, my-list badge, and avatar.
 */
export default function Header({
  scrolled,
  viewAllRow,
  showMyList,
  activeTab,
  setActiveTab,
  setViewAllRow,
  searchOpen,
  setSearchOpen,
  searchQuery,
  handleSearch,
  setSearchQuery,
  setSearchResults,
  myList,
  setShowMyList,
  onLogoClick,
}) {
  const solidBg = scrolled || viewAllRow || showMyList;

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90,
      padding: '0 4%',
      background: solidBg
        ? 'rgba(0,0,0,.97)'
        : 'linear-gradient(to bottom, rgba(0,0,0,.88) 0%, transparent 100%)',
      borderBottom: (viewAllRow || showMyList) ? '1px solid rgba(255,255,255,.06)' : 'none',
      transition: 'background .35s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 'var(--header-h, 66px)',
    }}>
      {/* Left: logo + nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, height: '100%' }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: 'var(--header-logo-fs, 26px)',
          letterSpacing: 2, color: '#e50914', lineHeight: 1,
          userSelect: 'none', cursor: 'default',
          display: 'flex', alignItems: 'center', height: '100%',
        }}>
          KVFilmZone
        </div>

        {/* Nav tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, height: '100%' }}>
          {NAV_ITEMS.map(({ id, Icon, label }) => (
            <button
              key={id}
              className={`ni ${activeTab === id ? 'act' : ''}`}
              onClick={() => { setActiveTab(id); setViewAllRow(null); }}
            >
              <Icon size={15} /><span className="nl">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right: search, my list, bell, avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: '100%' }}>

        {/* Search */}
        {searchOpen ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, color: 'rgba(255,255,255,.55)', pointerEvents: 'none' }} />
            <input
              className="sinput"
              autoFocus
              placeholder="Search titles…"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}
                style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'var(--header-icon-sz, 40px)', height: 'var(--header-icon-sz, 40px)', padding: 0 }}
            aria-label="Search"
          >
            <Search size={22} />
          </button>
        )}

        {/* My List */}
        <button
          onClick={() => setShowMyList(true)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'var(--header-icon-sz, 40px)', height: 'var(--header-icon-sz, 40px)', padding: 0, position: 'relative' }}
          aria-label="My List"
        >
          <BookMarked size={22} />
          {myList.size > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -4,
              fontSize: 10, background: '#e50914', color: '#fff',
              borderRadius: 8, padding: '0 5px', lineHeight: 1.6,
              fontWeight: 700, minWidth: 16, textAlign: 'center',
            }}>
              {myList.size}
            </span>
          )}
        </button>

        {/* Notifications */}
        <button
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'var(--header-icon-sz, 40px)', height: 'var(--header-icon-sz, 40px)', padding: 0 }}
          aria-label="Notifications"
        >
          <Bell size={22} />
        </button>

        {/* Avatar — click to return home */}
        <button
          onClick={onLogoClick}
          aria-label="Home"
          title="Home"
          style={{
            width: 'var(--avatar-sz, 36px)', height: 'var(--avatar-sz, 36px)',
            borderRadius: 5, flexShrink: 0,
            background: 'linear-gradient(135deg, #e50914, #8b0000)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 'var(--avatar-fs, 19px)', color: '#fff',
            cursor: 'pointer', userSelect: 'none', lineHeight: 1,
            border: 'none', padding: 0,
            transition: 'transform .15s ease, box-shadow .15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,255,255,.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          K
        </button>
      </div>
    </header>
  );
}
