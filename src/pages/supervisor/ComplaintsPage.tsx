import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMentorComplaints, useUpdateMentorComplaint } from '@/hooks/use-api';
import { DataTable } from '@/components/supervisor/DataTable';
import { StatCard } from '@/components/supervisor/StatCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquareWarning, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { MentorComplaint, ComplaintStatus } from '@/lib/api/models';

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: complaints, isLoading } = useMentorComplaints(user?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusColors: Record<string, string> = {
    pending: 'bg-primary/10 text-primary border-primary/20',
    resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const filtered = useMemo(() => {
    if (!complaints) return [];
    if (statusFilter === 'all') return complaints;
    return complaints.filter(c => c.status === statusFilter);
  }, [complaints, statusFilter]);

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'mentor',
      label: 'Mentor',
      render: (c: MentorComplaint) => (
        <span className="text-sm">{c.mentor ? `${c.mentor.firstName} ${c.mentor.lastName}` : '—'}</span>
      ),
    },
    {
      key: 'intern',
      label: 'Filed By (Intern)',
      render: (c: MentorComplaint) => (
        <span className="text-sm">{c.intern ? `${c.intern.firstName} ${c.intern.lastName}` : '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (c: MentorComplaint) => <Badge className={statusColors[c.status] || ''}>{c.status}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (c: MentorComplaint) => <span className="text-sm">{new Date(c.createdAt).toLocaleDateString()}</span>,
    },
  ];

  const stats = useMemo(() => {
    if (!complaints) return { total: 0, pending: 0, resolved: 0, rejected: 0 };
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      rejected: complaints.filter(c => c.status === 'rejected').length,
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
        <h1 className="text-2xl font-bold tracking-tight">Intern Complaints</h1>
        <p className="text-sm text-muted-foreground mt-1">Complaints filed by interns against mentors under your supervision.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={stats.total} icon={MessageSquareWarning} delay={0} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} delay={0.1} />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} delay={0.2} />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search complaints..."
        onRowClick={(c) => navigate(`/supervisor/complaints/${c.id}`)}
        emptyMessage="No complaints found"
        emptyIcon={<MessageSquareWarning className="h-8 w-8" />}
        filters={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
