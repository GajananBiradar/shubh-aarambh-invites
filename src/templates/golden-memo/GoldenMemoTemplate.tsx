// Golden Memo Template - Save The Date, champagne/gold theme
// Bold gold typography on deep champagne
// Minimal sections: big date display + location + RSVP

import CrimsonShaadiTemplate from '../crimson-shaadi/CrimsonShaadiTemplate';
import { TemplateProps } from '@/templates/types';

const GoldenMemoTemplate = (props: TemplateProps) => {
  // For now, use the same component with golden theme applied via data-theme
  return <CrimsonShaadiTemplate {...props} />;
};

export default GoldenMemoTemplate;
