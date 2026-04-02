import { useParams, useNavigate } from 'react-router-dom';
import {
  useScreenings, useScreening, useApproveAssessmentRetry, useApproveCodeAttempt, useRejectCodeAttempt,
  useApproveQbotRetry, useRejectQbotRetry, useMentorWorkSamples, useCreateQbot,
  useStartQbotInterview, useGenerateQbotQuestions, useCreateCodeInterview, useUpdateScreening,
  useUpdateWorkSample,
  useDeleteScreening,
} from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/supervisor/DataTable';
import {
  ArrowLeft, CheckCircle, XCircle, Code, FileText, Bot, Shield, Loader2,
  RefreshCw, Clock, Plus, ExternalLink, Image as ImageIcon, Calendar, Video,
  Eye, ClipboardCheck, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { reviewService, workSampleService, mentorService } from '@/lib/api/services';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AssessmentStatus } from '@/lib/api/models';
import type { Screening } from '@/lib/api/models';
import type { CreateCodeInterviewDto } from '@/lib/api/dto';
import { useMemo } from 'react';
import { StatCard } from '@/components/supervisor/StatCard';

// ===================== STATUS HELPERS =====================

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
};

const PHASES = [
  { key: 'assessment', label: 'Assessment', icon: FileText, phase: 1 },
  { key: 'workSample', label: 'Work Samples', icon: ImageIcon, phase: 2 },
  { key: 'qbot', label: 'QBot Interview', icon: Bot, phase: 3 },
  { key: 'codeInterview', label: 'Code Interview', icon: Code, phase: 4 },
];

const PHASE_ICONS = [FileText, ImageIcon, Bot, Code];
const PHASE_LABELS = ['Assessment', 'Work Samples', 'QBot', 'Code Interview'];

// ===================== LIST VIEW (no :id param) =====================

