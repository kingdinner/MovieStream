import { z } from 'zod';
import { AuthorizedProviderUrlSchema, type MediaType } from '@/lib/schemas';

export type SubtitleLanguage = 'en' | 'es' | 'fr' | 'ja' | 'off';

export const SUBTITLE_OPTIONS: readonly { code: SubtitleLanguage; label: string }[] = [
  { code: 'en', label: 'English (CC)' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'off', label: 'Subtitles Off' },
] as const;

export interface VideoSourceDescriptor {
  providerId: 'vidsrc_cc' | 'vidsrc_fyi' | 'embed_su';
  name: string;
  hostname: string;
  url: string;
  supportsSubtitleParam: boolean;
  priority: number;
}

const StreamTargetSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: z.enum(['movie', 'tv']),
  season: z.number().int().min(1).max(100).optional().default(1),
  episode: z.number().int().min(1).max(2000).optional().default(1),
  subtitle: z.enum(['en', 'es', 'fr', 'ja', 'off']).optional().default('en'),
});

export type StreamTarget = z.input<typeof StreamTargetSchema>;

/**
 * Isolated Video Provider Adapter
 * Generates and strictly validates authorized streaming embed URLs for a given TMDB title.
 * Never fabricates unauthorized domains; validates every generated URL against AuthorizedProviderUrlSchema.
 */
export function buildAuthorizedVideoSources(input: StreamTarget): VideoSourceDescriptor[] {
  const parsed = StreamTargetSchema.safeParse(input);
  if (!parsed.success) {
    return [];
  }

  const { tmdbId, mediaType, season, episode, subtitle } = parsed.data;
  const subQuery = subtitle !== 'off' ? `?sub=${encodeURIComponent(subtitle)}` : '';

  const candidates: VideoSourceDescriptor[] =
    mediaType === 'tv'
      ? [
          {
            providerId: 'vidsrc_cc',
            name: 'VidSrc CC',
            hostname: 'vidsrc.cc',
            url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}${subQuery}`,
            supportsSubtitleParam: true,
            priority: 1,
          },
          {
            providerId: 'vidsrc_fyi',
            name: 'VidSrc FYI',
            hostname: 'vidsrc.fyi',
            url: `https://vidsrc.fyi/embed/tv/${tmdbId}/${season}/${episode}`,
            supportsSubtitleParam: false,
            priority: 2,
          },
          {
            providerId: 'embed_su',
            name: 'Embed SU',
            hostname: 'embed.su',
            url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
            supportsSubtitleParam: false,
            priority: 3,
          },
        ]
      : [
          {
            providerId: 'vidsrc_cc',
            name: 'VidSrc CC',
            hostname: 'vidsrc.cc',
            url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}${subQuery}`,
            supportsSubtitleParam: true,
            priority: 1,
          },
          {
            providerId: 'vidsrc_fyi',
            name: 'VidSrc FYI',
            hostname: 'vidsrc.fyi',
            url: `https://vidsrc.fyi/embed/movie/${tmdbId}`,
            supportsSubtitleParam: false,
            priority: 2,
          },
          {
            providerId: 'embed_su',
            name: 'Embed SU',
            hostname: 'embed.su',
            url: `https://embed.su/embed/movie/${tmdbId}`,
            supportsSubtitleParam: false,
            priority: 3,
          },
        ];

  return candidates.filter((candidate) => AuthorizedProviderUrlSchema.safeParse(candidate.url).success);
}

/**
 * Legacy-compatible helper returning the array of embed URLs in fallback priority order.
 */
export function getEmbedSourceUrls(
  tmdbId: number,
  mediaType: MediaType,
  season = 1,
  episode = 1,
  subtitle: SubtitleLanguage = 'en'
): string[] {
  return buildAuthorizedVideoSources({ tmdbId, mediaType, season, episode, subtitle }).map(
    (s) => s.url
  );
}
