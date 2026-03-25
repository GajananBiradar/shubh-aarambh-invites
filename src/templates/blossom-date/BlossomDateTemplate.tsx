// Blossom Date Template - Save The Date, pastel/floral theme
// Simplified sections: Hero → Date Announcement → Location → RSVP → Share
// No events list, no gallery, no detailed countdown

import CrimsonShaadiTemplate from '../crimson-shaadi/CrimsonShaadiTemplate';
import { TemplateProps } from '@/templates/types';

const BlossomDateTemplate = (props: TemplateProps) => {
  // For now, use the same component with blossom theme applied via data-theme
  return <CrimsonShaadiTemplate {...props} />;
};

export default BlossomDateTemplate;