function ScreeningListView() {
  const navigate = useNavigate();
  const { data: screenings, isLoading } = useScreenings();

  const stats = useMemo(() => {
    if (!screenings) return { passed: 0, failed: 0, pending: 0, total: 0 };
    return {
      total: screenings.length,
      passed: screenings.filter(s => s.status === 'COMPLETED').length,
      failed: screenings.filter(s => s.status === 'FAILED').length,
      pending: screenings.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED').length,
    };
  }, [screenings]);

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

// ===================== DETAIL VIEW =====================

function ScreeningDetailView({ screeningId }: { screeningId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: screening, isLoading, refetch } = useScreening(screeningId);

  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewReport, setReviewReport] = useState('');

  // Code interview scheduling state
  const [showCreateCI, setShowCreateCI] = useState(false);
  const [ciTitle, setCiTitle] = useState('');
  const [ciDescription, setCiDescription] = useState('');
  const [ciDuration, setCiDuration] = useState('60');
  const [ciPassCutoff, setCiPassCutoff] = useState('70');
  const [ciStartDateTime, setCiStartDateTime] = useState('');
  const [ciEndDateTime, setCiEndDateTime] = useState('');

  const approveRetry = useApproveAssessmentRetry();
  const approveCode = useApproveCodeAttempt();
  const rejectCode = useRejectCodeAttempt();
  const approveQbot = useApproveQbotRetry();
  const rejectQbot = useRejectQbotRetry();
  const createQbot = useCreateQbot();
  const startQbot = useStartQbotInterview();
  const generateQbotQ = useGenerateQbotQuestions();
  const createCodeInterview = useCreateCodeInterview();
  const updateScreening = useUpdateScreening();
  const updateWorkSample = useUpdateWorkSample();
  const deleteScreening = useDeleteScreening();

  const mentorId = screening?.mentor_id || '';
  const { data: workSamples } = useMentorWorkSamples(mentorId);

  // ====== HANDLERS ======

  const handleApproveWorkSamples = async () => {
    if (!screening) return;
    setApproving(true);
    try {
      await updateScreening.mutateAsync({ id: screening.id, data: { currentPhase: 3 } as any });
      toast({ title: 'Work samples approved', description: 'Phase 3 (QBot) is now unlocked.' });
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setApproving(false);
    }
  };

  const handleRejectWorkSamples = async () => {
    if (!screening) return;
    setRejecting(true);
    try {
      await updateScreening.mutateAsync({ id: screening.id, data: { status: 'FAILED' as any } });
      toast({ title: 'Work samples rejected. Screening failed.' });
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setRejecting(false);
    }
  };

  const handleUpdateWorkSampleStatus = async (sampleId: string, status: 'accepted' | 'rejected' | 'pending') => {
    try {
      await updateWorkSample.mutateAsync({ id: sampleId, status });
      refetch();
    } catch {}
  };

  const handleCreateQbot = async () => {
    if (!screening) return;
    try {
      const qbot = await createQbot.mutateAsync({
        screeningId: screening.id,
        startDate: new Date(),
      });
      if (qbot?.id) {
        await generateQbotQ.mutateAsync({ qbotId: qbot.id, mentorId: screening.mentor_id });
      }
      refetch();
    } catch {}
  };

  const handleCreateCodeInterview = async () => {
    if (!screening) return;
    const dto: CreateCodeInterviewDto = {
      mentor_id: screening.mentor_id,
      screening_id: screening.id,
      title: ciTitle || 'Live Code Interview',
      description: ciDescription,
      passCutoff: parseInt(ciPassCutoff) || 70,
      status: AssessmentStatus.PENDING,
      durationMinutes: parseInt(ciDuration) || 60,
      startDateTime: ciStartDateTime ? new Date(ciStartDateTime) : undefined,
      endDateTime: ciEndDateTime ? new Date(ciEndDateTime) : undefined,
    };
    try {
      await createCodeInterview.mutateAsync(dto);
      setShowCreateCI(false);
      setCiTitle(''); setCiDescription(''); setCiStartDateTime(''); setCiEndDateTime('');
      refetch();
    } catch {}
  };

  const handleApprove = async () => {
    if (!screening || !user) return;
    setApproving(true);
    try {
      // Approve mentor via PATCH /mentor/approve/:id
      await mentorService.approve(screening.mentor_id);
      // Also complete the screening review
      const review = await reviewService.start({
        screening_id: screening.id, supervisor_id: user.id, mentor_id: screening.mentor_id,
      });
      await reviewService.complete(review.id, {
        passed: true,
        report: reviewReport || 'Mentor approved after comprehensive screening.',
        comments: reviewComments || 'All screening phases completed successfully.',
      });
      toast({ title: 'Mentor approved & certified!' });
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!screening || !user) return;
    setRejecting(true);
    try {
      const review = await reviewService.start({
        screening_id: screening.id, supervisor_id: user.id, mentor_id: screening.mentor_id,
      });
      await reviewService.complete(review.id, {
        passed: false,
        report: reviewReport || 'Mentor did not meet screening requirements.',
        comments: reviewComments || 'Screening review: mentor rejected.',
      });
      toast({ title: 'Mentor rejected' });
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setRejecting(false);
    }
  };

  if (isLoading || !screening) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const mentor = screening.mentor;

  const phaseStatus = [
    { passed: screening.assessmentPassed, score: screening.finalAssessmentScore, retries: screening.assessmentRetries, maxRetries: 2 },
    { passed: screening.currentPhase > 2, score: null, retries: 0, maxRetries: 0 },
    { passed: screening.qBotPassed, score: null, retries: screening.qBotRetries, maxRetries: 2 },
    { passed: screening.codeInterviewPassed, score: screening.finalCodeInterviewScore, retries: screening.codeInterviewRetries, maxRetries: 2 },
  ];

  const canAccessPhase = (phase: number) => {
    if (phase === 1) return true;
    if (phase === 2) return screening.assessmentPassed;
    if (phase === 3) return screening.assessmentPassed && screening.currentPhase >= 3;
    if (phase === 4) return screening.assessmentPassed && screening.currentPhase >= 3 && screening.qBotPassed;
    return false;
  };

  const acceptedSamplesCount = workSamples?.filter(ws => ws.status === 'accepted').length || 0;
  const allPhasesComplete = screening.assessmentPassed && screening.currentPhase >= 3 && screening.qBotPassed && screening.codeInterviewPassed;

  const getPhaseState = (phase: number): string => {
    const ps = phaseStatus[phase - 1];
    if (ps.passed) return 'Passed';
    if (!canAccessPhase(phase)) return 'Locked';
    if (screening.status === 'FAILED') return 'Failed';
    if (phase === 1 && screening.assessments && screening.assessments.length > 0) {
      const latest = screening.assessments[screening.assessments.length - 1];
      if (latest.status === 'COMPLETED' && !latest.passed) return 'Failed';
      if (latest.status === 'IN_PROGRESS' || latest.status === 'NOT_STARTED') return 'In Progress';
      return 'Awaiting Review';
    }
    if (phase === 2 && workSamples && workSamples.length > 0) return 'Awaiting Review';
    if (phase === 3 && screening.qbots && screening.qbots.length > 0) {
      const latest = screening.qbots[screening.qbots.length - 1];
      if (latest.status === 'completed' && !latest.satisfactory) return 'Failed';
      if (latest.status === 'completed' && latest.satisfactory) return 'Passed';
      return 'In Progress';
    }
    if (phase === 4 && screening.codeInterviews && screening.codeInterviews.length > 0) {
      const latest = screening.codeInterviews[screening.codeInterviews.length - 1];
      if (latest.status === 'COMPLETED' && !latest.passed) return 'Failed';
      if (latest.status === 'COMPLETED' && latest.passed) return 'Passed';
      return 'In Progress';
    }
    return 'Not Started';
  };

  const stateColors: Record<string, string> = {
    'Passed': 'text-green-400',
    'Failed': 'text-destructive',
    'In Progress': 'text-primary',
    'Awaiting Review': 'text-amber-400',
    'Locked': 'text-muted-foreground/50',
    'Not Started': 'text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/supervisor/screening')} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Screenings
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={async () => {
            if (!confirm('Are you sure you want to delete this screening? This action cannot be undone.')) return;
            try {
              await deleteScreening.mutateAsync(screeningId);
              toast({ title: 'Screening deleted successfully' });
              navigate('/supervisor/screening');
            } catch {}
          }}
          disabled={deleteScreening.isPending}
        >
          {deleteScreening.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete Screening
        </Button>
      </div>

      {/* ====== MENTOR PROFILE HEADER ====== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={mentor?.image} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {mentor?.firstName?.[0]}{mentor?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{mentor ? `${mentor.firstName} ${mentor.lastName}` : screening.title}</h1>
                  <Badge className={statusColors[screening.status]}>{screening.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{mentor?.email}</p>
                {mentor?.bio && <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>}
                <div className="flex flex-wrap gap-4 pt-1">
                  {mentor?.country && <span className="text-xs text-muted-foreground">📍 {mentor.country}{mentor.stateOrProvince ? `, ${mentor.stateOrProvince}` : ''}</span>}
                  {mentor?.majors && mentor.majors.length > 0 && <span className="text-xs text-muted-foreground">🎓 {mentor.majors.map(m => m.name).join(', ')}</span>}
                  {mentor?.portfolioUrl && <a href={mentor.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Portfolio</a>}
                  {mentor?.githubUrl && <a href={mentor.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> GitHub</a>}
                  {mentor?.linkedinUrl && <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> LinkedIn</a>}
                </div>
                {mentor?.majors && mentor.majors.some(m => m.certifications && m.certifications.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mentor.majors.flatMap(m => m.certifications || []).map((cert, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{cert.type} — {cert.institution}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Phase</p>
                <p className="text-3xl font-bold gradient-text">{screening.currentPhase}/4</p>
                <p className="text-[10px] text-muted-foreground mt-1">Created {new Date(screening.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ====== PROGRESS TRACKER ====== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Screening Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-border" />
              {PHASES.map((phase, i) => {
                const status = phaseStatus[i];
                const isActive = screening.currentPhase === phase.phase;
                const isDone = status.passed;
                const locked = !canAccessPhase(phase.phase);
                const state = getPhaseState(phase.phase);
                return (
                  <div key={phase.key} className="relative flex flex-col items-center gap-2 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isDone ? 'bg-green-500/20 border-2 border-green-500' :
                      isActive ? 'bg-primary/20 border-2 border-primary animate-pulse' :
                      locked ? 'bg-muted/50 border-2 border-border/50 opacity-50' :
                      'bg-muted border-2 border-border'
                    }`}>
                      {isDone ? <CheckCircle className="h-5 w-5 text-green-400" /> :
                       <phase.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                    </div>
                    <span className={`text-xs font-medium text-center ${isDone ? 'text-green-400' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {phase.label}
                    </span>
                    <span className={`text-[10px] ${stateColors[state] || 'text-muted-foreground'}`}>{state}</span>
                    {status.score != null && <span className="text-xs text-muted-foreground">{status.score}%</span>}
                    {status.retries > 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <RefreshCw className="h-2.5 w-2.5" /> {status.retries}/{status.maxRetries}
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Approval node */}
              <div className="relative flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  screening.status === 'COMPLETED' ? 'bg-green-500/20 border-2 border-green-500' :
                  allPhasesComplete ? 'bg-primary/20 border-2 border-primary animate-pulse' :
                  'bg-muted/50 border-2 border-border/50 opacity-50'
                }`}>
                  <Shield className={`h-5 w-5 ${screening.status === 'COMPLETED' ? 'text-green-400' : allPhasesComplete ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-xs font-medium ${screening.status === 'COMPLETED' ? 'text-green-400' : 'text-muted-foreground'}`}>Approval</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ====== PHASE SECTIONS ====== */}
      <div className="space-y-6">

        {/* ====== PHASE 1 — ASSESSMENT ====== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${phaseStatus[0].passed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    <FileText className={`h-4 w-4 ${phaseStatus[0].passed ? 'text-green-400' : 'text-primary'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Phase 1 — Assessment</CardTitle>
                    <CardDescription>Theory or objective assessment. Max 2 retries (3 total attempts).</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={stateColors[getPhaseState(1)] || ''}>{getPhaseState(1)}</Badge>
                  {!screening.assessmentPassed && screening.status !== 'FAILED' && (
                    <Button size="sm" className="gap-1.5 gradient-primary" onClick={() => navigate(`/supervisor/screening/${screeningId}/assessment/create`)}>
                      <Plus className="h-3.5 w-3.5" /> Create Assessment
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {screening.assessments && screening.assessments.length > 0 ? (
                screening.assessments.map(a => (
                  <div key={a.id} className="p-4 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.type} · {a.status} · {a.durationMinutes}min</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.score != null && <span className="text-sm font-semibold">{a.score} pts</span>}
                        <Badge className={a.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : a.status === 'COMPLETED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}>
                          {a.passed ? 'Passed' : a.status}
                        </Badge>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate(`/supervisor/screening/${screeningId}/assessment/${a.id}`)}>
                          <Eye className="h-3 w-3" /> Details
                        </Button>
                        {a.status === 'COMPLETED' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate(`/supervisor/screening/${screeningId}/assessment/${a.id}/submission`)}>
                            <Eye className="h-3 w-3" /> Submission
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No assessments created yet.</p>
              )}

              {/* Retry requests */}
              {screening.retries && screening.retries.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Retry Requests</p>
                  {screening.retries.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.requestedStart).toLocaleDateString()} — {new Date(r.requestedEnd).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">{r.status}</Badge>
                      </div>
                      {r.status === 'PENDING' && screening.assessmentRetries < 2 && (
                        <Button size="sm" variant="outline" onClick={() => approveRetry.mutate(r.id)} disabled={approveRetry.isPending}>
                          {approveRetry.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve Retry'}
                        </Button>
                      )}
                      {r.status === 'PENDING' && screening.assessmentRetries >= 2 && (
                        <span className="text-[10px] text-destructive">Max retries reached</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Attempts used: {screening.assessmentRetries}/2 retries</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ====== PHASE 2 — WORK SAMPLES ====== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`glass-card ${!canAccessPhase(2) ? 'opacity-50' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${phaseStatus[1].passed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    <ImageIcon className={`h-4 w-4 ${phaseStatus[1].passed ? 'text-green-400' : 'text-primary'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Phase 2 — Work Samples</CardTitle>
                    <CardDescription>Mentor must have 3 accepted work samples. Accepted: {acceptedSamplesCount}/3</CardDescription>
                  </div>
                </div>
                <Badge className={stateColors[getPhaseState(2)] || ''}>{getPhaseState(2)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {workSamples && workSamples.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {workSamples.map(ws => (
                    <Card key={ws.id} className={`bg-muted/20 ${ws.status === 'accepted' ? 'border-green-500/30' : ''}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{ws.title}</p>
                          <Badge variant="outline" className={`text-[10px] ${ws.status === 'accepted' ? 'text-green-400 border-green-500/20' : ws.status === 'rejected' ? 'text-destructive border-destructive/20' : ''}`}>
                            {ws.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{ws.description}</p>
                        {ws.images && ws.images.length > 0 && (
                          <div className="flex gap-1.5">
                            {ws.images.slice(0, 3).map((img, i) => (
                              <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
                                <img src={img} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {ws.link && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate(`/supervisor/screening/${screeningId}/work-sample/${ws.id}/preview`)}>
                              <Eye className="h-3 w-3" /> Preview Project
                            </Button>
                          )}
                          {ws.status === 'pending' && canAccessPhase(2) && screening.status !== 'FAILED' && (
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1 gradient-primary"
                              onClick={() => handleUpdateWorkSampleStatus(ws.id, 'accepted')}
                              disabled={updateWorkSample.isPending}
                            >
                              <CheckCircle className="h-3 w-3" /> Accept
                            </Button>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {ws.dateStarted && `Started: ${new Date(ws.dateStarted).toLocaleDateString()}`}
                          {ws.dateEnded && ` · Ended: ${new Date(ws.dateEnded).toLocaleDateString()}`}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Mentor has not submitted work samples yet.</p>
              )}

              {/* Approve/Reject when 3+ accepted */}
              {canAccessPhase(2) && screening.currentPhase <= 2 && screening.status !== 'FAILED' && screening.status !== 'COMPLETED' && acceptedSamplesCount >= 3 && (
                <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                  <Button variant="outline" className="text-destructive border-destructive/30" onClick={handleRejectWorkSamples} disabled={rejecting || approving}>
                    {rejecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject Samples
                  </Button>
                  <Button className="gradient-primary" onClick={handleApproveWorkSamples} disabled={approving || rejecting}>
                    {approving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve & Unlock Phase 3
                  </Button>
                </div>
              )}
              {canAccessPhase(2) && acceptedSamplesCount < 3 && workSamples && workSamples.length > 0 && (
                <p className="text-xs text-amber-400 text-center">Mentor needs {3 - acceptedSamplesCount} more accepted work sample(s) before QBot can be unlocked.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ====== PHASE 3 — QBOT ====== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className={`glass-card ${!canAccessPhase(3) ? 'opacity-50' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${phaseStatus[2].passed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    <Bot className={`h-4 w-4 ${phaseStatus[2].passed ? 'text-green-400' : 'text-primary'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Phase 3 — QBot AI Coding Interview</CardTitle>
                    <CardDescription>AI-powered coding interview. Max 2 retries (3 total attempts).</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={stateColors[getPhaseState(3)] || ''}>{getPhaseState(3)}</Badge>
                  {canAccessPhase(3) && !screening.qBotPassed && screening.status !== 'FAILED' && (
                    <Button size="sm" className="gap-1.5 gradient-primary" onClick={handleCreateQbot} disabled={createQbot.isPending}>
                      {createQbot.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      Create QBot Interview
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {screening.qbots && screening.qbots.length > 0 ? (
                screening.qbots.map((q, qi) => (
                  <div key={q.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">QBot Interview #{qi + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.status} · Started: {q.startedAt ? new Date(q.startedAt).toLocaleString() : 'Not started'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!q.startedAt && (
                          <Button size="sm" variant="outline" onClick={() => startQbot.mutateAsync(q.id).then(() => refetch())} disabled={startQbot.isPending}>
                            Start Interview
                          </Button>
                        )}
                        <Badge className={q.satisfactory ? 'bg-green-500/10 text-green-400 border-green-500/20' : q.status === 'completed' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground'}>
                          {q.satisfactory ? 'Satisfactory' : q.status === 'completed' ? 'Not Satisfactory' : 'Pending'}
                        </Badge>
                        {q.status === 'completed' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate(`/supervisor/screening/${screeningId}/qbot/${q.id}/response`)}>
                            <Eye className="h-3 w-3" /> View Response
                          </Button>
                        )}
                      </div>
                    </div>
                    {q.report && (
                      <div className="text-xs p-3 rounded bg-muted/20 border-l-2 border-primary/30">
                        <p className="font-medium text-muted-foreground mb-1">AI Evaluation</p>
                        <p className="line-clamp-2">{q.report}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No QBot interviews yet.</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Retries used: {screening.qBotRetries}/2</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ====== PHASE 4 — CODE INTERVIEW ====== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`glass-card ${!canAccessPhase(4) ? 'opacity-50' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${phaseStatus[3].passed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    <Code className={`h-4 w-4 ${phaseStatus[3].passed ? 'text-green-400' : 'text-primary'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Phase 4 — Live Code Interview</CardTitle>
                    <CardDescription>Schedule and conduct live code interview. Max 2 retries.</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={stateColors[getPhaseState(4)] || ''}>{getPhaseState(4)}</Badge>
                  {canAccessPhase(4) && !screening.codeInterviewPassed && screening.status !== 'COMPLETED' && screening.status !== 'FAILED' && !showCreateCI && (
                    <Button size="sm" variant="outline" onClick={() => setShowCreateCI(true)} className="gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Schedule Code Interview
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schedule form */}
              {showCreateCI && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
                  <p className="text-sm font-medium">Schedule Code Interview</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Title</Label>
                      <Input value={ciTitle} onChange={e => setCiTitle(e.target.value)} placeholder="Live Code Interview" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Pass Cutoff (%)</Label>
                      <Input type="number" value={ciPassCutoff} onChange={e => setCiPassCutoff(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (min)</Label>
                      <Input type="number" value={ciDuration} onChange={e => setCiDuration(e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Interview Date & Time</Label>
                      <Input type="datetime-local" value={ciStartDateTime} onChange={e => setCiStartDateTime(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Date & Time</Label>
                      <Input type="datetime-local" value={ciEndDateTime} onChange={e => setCiEndDateTime(e.target.value)} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea value={ciDescription} onChange={e => setCiDescription(e.target.value)} rows={2} className="text-sm" placeholder="Describe the code interview tasks..." />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setShowCreateCI(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleCreateCodeInterview} disabled={createCodeInterview.isPending || !ciTitle} className="gradient-primary">
                      {createCodeInterview.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Calendar className="h-3.5 w-3.5 mr-1" />}
                      Schedule
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Existing interviews */}
              {screening.codeInterviews && screening.codeInterviews.length > 0 ? (
                screening.codeInterviews.map((ci) => (
                  <div key={ci.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{ci.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ci.status} · {ci.durationMinutes}min · Cutoff: {ci.passCutoff}%
                        </p>
                        {ci.startDateTime && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            Scheduled: {new Date(ci.startDateTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {ci.score != null && <span className="text-sm font-semibold">{ci.score}%</span>}
                        <Badge className={ci.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : ci.status === 'COMPLETED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}>
                          {ci.passed ? 'Passed' : ci.status}
                        </Badge>
                        {ci.startDateTime && ci.status !== 'COMPLETED' && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate(`/supervisor/code-interview/${ci.id}`)}>
                            <Video className="h-3 w-3" /> Join Room
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate(`/supervisor/screening/${screeningId}/code-interview/${ci.id}/submission`)}>
                          <Eye className="h-3 w-3" /> View Submission
                        </Button>
                      </div>
                    </div>
                    {ci.tasks && ci.tasks.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground font-medium">Tasks ({ci.tasks.length})</p>
                        {ci.tasks.map(t => (
                          <div key={t.id} className="text-xs p-2 rounded bg-muted/20">
                            <p className="font-medium">Points: {t.points}</p>
                            <ul className="list-disc list-inside text-muted-foreground">
                              {t.requirements?.map((r, ri) => <li key={ri}>{r}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">No code interviews scheduled yet.</p>
              )}

              {/* Code Interview Retry Requests */}
              {screening.codeInterviewAttempts && screening.codeInterviewAttempts.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Code Interview Retry Requests</p>
                  {screening.codeInterviewAttempts.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.requestedStart).toLocaleDateString()} — {new Date(a.requestedEnd).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">{a.status}</Badge>
                        {a.reviewerFeedback && <p className="text-[10px] text-muted-foreground mt-0.5">{a.reviewerFeedback}</p>}
                      </div>
                      {a.status === 'PENDING' && screening.codeInterviewRetries < 2 && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => approveCode.mutate(a.id)} disabled={approveCode.isPending}>
                            {approveCode.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectCode.mutate(a.id)} disabled={rejectCode.isPending}>
                            Reject
                          </Button>
                        </div>
                      )}
                      {a.status === 'PENDING' && screening.codeInterviewRetries >= 2 && (
                        <span className="text-[10px] text-destructive">Max retries reached</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Code Interview retries used: {screening.codeInterviewRetries}/2</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ====== FINAL ACTION — APPROVE/REJECT ====== */}
        {allPhasesComplete && screening.status !== 'COMPLETED' && screening.status !== 'FAILED' && !mentor?.isCertified && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Review Report</Label>
                  <Textarea value={reviewReport} onChange={e => setReviewReport(e.target.value)} placeholder="Write your evaluation report..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Comments</Label>
                  <Textarea value={reviewComments} onChange={e => setReviewComments(e.target.value)} placeholder="Additional comments..." rows={2} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">All 4 phases complete — Final Decision</p>
                    <p className="text-xs text-muted-foreground">Approving will certify this mentor.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleReject} disabled={rejecting || approving}>
                      {rejecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                      Reject Mentor
                    </Button>
                    <Button className="gradient-primary" onClick={handleApprove} disabled={approving || rejecting}>
                      {approving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                      Approve Mentor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Completed/Failed Banner */}
        {(screening.status === 'COMPLETED' || screening.status === 'FAILED') && (
          <Card className={`glass-card ${screening.status === 'COMPLETED' ? 'border-green-500/20' : 'border-destructive/20'}`}>
            <CardContent className="p-4 text-center">
              <p className={`text-sm font-medium ${screening.status === 'COMPLETED' ? 'text-green-400' : 'text-destructive'}`}>
                {screening.status === 'COMPLETED' ? '✅ Mentor has been approved and certified.' : '❌ Screening has been closed — mentor rejected.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Previous Reviews */}
        {screening.supervisorReviews && screening.supervisorReviews.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Previous Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {screening.supervisorReviews.map(sr => (
                <div key={sr.id} className="p-3 rounded-lg bg-muted/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Review #{sr.id.slice(0, 8)}</p>
                    <Badge className={
                      sr.decision === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      sr.decision === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-primary/10 text-primary border-primary/20'
                    }>{sr.decision}</Badge>
                  </div>
                  {sr.comments && <p className="text-xs text-muted-foreground">{sr.comments}</p>}
                  {sr.evaluation_summary && (
                    <div className="text-xs p-2 rounded bg-muted/20">
                      <p><span className="font-medium">Result:</span> {sr.evaluation_summary.passed ? 'Passed' : 'Failed'}</p>
                      <p><span className="font-medium">Report:</span> {sr.evaluation_summary.report}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ===================== MAIN EXPORT =====================

export default function ScreeningReviewPage() {
  const { id } = useParams();

  // If no ID — show list view. If ID — show detail view.
  if (!id) {
    return <ScreeningListView />;
  }

  return <ScreeningDetailView screeningId={id} />;
}
