import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlatformAnalytics } from '@/api/admin';
import { Skeleton } from '@/components/ui/skeleton';

const AdminAnalyticsTab = () => {
  const [from, setFrom] = useState('2025-01-01');
  const [to, setTo] = useState('2026-12-31');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics', from, to],
    queryFn: () => getPlatformAnalytics(from, to),
  });

  const stats = [
    { label: 'Total Users', value: data?.newUsersCount ?? 0 },
    { label: 'Total Visits', value: data?.totalVisits ?? 0 },
    { label: 'Invitations Created', value: data?.totalInvitationsCreated ?? 0 },
    { label: 'Total RSVPs', value: data?.totalRsvps ?? 0 },
    { label: 'Revenue (₹)', value: `₹${data?.totalRevenue?.inr ?? 0}` },
  ];

  return (
    <div>
      <div className="flex gap-3 mb-6 items-end">
        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1">From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground block mb-1">To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-5 text-center">
              <p className="font-heading text-2xl font-bold text-primary">{s.value}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsTab;
