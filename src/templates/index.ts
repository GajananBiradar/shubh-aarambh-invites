import { TemplateComponent, TemplateRegistryEntry } from './types';

// Lazy load templates for code splitting
const CrimsonShaadiTemplate = () => import('./crimson-shaadi/CrimsonShaadiTemplate');
const IvoryGardenTemplate = () => import('./ivory-garden/VelvetPromiseEngagementTemplate');
const BlossomDateTemplate = () => import('./blossom-date/BlossomDateTemplate');
const MidnightNawabTemplate = () => import('./midnight-nawab/MidnightMoonlitTemplate');
const GoldenMemoTemplate = () => import('./golden-memo/GoldenMemoTemplate');
const BlushAffairTemplate = () => import('./blush-affair/BlushEditorialTemplate');
const FincaOliveTemplate = () => import('./finca-olive/FincaOliveTemplate');
const PremiumEleganteTemplate = () => import('./premium-elegante/PremiumEleganteTemplate');

// Registry mapping template slug/id to metadata
const templateRegistry: Record<string, TemplateRegistryEntry & { loader: () => Promise<{ default: TemplateComponent }> }> = {
  'crimson': {
    loader: CrimsonShaadiTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Crimson Shaadi',
    theme: 'crimson',
    category: 'Wedding',
  },
  'crimson-shaadi': {
    loader: CrimsonShaadiTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Crimson Shaadi',
    theme: 'crimson',
    category: 'Wedding',
  },
  'ivory': {
    loader: IvoryGardenTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Velvet Promise',
    theme: 'ivory',
    category: 'Engagement',
  },
  'ivory-garden': {
    loader: IvoryGardenTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Velvet Promise',
    theme: 'ivory',
    category: 'Engagement',
  },
  'blossom': {
    loader: BlossomDateTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Blossom Date',
    theme: 'blossom',
    category: 'Save The Date',
  },
  'blossom-date': {
    loader: BlossomDateTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Blossom Date',
    theme: 'blossom',
    category: 'Save The Date',
  },
  'midnight': {
    loader: MidnightNawabTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Midnight Reverie',
    theme: 'midnight',
    category: 'Wedding',
  },
  'midnight-nawab': {
    loader: MidnightNawabTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Midnight Reverie',
    theme: 'midnight',
    category: 'Wedding',
  },
  'golden': {
    loader: GoldenMemoTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Golden Memo',
    theme: 'golden',
    category: 'Save The Date',
  },
  'golden-memo': {
    loader: GoldenMemoTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Golden Memo',
    theme: 'golden',
    category: 'Save The Date',
  },
  'blush': {
    loader: BlushAffairTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Blush Affair',
    theme: 'blush',
    category: 'Engagement',
  },
  'blush-affair': {
    loader: BlushAffairTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Blush Affair',
    theme: 'blush',
    category: 'Engagement',
  },
  'finca': {
    loader: FincaOliveTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Finca Olive',
    theme: 'finca',
    category: 'Wedding',
  },
  'finca-olive': {
    loader: FincaOliveTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Finca Olive',
    theme: 'finca',
    category: 'Wedding',
  },
  'premium': {
    loader: PremiumEleganteTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Premium Elegante',
    theme: 'premium',
    category: 'Wedding',
  },
  'premium-elegante': {
    loader: PremiumEleganteTemplate,
    component: null as unknown as TemplateComponent,
    name: 'Premium Elegante',
    theme: 'premium',
    category: 'Wedding',
  },
};

// Map numeric IDs to slugs (for API compatibility)
const idToSlugMap: Record<string, string> = {
  '1': 'crimson',
  '2': 'ivory',
  '3': 'blossom',
  '4': 'midnight',
  '5': 'golden',
  '6': 'blush',
  '7': 'premium',
  '8': 'finca',
};

/**
 * Get template component by slug or id
 * Returns null if template not found
 */
export const getTemplateComponent = async (slugOrId: string): Promise<TemplateComponent | null> => {
  // Normalize the slug (handle numeric IDs)
  const slug = idToSlugMap[slugOrId] || slugOrId.toLowerCase();
  
  const entry = templateRegistry[slug];
  if (!entry) {
    console.warn(`Template not found: ${slugOrId}`);
    return null;
  }
  
  try {
    const module = await entry.loader();
    return module.default;
  } catch (error) {
    console.error(`Failed to load template: ${slugOrId}`, error);
    return null;
  }
};

/**
 * Get template metadata by slug or id
 */
export const getTemplateMetadata = (slugOrId: string): Omit<TemplateRegistryEntry, 'component'> | null => {
  const slug = idToSlugMap[slugOrId] || slugOrId.toLowerCase();
  const entry = templateRegistry[slug];
  
  if (!entry) return null;
  
  return {
    name: entry.name,
    theme: entry.theme,
    category: entry.category,
  };
};

/**
 * Get theme name by slug or id
 */
export const getTemplateTheme = (slugOrId: string): string => {
  const slug = idToSlugMap[slugOrId] || slugOrId.toLowerCase();
  return templateRegistry[slug]?.theme || 'crimson';
};

/**
 * Check if a template exists
 */
export const templateExists = (slugOrId: string): boolean => {
  const slug = idToSlugMap[slugOrId] || slugOrId.toLowerCase();
  return slug in templateRegistry;
};

/**
 * Get all available template slugs
 */
export const getAvailableTemplates = (): string[] => {
  return Object.keys(templateRegistry).filter(key => !idToSlugMap[key]);
};

export type { TemplateComponent, TemplateRegistryEntry };
