import { AuthorizedProviderUrlSchema } from '@/lib/schemas';
import { type SubtitleLanguage, type VideoSourceDescriptor } from './providers';

export interface VideoProviderAdapter {
  readonly id: 'vidcore' | 'embed_su';
  readonly name: string;
  readonly hostname: 'vidcore.org' | 'embed.su';
  readonly priority: number;
  readonly supportsSubtitleParam: boolean;
  buildMovieUrl(tmdbId: number, subtitle?: SubtitleLanguage): string;
  buildEpisodeUrl(
    tmdbId: number,
    season: number,
    episode: number,
    subtitle?: SubtitleLanguage
  ): string;
}

function appendLanguageParam(baseUrl: string, subtitle: SubtitleLanguage = 'en'): string {
  if (subtitle === 'off') return baseUrl;
  return `${baseUrl}?lang=${encodeURIComponent(subtitle)}`;
}

export const VidCoreAdapter: VideoProviderAdapter = {
  id: 'vidcore',
  name: 'VidCore',
  hostname: 'vidcore.org',
  priority: 1,
  supportsSubtitleParam: true,
  buildMovieUrl(tmdbId, subtitle = 'en') {
    return appendLanguageParam(`https://vidcore.org/embed/movie/${tmdbId}`, subtitle);
  },
  buildEpisodeUrl(tmdbId, season, episode, subtitle = 'en') {
    return appendLanguageParam(
      `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`,
      subtitle
    );
  },
};

export const EmbedSuAdapter: VideoProviderAdapter = {
  id: 'embed_su',
  name: 'Embed SU',
  hostname: 'embed.su',
  priority: 2,
  supportsSubtitleParam: false,
  buildMovieUrl(tmdbId) {
    return `https://embed.su/embed/movie/${tmdbId}`;
  },
  buildEpisodeUrl(tmdbId, season, episode) {
    return `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
  },
};

export const AUTHORIZED_VIDEO_ADAPTERS: readonly VideoProviderAdapter[] = [
  VidCoreAdapter,
  EmbedSuAdapter,
] as const;

export const IFRAME_ALLOW_PERMISSIONS =
  'autoplay; encrypted-media; fullscreen; picture-in-picture' as const;

/**
 * Resolves a validated VideoSourceDescriptor from an isolated adapter.
 */
export function resolveAdapterSource(
  adapter: VideoProviderAdapter,
  params: {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    season?: number;
    episode?: number;
    subtitle?: SubtitleLanguage;
  }
): VideoSourceDescriptor | null {
  const { tmdbId, mediaType, season = 1, episode = 1, subtitle = 'en' } = params;
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) return null;

  const url =
    mediaType === 'tv'
      ? adapter.buildEpisodeUrl(
          tmdbId,
          Math.max(1, Math.floor(season)),
          Math.max(1, Math.floor(episode)),
          subtitle
        )
      : adapter.buildMovieUrl(tmdbId, subtitle);

  const validated = AuthorizedProviderUrlSchema.safeParse(url);
  if (!validated.success) return null;

  return {
    providerId: adapter.id,
    name: adapter.name,
    hostname: adapter.hostname,
    url: validated.data,
    supportsSubtitleParam: adapter.supportsSubtitleParam,
    priority: adapter.priority,
  };
}

/**
 * Deterministic source fallback state transition.
 */
export function resolveNextSourceState(
  currentIndex: number,
  totalSources: number
): { nextIndex: number; loadError: boolean } {
  if (totalSources <= 0) {
    return { nextIndex: 0, loadError: true };
  }
  if (currentIndex + 1 < totalSources) {
    return { nextIndex: currentIndex + 1, loadError: false };
  }
  return { nextIndex: currentIndex, loadError: true };
}

/**
 * Safe seek percentage clamping (0..100).
 */
export function clampSeekPercentage(current: number, delta: number): number {
  if (Number.isNaN(current) || Number.isNaN(delta)) return 0;
  return Math.max(0, Math.min(100, current + delta));
}

/**
 * Safe volume level clamping (0..100).
 */
export function clampVolumeLevel(level: number): number {
  if (Number.isNaN(level)) return 0;
  return Math.max(0, Math.min(100, Math.round(level)));
}

/**
 * Builds a standard JSON postMessage command payload for embedded video players.
 */
export function createPlayerCommandPayload(
  command: 'playVideo' | 'pauseVideo' | 'seekTo' | 'mute' | 'unMute' | 'setVolume',
  value?: number | string
): string {
  return JSON.stringify({
    event: 'command',
    func: command,
    args: value !== undefined ? [value] : [],
  });
}
