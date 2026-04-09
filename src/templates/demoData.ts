import { InvitationData } from './types';

/**
 * Per-template demo data overrides.
 * Each template can export a partial InvitationData to override defaults.
 */
export type DemoDataOverrides = Partial<
  Pick<
    InvitationData,
    | 'brideName'
    | 'groomName'
    | 'brideBio'
    | 'groomBio'
    | 'brideFamilyNames'
    | 'groomFamilyNames'
    | 'footerNote'
    | 'storyMilestones'
    | 'sectionVisibility'
    | 'couplePhotoUrl'
    | 'bridePhotoUrl'
    | 'groomPhotoUrl'
    | 'hashtag'
    | 'welcomeMessage'
    | 'weddingDate'
    | 'galleryPhotos'
    | 'templateDefaults'
    | 'events'
  >
> & {
  musicUrl?: string;
  musicName?: string;
};

// Lazy loaders for per-template demo data
// @ts-ignore — Vite handles .ts dynamic imports; TS may show false errors for newly created files
const demoDataLoaders: Record<string, () => Promise<{ default: DemoDataOverrides }>> = {
  crimson: () => import('./crimson-shaadi/demoData'),
  ivory: () => import('./ivory-garden/demoDataPremium'),
  premium: () => import('./premium-elegante/demoData'),
  blossom: () => import('./blossom-date/demoData'),
  blush: () => import('./blush-affair/demoData'),
  midnight: () => import('./midnight-nawab/demoData'),
  golden: () => import('./golden-memo/demoData'),
};

/**
 * Load demo data overrides for a given template slug.
 * Returns empty object if template has no custom demo data.
 */
export async function loadTemplateDemoData(slug: string): Promise<DemoDataOverrides> {
  const loader = demoDataLoaders[slug];
  if (!loader) return {};
  try {
    const mod = await loader();
    return mod.default;
  } catch {
    return {};
  }
}
