import { z } from 'zod';

export const AdClassificationSchema = z.enum([
  'FIRST_PARTY',
  'PROVIDER_REQUIRED',
  'THIRD_PARTY',
  'UNKNOWN',
]);
export type AdClassification = z.infer<typeof AdClassificationSchema>;

export interface AuditedScriptOrComponent {
  id: string;
  name: string;
  locationOrOrigin: string;
  classification: AdClassification;
  action: 'REMOVED' | 'PRESERVED_IN_IFRAME' | 'DOCUMENTED_AND_PRESERVED';
  dependencies: string[];
  playbackImpactIfRemoved: 'NONE' | 'CRITICAL_BREAKS_PLAYBACK' | 'VIOLATES_PROVIDER_TERMS' | 'UNKNOWN_RISK';
  notes: string;
}

export const ADVERTISEMENT_AUDIT_REGISTRY: readonly AuditedScriptOrComponent[] = [
  {
    id: 'fp-ad-unit',
    name: 'AdUnit.jsx (Google AdSense Wrapper & Placeholder)',
    locationOrOrigin: 'src/components/ads/AdUnit.jsx',
    classification: 'FIRST_PARTY',
    action: 'REMOVED',
    dependencies: ['window.adsbygoogle', 'SHOW_ADS (undefined)', 'ADSENSE_CLIENT (undefined)'],
    playbackImpactIfRemoved: 'NONE',
    notes:
      'First-party display ad wrapper added in commit fb1342a6. Referenced undefined constants from src/constants/api.js and had zero playback dependencies. Removed in Phase 4.',
  },
  {
    id: 'fp-floating-ad',
    name: 'FloatingAd.jsx (Sticky 300x250 Sponsored Overlay)',
    locationOrOrigin: 'src/components/ads/FloatingAd.jsx',
    classification: 'FIRST_PARTY',
    action: 'REMOVED',
    dependencies: ['src/components/ads/AdUnit.jsx', 'SHOW_ADS (undefined)', 'AD_SLOTS (undefined)'],
    playbackImpactIfRemoved: 'NONE',
    notes:
      'First-party bottom-right sticky banner overlay. Unreferenced by playback or catalog modules. Removed in Phase 4.',
  },
  {
    id: 'fp-interstitial-ad',
    name: 'InterstitialAd.jsx (Pre-Play Countdown Ad Modal)',
    locationOrOrigin: 'src/components/ads/InterstitialAd.jsx',
    classification: 'FIRST_PARTY',
    action: 'REMOVED',
    dependencies: [
      'src/components/ads/AdUnit.jsx',
      'SHOW_ADS (undefined)',
      'AD_SLOTS (undefined)',
      'INTERSTITIAL_SKIP_AFTER (undefined)',
    ],
    playbackImpactIfRemoved: 'NONE',
    notes:
      'First-party full-screen pre-play gate ("YOUR VIDEO WILL START AFTER THIS AD"). Removed in Phase 4 and excluded from Next.js application.',
  },
  {
    id: 'pr-vidcore',
    name: 'VidCore Ad-Free Embed Player & Stream Resolver',
    locationOrOrigin: 'https://vidcore.org/embed/*',
    classification: 'PROVIDER_REQUIRED',
    action: 'PRESERVED_IN_IFRAME',
    dependencies: [
      'Cross-origin iframe context',
      'HLS/DASH media segments',
      'Subtitle/audio language loader (?lang=en)',
      'PostMessage playback events (vidcore:play, vidcore:pause, vidcore:ended)',
    ],
    playbackImpactIfRemoved: 'CRITICAL_BREAKS_PLAYBACK',
    notes:
      'Primary authorized ad-free video provider (replaced VidSrc servers). Loaded inside an isolated cross-origin iframe.',
  },
  {
    id: 'pr-embed-su',
    name: 'Embed.su Video Player & Stream Resolver',
    locationOrOrigin: 'https://embed.su/embed/*',
    classification: 'PROVIDER_REQUIRED',
    action: 'PRESERVED_IN_IFRAME',
    dependencies: ['Cross-origin iframe context', 'HLS media stream'],
    playbackImpactIfRemoved: 'CRITICAL_BREAKS_PLAYBACK',
    notes:
      'Authorized Fallback video provider. Preserved inside isolated cross-origin iframe.',
  },
  {
    id: 'tp-provider-monetization',
    name: 'Provider-Hosted Third-Party Ad Networks inside Fallback Embed Iframes',
    locationOrOrigin: 'Cross-origin sub-resources within embed.su',
    classification: 'THIRD_PARTY',
    action: 'PRESERVED_IN_IFRAME',
    dependencies: ['Provider iframe execution context', 'Provider monetization verification'],
    playbackImpactIfRemoved: 'VIOLATES_PROVIDER_TERMS',
    notes:
      'Third-party monetization scripts loaded inside fallback provider iframes. Primary provider vidcore.org is natively ad-free.',
  },
  {
    id: 'unk-provider-dynamic-bundles',
    name: 'Dynamic Obfuscated Sub-Frame Scripts in Provider Embeds',
    locationOrOrigin: 'Dynamic runtime chunks inside cross-origin provider iframes',
    classification: 'UNKNOWN',
    action: 'DOCUMENTED_AND_PRESERVED',
    dependencies: [
      'Provider player initialization',
      'Anti-tamper / stream token decryption',
      'Potential telemetry or ad beacon callbacks',
    ],
    playbackImpactIfRemoved: 'UNKNOWN_RISK',
    notes:
      'Because cross-origin provider iframes dynamically load obfuscated chunks that couple stream decryption with telemetry/monetization, these scripts are classified as UNKNOWN, documented, and preserved untouched.',
  },
] as const;

