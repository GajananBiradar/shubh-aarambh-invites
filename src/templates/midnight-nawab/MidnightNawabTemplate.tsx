// Midnight Nawab Template - Wedding, navy/gold Arabic theme
// Arabic-inspired geometric borders, ornate card style events
// Sections: Hero → Bismillah/Opening → Couple → Events → Gallery → RSVP → Footer

import CrimsonShaadiTemplate from '../crimson-shaadi/CrimsonShaadiTemplate';
import { TemplateProps } from '@/templates/types';

const MidnightNawabTemplate = (props: TemplateProps) => {
  // For now, use the same component with midnight theme applied via data-theme
  return <CrimsonShaadiTemplate {...props} />;
};

export default MidnightNawabTemplate;
