import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StreamingProvider } from '@/context/StreamingContext';
import HomeView from '@/components/home/HomeView';
import BrowseCatalog from '@/components/browse/BrowseCatalog';
import { FALLBACK_MOVIES, FALLBACK_TV_SHOWS } from '@/lib/tmdb/fallback-catalog';
import GlobalModals from '@/components/modals/GlobalModals';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Homepage, Watchlist, Modals, and Network Failure Resilience', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders homepage hero, genre filter pills, Top 10 row, and content carousels', () => {
    const initialRows = {
      trending_movies: FALLBACK_MOVIES,
      top_movies: FALLBACK_MOVIES,
      trending_tv: FALLBACK_TV_SHOWS,
    };

    render(
      <StreamingProvider>
        <HomeView featuredItems={FALLBACK_MOVIES} initialRows={initialRows} />
      </StreamingProvider>
    );

    expect(screen.getByTestId('hero-carousel')).toBeInTheDocument();
    expect(screen.getByText('🏅 Top 10 This Week')).toBeInTheDocument();
    expect(screen.getByText('🔥 Trending Movies')).toBeInTheDocument();
    expect(screen.getByTestId('genre-pill-all')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('adds and removes items from Watchlist and marks items as WATCHED on play', async () => {
    const initialRows = {
      trending_movies: [FALLBACK_MOVIES[0]!],
    };

    render(
      <StreamingProvider>
        <HomeView featuredItems={[FALLBACK_MOVIES[0]!]} initialRows={initialRows} />
        <GlobalModals />
      </StreamingProvider>
    );

    const addBtns = screen.getAllByLabelText('Add Dune: Part Two to My List');
    fireEvent.click(addBtns[0]!);

    expect(screen.getByTestId('toast-notification')).toHaveTextContent(
      'Added to My List ✓'
    );
    expect(
      screen.getAllByLabelText('Remove Dune: Part Two from My List').length
    ).toBeGreaterThan(0);

    // Trigger playback from Hero Play button
    fireEvent.click(screen.getByTestId('hero-play-btn'));
    await waitFor(() => {
      expect(screen.getByTestId('video-player-container')).toBeInTheDocument();
    });

    // Close player and verify WATCHED badge appears on card
    fireEvent.click(screen.getByTestId('player-close-btn'));
    expect(
      screen.getAllByTestId('watched-badge-693134').length
    ).toBeGreaterThan(0);
  });

  it('displays accessible error alert and retry button when catalog network request fails', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('Network connection lost'));

    render(
      <StreamingProvider>
        <BrowseCatalog tab="movies" />
      </StreamingProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('catalog-error-alert')).toBeInTheDocument();
    });
    expect(screen.getByText('Network connection lost')).toBeInTheDocument();

    // Mock recovery on Retry click
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ results: FALLBACK_MOVIES, total_pages: 2 }),
        { status: 200 }
      )
    );

    fireEvent.click(screen.getByText('Retry'));
    await waitFor(() => {
      expect(screen.queryByTestId('catalog-error-alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('catalog-grid')).toBeInTheDocument();
    });
  });
});