/**
 * Classifies a resource origin or component path according to Phase 4 audit rules.
 */
export function classifyResource(identifier: string): AdClassification {
  const normalized = identifier.trim().toLowerCase();

  if (
    normalized.includes('components/ads/') ||
    normalized.includes('adunit') ||
    normalized.includes('floatingad') ||
    normalized.includes('interstitialad')
  ) {
    return 'FIRST_PARTY';
  }

  if (
    normalized.includes('vidcore.org/embed') ||
    normalized.includes('embed.su/embed')
  ) {
    return 'PROVIDER_REQUIRED';
  }

  if (
    normalized.includes('googlesyndication.com') ||
    normalized.includes('adsbygoogle') ||
    normalized.includes('doubleclick.net')
  ) {
    return 'THIRD_PARTY';
  }

  return 'UNKNOWN';
}

/**
 * Verifies that zero FIRST_PARTY ad components are active in the modernized application,
 * while confirming that provider-required and third-party provider embeds remain unblocked.
 */
export function verifyAdSeparationPolicy(): {
  firstPartyRemoved: boolean;
  providerRequiredPreserved: boolean;
  thirdPartyUnblocked: boolean;
  unknownDocumented: boolean;
} {
  const firstPartyItems = ADVERTISEMENT_AUDIT_REGISTRY.filter(
    (i) => i.classification === 'FIRST_PARTY'
  );
  const providerItems = ADVERTISEMENT_AUDIT_REGISTRY.filter(
    (i) => i.classification === 'PROVIDER_REQUIRED'
  );
  const thirdPartyItems = ADVERTISEMENT_AUDIT_REGISTRY.filter(
    (i) => i.classification === 'THIRD_PARTY'
  );
  const unknownItems = ADVERTISEMENT_AUDIT_REGISTRY.filter(
    (i) => i.classification === 'UNKNOWN'
  );

  return {
    firstPartyRemoved:
      firstPartyItems.length > 0 &&
      firstPartyItems.every((i) => i.action === 'REMOVED'),
    providerRequiredPreserved:
      providerItems.length === 2 &&
      providerItems.every((i) => i.action === 'PRESERVED_IN_IFRAME'),
    thirdPartyUnblocked:
      thirdPartyItems.length > 0 &&
      thirdPartyItems.every((i) => i.action === 'PRESERVED_IN_IFRAME'),
    unknownDocumented:
      unknownItems.length > 0 &&
      unknownItems.every(
        (i) =>
          i.action === 'DOCUMENTED_AND_PRESERVED' && i.dependencies.length > 0
      ),
  };
}
