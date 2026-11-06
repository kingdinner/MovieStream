import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      data-testid="site-footer"
      className="px-[4%] pt-12 pb-8 border-t border-white/10 mt-12 bg-black text-neutral-400"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="font-display text-2xl text-brand tracking-[3px] mb-2">
            KVFilmZone
          </div>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-md leading-relaxed">
            Powered by TMDB · Authorized Streaming Adapters · Modernized with Next.js App Router
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-6 text-xs sm:text-sm">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/movies" className="hover:text-white transition-colors">
            Movies
          </Link>
          <Link href="/tv" className="hover:text-white transition-colors">
            TV Shows
          </Link>
          <Link href="/watchlist" className="hover:text-white transition-colors">
            My List
          </Link>
          <Link href="/search" className="hover:text-white transition-colors">
            Search
          </Link>
        </nav>
      </div>
    </footer>
  );
}
