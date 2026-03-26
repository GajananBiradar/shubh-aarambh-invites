// Ivory Garden Template - Wedding, ivory/botanical theme
// This is a placeholder that reuses the Crimson Shaadi structure
// TODO: Customize with botanical watercolor frame, timeline events, Pinterest grid

import CrimsonShaadiTemplate from '../crimson-shaadi/CrimsonShaadiTemplate';
import { TemplateProps } from '@/templates/types';

const IvoryGardenTemplate = (props: TemplateProps) => {
  // For now, use the same component with ivory theme applied via data-theme
  return <CrimsonShaadiTemplate {...props} />;
};

export default IvoryGardenTemplate;
