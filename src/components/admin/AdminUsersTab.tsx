import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, setUserFreeAccess, deactivateUser } from '@/api/admin';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

const AdminUsersTab = () => {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: getAdminUsers });

  const freeMut = useMutation({
    mutationFn: ({ id, isFreeUser }: { id: string; isFreeUser: boolean }) => setUserFreeAccess(id, isFreeUser),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User deactivated'); },
    onError: () => toast.error('Failed to deactivate'),
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {['Name', 'Email', 'Role', 'Free Access', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-body font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users?.map((u: any) => (
            <tr key={u.id} className="border-t border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-body font-medium">{u.name}</td>
              <td className="px-4 py-3 font-body text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${u.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${u.isFreeUser ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                  {u.isFreeUser ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => freeMut.mutate({ id: u.id, isFreeUser: !u.isFreeUser })}
                    className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition-colors font-body"
                  >
                    {u.isFreeUser ? 'Revoke Free' : 'Grant Free'}
                  </button>
                  <button
                    onClick={() => deactivateMut.mutate(u.id)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors font-body"
                  >
                    Deactivate
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersTab;
