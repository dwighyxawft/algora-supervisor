import { useParams, useNavigate } from 'react-router-dom';
import {
  useScreening, useApproveAssessmentRetry, useApproveCodeAttempt, useRejectCodeAttempt,
  useApproveQbotRetry, useRejectQbotRetry, useMentorWorkSamples, useCreateQbot,
  useStartQbotInterview, useGenerateQbotQuestions, useCreateCodeInterview, useUpdateScreening,
} from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, CheckCircle, XCircle, Code, FileText, Bot, Shield, Loader2,
  RefreshCw, Clock, Plus, ExternalLink, Image as ImageIcon, Calendar, Video
} from 'lucide-react';
import { motion } from 'framer-motion';
import { reviewService } from '@/lib/api/services';
import { useState, lazy, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AssessmentStatus } from '@/lib/api/models';
import type { CreateCodeInterviewDto } from '@/lib/api/dto';

const CodeWorkspace = lazy(() => import('@/components/CodeWorkspace').then(m => ({ default: m.CodeWorkspace })));

const PHASES = [
  { key: 'assessment', label: 'Assessment', icon: FileText, phase: 1 },
  { key: 'workSample', label: 'Work Samples', icon: ImageIcon, phase: 2 },
  { key: 'qbot', label: 'QBot Interview', icon: Bot, phase: 3 },
  { key: 'codeInterview', label: 'Code Interview', icon: Code, phase: 4 },
];

