import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminQuotes, updateQuoteStatus } from '@/api/admin';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-500/10 text-blue-400',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400',
  QUOTED: 'bg-purple-500/10 text-purple-400',
  CLOSED: 'bg-muted text-muted-foreground',
};

const STATUSES = ['NEW', 'IN_PROGRESS', 'QUOTED', 'CLOSED'];

const AdminQuotesTab = () => {
  const qc = useQueryClient();
  const { data: quotes, isLoading } = useQuery({ queryKey: ['admin-quotes'], queryFn: getAdminQuotes });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateQuoteStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-quotes'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {['Name', 'Email', 'Phone', 'Budget', 'Event Date', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left font-body font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quotes?.map((q: any) => (
            <tr key={q.id} className="border-t border-border hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-body font-medium">{q.name}</td>
              <td className="px-4 py-3 font-body text-muted-foreground">{q.email}</td>
              <td className="px-4 py-3 font-body text-muted-foreground">{q.phone || '—'}</td>
              <td className="px-4 py-3 font-body">{q.budgetInr ? `₹${q.budgetInr}` : '—'}</td>
              <td className="px-4 py-3 font-body text-muted-foreground">{q.eventDate || '—'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-body font-medium ${STATUS_COLORS[q.status] || STATUS_COLORS.CLOSED}`}>
                  {q.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={q.status}
                  onChange={e => statusMut.mutate({ id: q.id, status: e.target.value })}
                  className="text-xs px-2 py-1 rounded-lg border border-border bg-background font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminQuotesTab;
