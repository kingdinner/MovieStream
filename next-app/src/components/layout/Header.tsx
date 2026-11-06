'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  BookMarked,
  Film,
  Home as HomeIcon,
  Search,
  Tv,
  X,
} from 'lucide-react';
import { useStreaming } from '@/context/StreamingContext';
import { Input } from '@/components/ui/input';

const NAV_ITEMS = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/movies', label: 'Movies', Icon: Film },
  { href: '/tv', label: 'TV Shows', Icon: Tv },
  { href: '/watchlist', label: 'My List', Icon: BookMarked },
] as const;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { myListIds } = useStreaming();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
    if (pathname === '/search') {
      router.push('/');
    }
  };

  const isSolid = scrolled || pathname !== '/';

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-[90] flex items-center justify-between px-[4%] h-[var(--header-h)] transition-colors duration-300 ${
        isSolid
          ? 'bg-black/95 border-b border-white/10 backdrop-blur-md'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      }`}
    >
      {/* Left: Brand Logo & Primary Navigation */}
      <div className="flex items-center gap-4 sm:gap-8 h-full">
        <Link
          href="/"
          aria-label="KVFilmZone Home"
          className="font-display text-2xl sm:text-[28px] tracking-[2px] text-brand select-none flex items-center h-full hover:opacity-90 transition-opacity"
        >
          KVFilmZone
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2 h-full">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                data-testid={`nav-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`relative inline-flex items-center justify-center gap-1.5 h-9 px-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  active ? 'text-white font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{label}</span>
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Watchlist Badge, Notifications, Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3.5 h-full">
        {searchOpen ? (
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Search movies and TV shows"
            className="relative flex items-center"
          >
            <Search className="w-4 h-4 absolute left-3 text-white/55 pointer-events-none" />
            <Input
              type="search"
              autoFocus
              aria-label="Search titles"
              placeholder="Search titles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 w-44 sm:w-60 bg-black/85 border-white/70 text-white"
            />
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 text-neutral-400 hover:text-white flex items-center"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            data-testid="header-search-trigger"
            className="inline-flex items-center justify-center w-10 h-10 text-white hover:text-white/80 transition-colors rounded-full hover:bg-white/10"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        <Link
          href="/watchlist"
          aria-label="My List"
          data-testid="header-watchlist-link"
          className="relative inline-flex items-center justify-center w-10 h-10 text-white hover:text-white/80 transition-colors rounded-full hover:bg-white/10"
        >
          <BookMarked className="w-5 h-5" />
          {myListIds.size > 0 && (
            <span
              data-testid="watchlist-count-badge"
              className="absolute top-0.5 right-0.5 text-[10px] bg-brand text-white rounded-full px-1.5 py-0.2 font-bold min-w-[16px] text-center leading-4"
            >
              {myListIds.size}
            </span>
          )}
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="hidden sm:inline-flex items-center justify-center w-10 h-10 text-white hover:text-white/80 transition-colors rounded-full hover:bg-white/10"
        >
          <Bell className="w-5 h-5" />
        </button>

        <Link
          href="/"
          aria-label="Home Profile"
          title="Home"
          className="w-9 h-9 rounded bg-gradient-to-br from-brand to-[#8b0000] flex items-center justify-center font-display text-lg text-white select-none leading-none hover:scale-105 transition-transform"
        >
          K
        </Link>
      </div>
    </header>
  );
}
