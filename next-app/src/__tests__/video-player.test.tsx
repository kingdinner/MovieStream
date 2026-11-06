import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VideoPlayer from '@/components/player/VideoPlayer';
import { FALLBACK_EPISODES, FALLBACK_MOVIES, FALLBACK_TV_SHOWS } from '@/lib/tmdb/fallback-catalog';

describe('VideoPlayer Component — Popup-Blocking Sandbox, Source Fallback & Episode Navigation', () => {
  const movie = FALLBACK_MOVIES[0]!;
  const tvShow = FALLBACK_TV_SHOWS[0]!;

  it('renders movie player with primary VidCore source and popup-blocking sandbox attribute', () => {
    render(<VideoPlayer item={movie} />);

    expect(screen.getByTestId('player-title')).toHaveTextContent('Dune: Part Two');
    const iframe = screen.getByTestId('player-iframe') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://vidcore.org/embed/movie/693134?lang=en');
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');
    expect(iframe.getAttribute('allow')).toContain('fullscreen');
    expect(screen.queryByTestId('playback-controls-toolbar')).not.toBeInTheDocument();
  });

  it('cycles through fallback sources on failure and displays retryable error state when all fail', () => {
    render(<VideoPlayer item={movie} />);

    // Initial: Source 1 (vidcore.org)
    expect((screen.getByTestId('player-iframe') as HTMLIFrameElement).src).toContain(
      'vidcore.org'
    );

    // Fallback to Source 2 (embed.su)
    fireEvent.click(screen.getByTestId('control-fallback-btn'));
    expect((screen.getByTestId('player-iframe') as HTMLIFrameElement).src).toContain(
      'embed.su'
    );

    // Exhausted all sources -> displays error overlay
    fireEvent.click(screen.getByTestId('control-fallback-btn'));
    expect(screen.getByTestId('player-error-overlay')).toBeInTheDocument();
    expect(screen.getByText('Video not available')).toBeInTheDocument();

    // Retry resets back to Source 1
    fireEvent.click(screen.getByTestId('player-retry-sources-btn'));
    expect(screen.queryByTestId('player-error-overlay')).not.toBeInTheDocument();
    expect((screen.getByTestId('player-iframe') as HTMLIFrameElement).src).toContain(
      'vidcore.org'
    );
  });

  it('renders TV episode navigation and calls onEpisodeChange for next/previous episodes', () => {
    const onEpisodeChange = vi.fn();
    render(
      <VideoPlayer
        item={tvShow}
        season={1}
        episode={2}
        episodes={FALLBACK_EPISODES}
        onEpisodeChange={onEpisodeChange}
      />
    );

    expect(screen.getByTestId('player-episode-meta')).toHaveTextContent(
      'Season 1 · Episode 2'
    );

    fireEvent.click(screen.getByTestId('player-prev-episode-btn'));
    expect(onEpisodeChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTestId('player-next-episode-btn'));
    expect(onEpisodeChange).toHaveBeenCalledWith(3);
  });
});
