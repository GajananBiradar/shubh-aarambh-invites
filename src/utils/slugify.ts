export const slugify = (groomName: string, brideName: string): string => {
  const groom = groomName.trim().split(' ')[0] || 'groom';
  const bride = brideName.trim().split(' ')[0] || 'bride';
  return `${groom}-weds-${bride}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
};
