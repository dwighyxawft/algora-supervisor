import { useComplaints, useUpdateComplaint } from '@/hooks/use-api';
import { DataTable } from '@/components/supervisor/DataTable';
import { StatCard } from '@/components/supervisor/StatCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquareWarning, CheckCircle, Clock, ArrowUpRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { ContactComplaint } from '@/lib/api/models';

export default function ComplaintsPage() {
  const { data: complaints, isLoading } = useComplaints();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusColors: Record<string, string> = {
    open: 'bg-primary/10 text-primary border-primary/20',
    closed: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const filtered = useMemo(() => {
    if (!complaints) return [];
    if (statusFilter === 'all') return complaints;
    return complaints.filter(c => c.status === statusFilter);
  }, [complaints, statusFilter]);

  const columns = [
    { key: 'subject', label: 'Subject', sortable: true },
    {
      key: 'from',
      label: 'From',
      render: (c: ContactComplaint) => (
        <span className="text-sm">
          {c.intern ? `Intern - ${c.intern.firstName}` : c.mentor ? `Mentor - ${c.mentor.firstName}` : 'Unknown'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (c: ContactComplaint) => <Badge className={statusColors[c.status] || ''}>{c.status}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (c: ContactComplaint) => <span className="text-sm">{new Date(c.createdAt).toLocaleDateString()}</span>,
    },
  ];

  const stats = useMemo(() => {
    if (!complaints) return { total: 0, open: 0, closed: 0 };
    return {
      total: complaints.length,
      open: complaints.filter(c => c.status === 'open').length,
      closed: complaints.filter(c => c.status === 'closed').length,
    };
  }, [complaints]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
        <p className="text-sm text-muted-foreground mt-1">Handle and resolve complaints from mentors and interns.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Complaints" value={stats.total} icon={MessageSquareWarning} delay={0} />
        <StatCard title="Open" value={stats.open} icon={Clock} delay={0.1} />
        <StatCard title="Closed" value={stats.closed} icon={CheckCircle} delay={0.2} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search complaints..."
        emptyMessage="No complaints found"
        emptyIcon={<MessageSquareWarning className="h-8 w-8" />}
        filters={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
