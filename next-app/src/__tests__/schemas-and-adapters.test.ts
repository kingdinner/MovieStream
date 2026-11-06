import { describe, expect, it } from 'vitest';
import {
  AuthorizedProviderUrlSchema,
  getMediaTitle,
  getMediaYear,
  getTmdbImageUrl,
  MediaItemSchema,
  TmdbImageUrlSchema,
} from '@/lib/schemas';
import {
  clampSeekPercentage,
  clampVolumeLevel,
  createPlayerCommandPayload,
  resolveNextSourceState,
} from '@/lib/video/adapter';
import {
  buildAuthorizedVideoSources,
  getEmbedSourceUrls,
} from '@/lib/video/providers';
import {
  ADVERTISEMENT_AUDIT_REGISTRY,
  classifyResource,
  verifyAdSeparationPolicy,
} from '@/lib/ads/ad-audit';

describe('Zod Schemas & External URL Validation', () => {
  it('validates TMDB media items and normalizes defaults', () => {
    const parsed = MediaItemSchema.safeParse({
      id: 693134,
      title: 'Dune: Part Two',
      vote_average: 8.3,
      release_date: '2024-02-27',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(getMediaTitle(parsed.data)).toBe('Dune: Part Two');
      expect(getMediaYear(parsed.data)).toBe('2024');
      expect(parsed.data.media_type).toBe('movie');
    }
  });

  it('builds and validates TMDB image URLs while rejecting malicious paths', () => {
    const valid = getTmdbImageUrl('w500', '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg');
    expect(valid).toBe(
      'https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg'
    );
    expect(TmdbImageUrlSchema.safeParse(valid).success).toBe(true);

    // Reject traversal or invalid paths
    expect(getTmdbImageUrl('w500', '../../evil.js')).toBeNull();
    expect(getTmdbImageUrl('w500', null)).toBeNull();
  });

  it('accepts only authorized HTTPS video provider hostnames', () => {
    expect(
      AuthorizedProviderUrlSchema.safeParse(
        'https://vidcore.org/embed/movie/693134?lang=en'
      ).success
    ).toBe(true);
    expect(
      AuthorizedProviderUrlSchema.safeParse(
        'https://embed.su/embed/tv/1396/1/1'
      ).success
    ).toBe(true);

    // Reject HTTP or removed/unauthorized domains (including vidsrc)
    expect(
      AuthorizedProviderUrlSchema.safeParse(
        'http://vidcore.org/embed/movie/693134'
      ).success
    ).toBe(false);
    expect(
      AuthorizedProviderUrlSchema.safeParse(
        'https://vidsrc.cc/v2/embed/movie/693134'
      ).success
    ).toBe(false);
    expect(
      AuthorizedProviderUrlSchema.safeParse(
        'https://malicious-stream.example.com/embed/movie/693134'
      ).success
    ).toBe(false);
  });
});

describe('Video Provider Adapters & Playback Helpers', () => {
  it('generates movie embed sources in priority order with English subtitles by default', () => {
    const sources = buildAuthorizedVideoSources({
      tmdbId: 693134,
      mediaType: 'movie',
    });
    expect(sources).toHaveLength(2);
    expect(sources[0]?.url).toBe(
      'https://vidcore.org/embed/movie/693134?lang=en'
    );
    expect(sources[1]?.url).toBe('https://embed.su/embed/movie/693134');
  });

  it('generates TV episode embed sources with season, episode, and subtitle language', () => {
    const urls = getEmbedSourceUrls(1396, 'tv', 2, 5, 'es');
    expect(urls).toEqual([
      'https://vidcore.org/embed/tv/1396/2/5?lang=es',
      'https://embed.su/embed/tv/1396/2/5',
    ]);
  });

  it('omits subtitle query parameter when subtitles are set to off', () => {
    const urls = getEmbedSourceUrls(693134, 'movie', 1, 1, 'off');
    expect(urls[0]).toBe('https://vidcore.org/embed/movie/693134');
  });

  it('transitions deterministically through fallback sources and sets loadError when exhausted', () => {
    expect(resolveNextSourceState(0, 2)).toEqual({
      nextIndex: 1,
      loadError: false,
    });
    expect(resolveNextSourceState(1, 2)).toEqual({
      nextIndex: 1,
      loadError: true,
    });
  });

  it('clamps seek and volume percentages and formats postMessage commands', () => {
    expect(clampSeekPercentage(10, -25)).toBe(0);
    expect(clampSeekPercentage(90, 25)).toBe(100);
    expect(clampSeekPercentage(40, 15)).toBe(55);

    expect(clampVolumeLevel(-10)).toBe(0);
    expect(clampVolumeLevel(140)).toBe(100);
    expect(clampVolumeLevel(75.4)).toBe(75);

    const payload = JSON.parse(createPlayerCommandPayload('setVolume', 75)) as {
      event: string;
      func: string;
      args: number[];
    };
    expect(payload).toEqual({
      event: 'command',
      func: 'setVolume',
      args: [75],
    });
  });
});

describe('Advertisement Audit & Separation Policy', () => {
  it('classifies first-party, provider-required, third-party, and unknown resources accurately', () => {
    expect(classifyResource('src/components/ads/AdUnit.jsx')).toBe('FIRST_PARTY');
    expect(classifyResource('src/components/ads/FloatingAd.jsx')).toBe(
      'FIRST_PARTY'
    );
    expect(classifyResource('src/components/ads/InterstitialAd.jsx')).toBe(
      'FIRST_PARTY'
    );
    expect(classifyResource('https://vidcore.org/embed/movie/693134')).toBe(
      'PROVIDER_REQUIRED'
    );
    expect(
      classifyResource('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')
    ).toBe('THIRD_PARTY');
    expect(classifyResource('https://cdn.unknown-chunk.example/bundle.js')).toBe(
      'UNKNOWN'
    );
  });

  it('enforces complete first-party ad removal and provider preservation policy', () => {
    const policy = verifyAdSeparationPolicy();
    expect(policy.firstPartyRemoved).toBe(true);
    expect(policy.providerRequiredPreserved).toBe(true);
    expect(policy.thirdPartyUnblocked).toBe(true);
    expect(policy.unknownDocumented).toBe(true);
    expect(ADVERTISEMENT_AUDIT_REGISTRY.length).toBeGreaterThanOrEqual(7);
  });
});
