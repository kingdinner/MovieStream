import { z } from 'zod';
import { type MediaType } from '@/lib/schemas';
import { AUTHORIZED_VIDEO_ADAPTERS, resolveAdapterSource } from './adapter';

export type SubtitleLanguage = 'en' | 'es' | 'fr' | 'ja' | 'off';

export const SUBTITLE_OPTIONS: readonly { code: SubtitleLanguage; label: string }[] = [
  { code: 'en', label: 'English (CC)' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'off', label: 'Subtitles Off' },
] as const;

export interface VideoSourceDescriptor {
  providerId: 'vidcore' | 'embed_su';
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
 * Isolated Video Provider Resolver
 * Delegates URL generation to AUTHORIZED_VIDEO_ADAPTERS and validates every URL.
 */
export function buildAuthorizedVideoSources(input: StreamTarget): VideoSourceDescriptor[] {
  const parsed = StreamTargetSchema.safeParse(input);
  if (!parsed.success) {
    return [];
  }

  const { tmdbId, mediaType, season, episode, subtitle } = parsed.data;
  const descriptors: VideoSourceDescriptor[] = [];

  for (const adapter of AUTHORIZED_VIDEO_ADAPTERS) {
    const resolved = resolveAdapterSource(adapter, {
      tmdbId,
      mediaType,
      season,
      episode,
      subtitle,
    });
    if (resolved) {
      descriptors.push(resolved);
    }
  }

  return descriptors;
}

/**
 * Returns the ordered list of validated embed URLs for a given title.
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
