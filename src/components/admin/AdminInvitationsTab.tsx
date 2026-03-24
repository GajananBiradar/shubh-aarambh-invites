import { useQuery } from '@tanstack/react-query';
import { getAdminInvitations } from '@/api/admin';
import { Skeleton } from '@/components/ui/skeleton';

const AdminInvitationsTab = () => {
  const { data: invitations, isLoading } = useQuery({ queryKey: ['admin-invitations'], queryFn: getAdminInvitations });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {['Code', 'Slug', 'Couple', 'Status', 'Views', 'Created'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-body font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invitations?.map((inv: any) => (
            <tr key={inv.id} className="border-t border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-body font-mono text-xs">{inv.accessCode}</td>
              <td className="px-4 py-3 font-body text-muted-foreground">{inv.slug}</td>
              <td className="px-4 py-3 font-body font-medium">{inv.brideName} & {inv.groomName}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${
                  inv.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {inv.status === 'PUBLISHED' ? '● Live' : '● Draft'}
                </span>
              </td>
              <td className="px-4 py-3 font-body text-muted-foreground">{inv.viewCount ?? 0}</td>
              <td className="px-4 py-3 font-body text-xs text-muted-foreground">
                {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInvitationsTab;
