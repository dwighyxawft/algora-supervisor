import { useNavigate } from 'react-router-dom';
import { useScreenings } from '@/hooks/use-api';
import { StatCard } from '@/components/supervisor/StatCard';
import { DataTable } from '@/components/supervisor/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClipboardCheck, Plus, CheckCircle, XCircle, Clock, FileText, Image as ImageIcon, Bot, Code } from 'lucide-react';
import { useMemo } from 'react';
import type { Screening } from '@/lib/api/models';

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
};

const PHASE_ICONS = [FileText, ImageIcon, Bot, Code];
const PHASE_LABELS = ['Assessment', 'Work Samples', 'QBot', 'Code Interview'];

export default function ScreeningDashboardPage() {
  const navigate = useNavigate();
  const { data: screenings, isLoading } = useScreenings();

  const columns = [
    {
      key: 'mentor',
      label: 'Mentor',
      render: (s: Screening) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={s.mentor?.image} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {s.mentor?.firstName?.[0]}{s.mentor?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{s.mentor ? `${s.mentor.firstName} ${s.mentor.lastName}` : '—'}</p>
            <p className="text-xs text-muted-foreground">{s.mentor?.email || s.mentor_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (s: Screening) => <Badge className={statusColors[s.status]}>{s.status.replace('_', ' ')}</Badge>,
    },
    {
      key: 'currentPhase',
      label: 'Current Phase',
      render: (s: Screening) => {
        const phaseIdx = Math.min(Math.max(s.currentPhase - 1, 0), 3);
        const Icon = PHASE_ICONS[phaseIdx];
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">{PHASE_LABELS[phaseIdx]} ({s.currentPhase}/4)</span>
          </div>
        );
      },
    },
    {
      key: 'progress',
      label: 'Phase Progress',
      render: (s: Screening) => (
        <div className="flex gap-1.5">
          <span title="Assessment">{s.assessmentPassed ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</span>
          <span title="Work Samples">{s.currentPhase > 2 ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</span>
          <span title="QBot">{s.qBotPassed ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</span>
          <span title="Code Interview">{s.codeInterviewPassed ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</span>
        </div>
      ),
    },
    {
      key: 'attempts',
      label: 'Retries Used',
      render: (s: Screening) => (
        <span className="text-xs text-muted-foreground">
          A:{s.assessmentRetries} · Q:{s.qBotRetries} · C:{s.codeInterviewRetries}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (s: Screening) => <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'action',
      label: '',
      render: (s: Screening) => (
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={e => { e.stopPropagation(); navigate(`/supervisor/screening/${s.id}`); }}>
          Review
        </Button>
      ),
    },
  ];

  const stats = useMemo(() => {
    if (!screenings) return { passed: 0, failed: 0, pending: 0, total: 0 };
    return {
      total: screenings.length,
      passed: screenings.filter(s => s.status === 'COMPLETED').length,
      failed: screenings.filter(s => s.status === 'FAILED').length,
      pending: screenings.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED').length,
    };
  }, [screenings]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Screening & Certification</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage mentor screening pipelines and certification workflows.</p>
        </div>
        <Button className="gap-2 gradient-primary" onClick={() => navigate('/supervisor/screening/create')}>
          <Plus className="h-4 w-4" /> Create Screening
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Screenings" value={stats.total} icon={ClipboardCheck} delay={0} />
        <StatCard title="Passed" value={stats.passed} icon={CheckCircle} delay={0.1} />
        <StatCard title="Failed" value={stats.failed} icon={XCircle} delay={0.2} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={screenings || []}
        searchPlaceholder="Search by mentor name, email, or status..."
        onRowClick={s => navigate(`/supervisor/screening/${s.id}`)}
        emptyMessage="No screenings created yet. Create one to start screening mentors."
        emptyIcon={<ClipboardCheck className="h-8 w-8" />}
      />
    </div>
  );
}
