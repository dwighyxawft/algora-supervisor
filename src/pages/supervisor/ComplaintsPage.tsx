import { DataTable } from '@/components/supervisor/DataTable';
import { StatCard } from '@/components/supervisor/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquareWarning, AlertTriangle, CheckCircle, Clock, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const MOCK_COMPLAINTS = [
  { id: '1', subject: 'Mentor unresponsive for 3 days', from: 'Intern - Alice', against: 'Mentor - John Doe', severity: 'high', status: 'open', date: '2024-02-14' },
  { id: '2', subject: 'Incorrect grading on assignment', from: 'Intern - Bob', against: 'Mentor - Jane Smith', severity: 'medium', status: 'open', date: '2024-02-13' },
  { id: '3', subject: 'Scheduling conflict', from: 'Mentor - Mike Johnson', against: 'System', severity: 'low', status: 'resolved', date: '2024-02-12' },
  { id: '4', subject: 'Inappropriate behavior during class', from: 'Intern - Carol', against: 'Mentor - Alex Brown', severity: 'critical', status: 'escalated', date: '2024-02-11' },
  { id: '5', subject: 'Missing recordings', from: 'Intern - Dave', against: 'Mentor - Sarah Wilson', severity: 'low', status: 'closed', date: '2024-02-10' },
];

export default function ComplaintsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const severityColors: Record<string, string> = {
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-muted text-muted-foreground',
  };

  const statusColors: Record<string, string> = {
    open: 'bg-primary/10 text-primary border-primary/20',
    resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
    escalated: 'bg-destructive/10 text-destructive border-destructive/20',
    closed: 'bg-muted text-muted-foreground',
  };

  const filtered = severityFilter === 'all' ? MOCK_COMPLAINTS : MOCK_COMPLAINTS.filter(c => c.severity === severityFilter);

  const columns = [
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'from', label: 'From' },
    { key: 'against', label: 'Against' },
    { key: 'severity', label: 'Severity', render: (c: any) => <Badge className={severityColors[c.severity]}>{c.severity}</Badge> },
    { key: 'status', label: 'Status', render: (c: any) => <Badge className={statusColors[c.status]}>{c.status}</Badge> },
    { key: 'date', label: 'Date', sortable: true },
  ];

  const open = MOCK_COMPLAINTS.filter(c => c.status === 'open').length;
  const escalated = MOCK_COMPLAINTS.filter(c => c.status === 'escalated').length;
  const resolved = MOCK_COMPLAINTS.filter(c => c.status === 'resolved' || c.status === 'closed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
        <p className="text-sm text-muted-foreground mt-1">Handle and resolve complaints from mentors and interns.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={MOCK_COMPLAINTS.length} icon={MessageSquareWarning} delay={0} />
        <StatCard title="Open" value={open} icon={Clock} delay={0.1} />
        <StatCard title="Escalated" value={escalated} icon={ArrowUpRight} delay={0.2} />
        <StatCard title="Resolved" value={resolved} icon={CheckCircle} delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search complaints..."
        emptyMessage="No complaints found"
        emptyIcon={<MessageSquareWarning className="h-8 w-8" />}
        filters={
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
