import { useState } from 'react';
import { useProjectExams, useProjectExamSubmissions, useReviewProjectSubmission } from '@/hooks/use-api';
import { DataTable } from '@/components/supervisor/DataTable';
import { StatCard } from '@/components/supervisor/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FolderOpen, FileCode, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useMemo } from 'react';
import type { ProjectExamSubmission } from '@/lib/api/models';

export default function ProjectSubmissionsPage() {
  const { data: projectExams, isLoading: examsLoading } = useProjectExams();
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const { data: submissions, isLoading: subsLoading } = useProjectExamSubmissions(selectedExamId);
  const reviewMutation = useReviewProjectSubmission();
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; submission?: ProjectExamSubmission }>({ open: false });
  const [markGiven, setMarkGiven] = useState<number>(0);
  const [passed, setPassed] = useState(false);

  const stats = useMemo(() => {
    if (!submissions) return { total: 0, reviewed: 0, ongoing: 0, submitted: 0 };
    return {
      total: submissions.length,
      reviewed: submissions.filter(s => s.status === 'Reviewed').length,
      ongoing: submissions.filter(s => s.status === 'Ongoing').length,
      submitted: submissions.filter(s => s.status === 'Submitted').length,
    };
  }, [submissions]);

  const statusColors: Record<string, string> = {
    Ongoing: 'bg-primary/10 text-primary border-primary/20',
    Submitted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Reviewed: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const columns = [
    {
      key: 'intern',
      label: 'Intern',
      render: (s: ProjectExamSubmission) => (
        <span className="text-sm font-medium">{s.intern ? `${s.intern.firstName} ${s.intern.lastName}` : s.internId}</span>
      ),
    },
    {
      key: 'link',
      label: 'Submission',
      render: (s: ProjectExamSubmission) => s.link ? (
        <a href={s.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm">
          <ExternalLink className="h-3.5 w-3.5" /> View
        </a>
      ) : <span className="text-sm text-muted-foreground">No link</span>,
    },
    {
      key: 'markGiven',
      label: 'Mark',
      render: (s: ProjectExamSubmission) => <span className="text-sm font-medium">{s.markGiven != null ? s.markGiven : '—'}</span>,
    },
    {
      key: 'passed',
      label: 'Passed',
      render: (s: ProjectExamSubmission) => (
        <Badge className={s.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-muted text-muted-foreground'}>
          {s.passed ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (s: ProjectExamSubmission) => <Badge className={statusColors[s.status] || ''}>{s.status}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      render: (s: ProjectExamSubmission) => s.status === 'Submitted' ? (
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setMarkGiven(s.markGiven || 0); setPassed(s.passed); setReviewDialog({ open: true, submission: s }); }}>
          Review
        </Button>
      ) : null,
    },
  ];

  if (examsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and grade intern project exam submissions.</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-4">
          <Label className="text-sm text-muted-foreground mb-2 block">Select Project Exam</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a project exam..." />
            </SelectTrigger>
            <SelectContent>
              {projectExams?.map(pe => (
                <SelectItem key={pe.id} value={pe.examId}>{pe.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedExamId && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard title="Total Submissions" value={stats.total} icon={FolderOpen} delay={0} />
            <StatCard title="Submitted" value={stats.submitted} icon={FileCode} delay={0.1} />
            <StatCard title="Reviewed" value={stats.reviewed} icon={CheckCircle} delay={0.2} />
            <StatCard title="Ongoing" value={stats.ongoing} icon={Clock} delay={0.3} />
          </div>

          {subsLoading ? (
            <Skeleton className="h-96 rounded-xl" />
          ) : (
            <DataTable
              columns={columns}
              data={submissions || []}
              searchPlaceholder="Search submissions..."
              emptyMessage="No submissions for this exam"
              emptyIcon={<FolderOpen className="h-8 w-8" />}
            />
          )}
        </>
      )}

      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, submission: reviewDialog.submission })}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reviewDialog.submission?.link && (
              <div>
                <Label className="text-sm text-muted-foreground">Submission Link</Label>
                <a href={reviewDialog.submission.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm mt-1">
                  <ExternalLink className="h-3.5 w-3.5" /> {reviewDialog.submission.link}
                </a>
              </div>
            )}
            <div className="space-y-2">
              <Label>Mark</Label>
              <Input type="number" value={markGiven} onChange={e => setMarkGiven(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={passed} onCheckedChange={setPassed} />
              <Label>Passed</Label>
            </div>
            <Button
              className="w-full gradient-primary"
              disabled={reviewMutation.isPending}
              onClick={() => {
                if (reviewDialog.submission) {
                  reviewMutation.mutate(
                    { submissionId: reviewDialog.submission.id, data: { markGiven, passed } },
                    { onSuccess: () => setReviewDialog({ open: false }) }
                  );
                }
              }}
            >
              {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
