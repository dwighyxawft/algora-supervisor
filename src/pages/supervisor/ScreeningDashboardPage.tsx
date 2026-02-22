import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/supervisor/StatCard';
import { DataTable } from '@/components/supervisor/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, Plus, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import type { Screening } from '@/lib/api/models';

const MOCK_SCREENINGS = [
  { id: '1', title: 'React Developer Screening', mentor: 'John Doe', status: 'IN_PROGRESS', currentPhase: 2, assessmentPassed: true, codeInterviewPassed: false, qBotPassed: false, createdAt: new Date() },
  { id: '2', title: 'Backend Engineer Screening', mentor: 'Jane Smith', status: 'COMPLETED', currentPhase: 4, assessmentPassed: true, codeInterviewPassed: true, qBotPassed: true, createdAt: new Date() },
  { id: '3', title: 'Full-Stack Developer Screening', mentor: 'Mike Johnson', status: 'NOT_STARTED', currentPhase: 0, assessmentPassed: false, codeInterviewPassed: false, qBotPassed: false, createdAt: new Date() },
  { id: '4', title: 'DevOps Screening', mentor: 'Sarah Wilson', status: 'FAILED', currentPhase: 1, assessmentPassed: false, codeInterviewPassed: false, qBotPassed: false, createdAt: new Date() },
];

export default function ScreeningDashboardPage() {
  const navigate = useNavigate();

  const statusColors: Record<string, string> = {
    NOT_STARTED: 'bg-muted text-muted-foreground',
    IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
    COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
    FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const columns = [
    { key: 'title', label: 'Screening', sortable: true },
    { key: 'mentor', label: 'Mentor' },
    {
      key: 'status',
      label: 'Status',
      render: (s: any) => <Badge className={statusColors[s.status]}>{s.status.replace('_', ' ')}</Badge>,
    },
    { key: 'currentPhase', label: 'Phase', render: (s: any) => <span className="text-sm">Phase {s.currentPhase}/4</span> },
    {
      key: 'progress',
      label: 'Progress',
      render: (s: any) => (
        <div className="flex gap-1.5">
          <span title="Assessment">{s.assessmentPassed ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</span>
          <span title="Code Interview">{s.codeInterviewPassed ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</span>
          <span title="QBot">{s.qBotPassed ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</span>
        </div>
      ),
    },
  ];

  const passed = MOCK_SCREENINGS.filter(s => s.status === 'COMPLETED').length;
  const failed = MOCK_SCREENINGS.filter(s => s.status === 'FAILED').length;
  const pending = MOCK_SCREENINGS.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Screening & Certification</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage mentor screening tests.</p>
        </div>
        <Button className="gap-2 gradient-primary" onClick={() => navigate('/supervisor/screening/create')}>
          <Plus className="h-4 w-4" /> Create Screening
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Screenings" value={MOCK_SCREENINGS.length} icon={ClipboardCheck} delay={0} />
        <StatCard title="Passed" value={passed} icon={CheckCircle} delay={0.1} />
        <StatCard title="Failed" value={failed} icon={XCircle} delay={0.2} />
        <StatCard title="Pending" value={pending} icon={Clock} delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={MOCK_SCREENINGS}
        searchPlaceholder="Search screenings..."
        onRowClick={s => navigate(`/supervisor/screening/${s.id}`)}
        emptyMessage="No screenings created yet"
        emptyIcon={<ClipboardCheck className="h-8 w-8" />}
      />
    </div>
  );
}