export default function ScreeningReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: screening, isLoading, refetch } = useScreening(id!);

  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewReport, setReviewReport] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);

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

  const mentorId = screening?.mentor_id || '';
  const { data: workSamples } = useMentorWorkSamples(mentorId);

  // ====== PHASE HANDLERS ======

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

  const handleCreateQbot = async () => {
    if (!screening) return;
    try {
      const qbot = await createQbot.mutateAsync(screening.id);
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
      setCiTitle('');
      setCiDescription('');
      setCiStartDateTime('');
      setCiEndDateTime('');
      refetch();
    } catch {}
  };

  const handleApprove = async () => {
    if (!screening || !user) return;
    setApproving(true);
    try {
      const review = await reviewService.start({
        screening_id: screening.id,
        supervisor_id: user.id,
        mentor_id: screening.mentor_id,
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
        screening_id: screening.id,
        supervisor_id: user.id,
        mentor_id: screening.mentor_id,
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

  // Phase status mapping
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

  const allPhasesComplete = screening.assessmentPassed && screening.currentPhase >= 3 && screening.qBotPassed && screening.codeInterviewPassed;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/supervisor/screening')} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Screenings
      </Button>

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

                {/* Mentor details row */}
                <div className="flex flex-wrap gap-4 pt-1">
                  {mentor?.country && (
                    <span className="text-xs text-muted-foreground">📍 {mentor.country}{mentor.stateOrProvince ? `, ${mentor.stateOrProvince}` : ''}</span>
                  )}
                  {mentor?.majors && mentor.majors.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      🎓 {mentor.majors.map(m => m.name).join(', ')}
                    </span>
                  )}
                  {mentor?.portfolioUrl && (
                    <a href={mentor.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Portfolio
                    </a>
                  )}
                  {mentor?.githubUrl && (
                    <a href={mentor.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> GitHub
                    </a>
                  )}
                  {mentor?.linkedinUrl && (
                    <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> LinkedIn
                    </a>
                  )}
                </div>

                {/* Certifications */}
                {mentor?.majors && mentor.majors.some(m => m.certifications && m.certifications.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mentor.majors.flatMap(m => m.certifications || []).map((cert, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {cert.type} — {cert.institution}
                      </Badge>
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

      {/* ====== PHASE TIMELINE ====== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Phase Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-border" />
              {PHASES.map((phase, i) => {
                const status = phaseStatus[i];
                const isActive = screening.currentPhase === phase.phase;
                const isDone = status.passed;
                const locked = !canAccessPhase(phase.phase);
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
                    {status.score != null && <span className="text-xs text-muted-foreground">{status.score}%</span>}
                    {status.retries > 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <RefreshCw className="h-2.5 w-2.5" /> {status.retries}/{status.maxRetries}
                      </span>
                    )}
                    {locked && <span className="text-[10px] text-muted-foreground">🔒</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ====== PHASE TABS ====== */}
      <Tabs defaultValue="assessment">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="assessment" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Phase 1</TabsTrigger>
          <TabsTrigger value="workSamples" className="gap-1.5" disabled={!canAccessPhase(2)}><ImageIcon className="h-3.5 w-3.5" /> Phase 2</TabsTrigger>
          <TabsTrigger value="qbot" className="gap-1.5" disabled={!canAccessPhase(3)}><Bot className="h-3.5 w-3.5" /> Phase 3</TabsTrigger>
          <TabsTrigger value="codeInterview" className="gap-1.5" disabled={!canAccessPhase(4)}><Code className="h-3.5 w-3.5" /> Phase 4</TabsTrigger>
        </TabsList>

        {/* ====== PHASE 1 — ASSESSMENT ====== */}
        <TabsContent value="assessment" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Phase 1 — Assessment</CardTitle>
                  <CardDescription>Theory or objective assessment. Max 2 retries (3 total attempts).</CardDescription>
                </div>
                {!screening.assessmentPassed && screening.status !== 'FAILED' && (
                  <Button size="sm" className="gap-1.5 gradient-primary" onClick={() => navigate(`/supervisor/screening/${id}/assessment/create`)}>
                    <Plus className="h-3.5 w-3.5" /> Create Assessment
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Assessment list */}
              {screening.assessments && screening.assessments.length > 0 ? (
                screening.assessments.map(a => (
                  <div key={a.id} className="p-4 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.type} · {a.status} · {a.durationMinutes}min</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {a.score != null && <span className="text-sm font-semibold">{a.score} pts</span>}
                        <Badge className={a.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : a.status === 'COMPLETED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}>
                          {a.passed ? 'Passed' : a.status}
                        </Badge>
                      </div>
                    </div>
                    {/* Show question breakdown if completed */}
                    {a.status === 'COMPLETED' && a.objective && a.objective.questions && (
                      <div className="text-xs space-y-1 pt-2 border-t border-border/30">
                        <p className="font-medium text-muted-foreground">Question Breakdown ({a.objective.questions.length} questions)</p>
                        {a.objective.questions.map((q, qi) => (
                          <div key={q.id} className="flex items-center gap-2 py-0.5">
                            <span className="text-muted-foreground">Q{qi + 1}:</span>
                            <span className="truncate flex-1">{q.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {a.status === 'COMPLETED' && a.theory && a.theory.questions && (
                      <div className="text-xs space-y-1 pt-2 border-t border-border/30">
                        <p className="font-medium text-muted-foreground">Question Breakdown ({a.theory.questions.length} questions)</p>
                        {a.theory.questions.map((q, qi) => (
                          <div key={q.id} className="flex items-center gap-2 py-0.5">
                            <span className="text-muted-foreground">Q{qi + 1}:</span>
                            <span className="truncate flex-1">{q.text}</span>
                            {q.answer && (
                              <Badge variant="outline" className={`text-[9px] ${q.answer.isCorrect ? 'text-green-400 border-green-500/20' : 'text-destructive border-destructive/20'}`}>
                                {q.answer.isCorrect ? 'Correct' : 'Incorrect'}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No assessments created yet. Create one to start Phase 1.</p>
              )}

              {/* Assessment Retry Requests */}
              {screening.retries && screening.retries.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Assessment Retry Requests</p>
                  {screening.retries.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Requested: {new Date(r.requestedStart).toLocaleDateString()} — {new Date(r.requestedEnd).toLocaleDateString()}
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

              {/* Attempts tracker */}
              <div className="flex items-center gap-2 pt-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Attempts used: {screening.assessmentRetries}/2 retries</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== PHASE 2 — WORK SAMPLES ====== */}
        <TabsContent value="workSamples" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Phase 2 — Work Sample Review</CardTitle>
              <CardDescription>Review mentor's portfolio, GitHub repos, and project samples. Single submission — no retries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workSamples && workSamples.length > 0 ? (
                <div className="space-y-3">
                  {workSamples.map(ws => (
                    <div key={ws.id} className="p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{ws.title}</p>
                            <Badge variant="outline" className={`text-[10px] ${ws.status === 'accepted' ? 'text-green-400 border-green-500/20' : ws.status === 'rejected' ? 'text-destructive border-destructive/20' : ''}`}>
                              {ws.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{ws.description}</p>
                        </div>
                        {ws.link && (
                          <Button variant="outline" size="sm" asChild className="gap-1.5">
                            <a href={ws.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /> View</a>
                          </Button>
                        )}
                      </div>
                      {ws.images && ws.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {ws.images.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors">
                              <img src={img} alt={`Sample ${i + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {ws.dateStarted && <span>Started: {new Date(ws.dateStarted).toLocaleDateString()}</span>}
                        {ws.dateEnded && <span>· Ended: {new Date(ws.dateEnded).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Mentor has not submitted work samples yet.</p>
              )}

              {/* Approve/Reject actions */}
              {screening.assessmentPassed && screening.currentPhase <= 2 && screening.status !== 'FAILED' && screening.status !== 'COMPLETED' && (
                <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                  <Button variant="outline" className="text-destructive border-destructive/30" onClick={handleRejectWorkSamples} disabled={rejecting || approving}>
                    {rejecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject Samples
                  </Button>
                  <Button className="gradient-primary" onClick={handleApproveWorkSamples} disabled={approving || rejecting || !workSamples?.length}>
                    {approving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve & Unlock Phase 3
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== PHASE 3 — QBOT ====== */}
        <TabsContent value="qbot" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Phase 3 — QBot AI Coding Interview</CardTitle>
                  <CardDescription>AI-powered coding interview. Max 2 retries (3 total attempts).</CardDescription>
                </div>
                {canAccessPhase(3) && !screening.qBotPassed && screening.status !== 'FAILED' && (
                  <Button size="sm" className="gap-1.5 gradient-primary" onClick={handleCreateQbot} disabled={createQbot.isPending}>
                    {createQbot.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Create QBot Interview
                  </Button>
                )}
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
                      </div>
                    </div>
                    {q.report && (
                      <div className="text-xs p-3 rounded bg-muted/20 border-l-2 border-primary/30">
                        <p className="font-medium text-muted-foreground mb-1">AI Evaluation</p>
                        <p>{q.report}</p>
                      </div>
                    )}
                    {q.questionnaires && q.questionnaires.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground font-medium">{q.questionnaires.length} Questions</p>
                        {q.questionnaires.map((qn, qni) => (
                          <div key={qn.id} className="text-xs p-2 rounded bg-muted/20">
                            <p className="font-medium">Q{qni + 1}: {qn.question}</p>
                            {qn.answers && (
                              <div className="mt-1 pl-3 border-l border-border/50">
                                <p className="text-muted-foreground">A: {qn.answers.answer_text}</p>
                                {qn.answers.summary && <p className="text-muted-foreground italic mt-0.5">Summary: {qn.answers.summary}</p>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No QBot interviews yet. Create one to start Phase 3.</p>
              )}

              {/* QBot retry management */}
              <div className="flex items-center gap-2 pt-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Retries used: {screening.qBotRetries}/2</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== PHASE 4 — CODE INTERVIEW ====== */}
        <TabsContent value="codeInterview" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Phase 4 — Live Code Interview</CardTitle>
                  <CardDescription>Schedule and conduct live code interview with mentor. Room ID: {screening.id.slice(0, 8)}. Max 2 retries.</CardDescription>
                </div>
                <div className="flex gap-2">
                  {canAccessPhase(4) && !screening.codeInterviewPassed && screening.status !== 'COMPLETED' && screening.status !== 'FAILED' && (
                    <>
                      {!showCreateCI && (
                        <Button size="sm" variant="outline" onClick={() => setShowCreateCI(true)} className="gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> Schedule Code Interview
                        </Button>
                      )}
                      <Button size="sm" variant={showCodeEditor ? 'default' : 'outline'} onClick={() => setShowCodeEditor(!showCodeEditor)} className="gap-1.5">
                        <Code className="h-3.5 w-3.5" /> {showCodeEditor ? 'Hide Editor' : 'Open Code Editor'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schedule Code Interview Form */}
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

              {/* Existing Code Interviews */}
              {screening.codeInterviews && screening.codeInterviews.length > 0 ? (
                screening.codeInterviews.map((ci, cii) => (
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
                    {ci.codingWorkspace && (
                      <div className="text-xs p-2 rounded bg-muted/20 border-l-2 border-primary/30">
                        <p className="font-medium text-muted-foreground">Coding Workspace</p>
                        <p>Title: {ci.codingWorkspace.title}</p>
                        {ci.codingWorkspace.s3Url && (
                          <a href={ci.codingWorkspace.s3Url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 mt-1">
                            <ExternalLink className="h-3 w-3" /> View Submitted Code
                          </a>
                        )}
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
                          Requested: {new Date(a.requestedStart).toLocaleDateString()} — {new Date(a.requestedEnd).toLocaleDateString()}
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

              {/* Supervisor Review History */}
              {screening.supervisorReviews && screening.supervisorReviews.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium">Previous Reviews</p>
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
                </div>
              )}

              {/* Attempts tracker */}
              <div className="flex items-center gap-2 pt-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Code Interview retries used: {screening.codeInterviewRetries}/2</span>
              </div>

              {/* Final review form */}
              {allPhasesComplete && screening.status !== 'COMPLETED' && screening.status !== 'FAILED' && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm">Review Report</Label>
                    <Textarea value={reviewReport} onChange={e => setReviewReport(e.target.value)} placeholder="Write your evaluation report..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Comments</Label>
                    <Textarea value={reviewComments} onChange={e => setReviewComments(e.target.value)} placeholder="Additional comments..." rows={2} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Editor — loaded on demand */}
          {showCodeEditor && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Code className="h-4 w-4" /> Live Code Editor</CardTitle>
                  <CardDescription>Review mentor's code in real-time during the interview. Room ID: {screening.id.slice(0, 8)}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px] border-t border-border">
                    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                      <CodeWorkspace submitUrl="" editable={true} />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* ====== FINAL ACTION — APPROVE/REJECT MENTOR ====== */}
      {allPhasesComplete && screening.status !== 'COMPLETED' && screening.status !== 'FAILED' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">All 4 phases complete — Final Decision</p>
                  <p className="text-xs text-muted-foreground">Approving will certify this mentor to create programs and teach.</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={handleReject}
                    disabled={rejecting || approving}
                  >
                    {rejecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject Mentor
                  </Button>
                  <Button
                    className="gradient-primary"
                    onClick={handleApprove}
                    disabled={approving || rejecting}
                  >
                    {approving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                    Approve & Certify
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
    </div>
  );
}

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
};
