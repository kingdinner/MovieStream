import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VideoPlayer from '@/components/player/VideoPlayer';
import { FALLBACK_EPISODES, FALLBACK_MOVIES, FALLBACK_TV_SHOWS } from '@/lib/tmdb/fallback-catalog';

describe('VideoPlayer Component — Playback Controls, Subtitles, Fullscreen & Fallback', () => {
  const movie = FALLBACK_MOVIES[0]!;
  const tvShow = FALLBACK_TV_SHOWS[0]!;

  it('renders movie player with primary VidSrc CC source and English subtitles by default', () => {
    render(<VideoPlayer item={movie} />);

    expect(screen.getByTestId('player-title')).toHaveTextContent('Dune: Part Two');
    const iframe = screen.getByTestId('player-iframe') as HTMLIFrameElement;
    expect(iframe.src).toBe('https://vidsrc.cc/v2/embed/movie/693134?sub=en');
    expect(iframe.getAttribute('allow')).toContain('fullscreen');
  });

  it('supports switching subtitle languages and updates provider iframe URL', () => {
    render(<VideoPlayer item={movie} />);

    const subSelect = screen.getByTestId('control-subtitles-select') as HTMLSelectElement;
    expect(subSelect.value).toBe('en');

    fireEvent.change(subSelect, { target: { value: 'es' } });
    expect((screen.getByTestId('player-iframe') as HTMLIFrameElement).src).toBe(
      'https://vidsrc.cc/v2/embed/movie/693134?sub=es'
    );

    fireEvent.change(subSelect, { target: { value: 'off' } });
    expect((screen.getByTestId('player-iframe') as HTMLIFrameElement).src).toBe(
      'https://vidsrc.cc/v2/embed/movie/693134'
    );
  });

  it('supports play/pause, seek, mute, volume, and fullscreen controls', () => {
    render(<VideoPlayer item={movie} />);

    const playPauseBtn = screen.getByTestId('control-play-pause');
    expect(playPauseBtn).toHaveAttribute('aria-label', 'Pause');
    fireEvent.click(playPauseBtn);
    expect(playPauseBtn).toHaveAttribute('aria-label', 'Play');

    const seekSlider = screen.getByTestId('control-seek-slider') as HTMLInputElement;
    fireEvent.click(screen.getByTestId('control-forward'));
    expect(Number(seekSlider.value)).toBe(10);

    fireEvent.click(screen.getByTestId('control-rewind'));
    expect(Number(seekSlider.value)).toBe(0);

    const muteBtn = screen.getByTestId('control-mute-toggle');
    expect(muteBtn).toHaveAttribute('aria-label', 'Mute');
    fireEvent.click(muteBtn);
    expect(muteBtn).toHaveAttribute('aria-label', 'Unmute');

    const volumeSlider = screen.getByTestId('control-volume-slider') as HTMLInputElement;
    fireEvent.change(volumeSlider, { target: { value: '60' } });
    expect(volumeSlider.value).toBe('60');

    const fullscreenBtn = screen.getByTestId('control-fullscreen-btn');
    expect(fullscreenBtn).toHaveAttribute('aria-label', 'Enter Fullscreen');
    fireEvent.click(fullscreenBtn);
    expect(screen.getByTestId('video-player-container')).toHaveAttribute(
      'data-fullscreen',
      'true'
    );
  });

  it('cycles through fallback sources on failure and displays retryable error state when all fail', () => {
    render(<VideoPlayer item={movie} />);

    // Initial: Source 1 (vidsrc.cc)
    expect((screen.getByTestId('player-iframe') as HTMLIFrameElement).src).toContain(
      'vidsrc.cc'
    );

    // Fallback to Source 2 (vidsrc.fyi)
    fireEvent.click(screen.getByTestId('control-fallback-btn'));
    expect((screen.getByTestId('player-iframe') as HTMLIFrameElement).src).toContain(
      'vidsrc.fyi'
    );

    // Fallback to Source 3 (embed.su)
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
      'vidsrc.cc'
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
