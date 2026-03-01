import { useParams, useNavigate } from 'react-router-dom';
import { useScreening, useApproveAssessmentRetry, useApproveCodeAttempt, useRejectCodeAttempt, useApproveQbotRetry, useRejectQbotRetry } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, CheckCircle, XCircle, Code, FileText, Bot, Video, Loader2, RefreshCw, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { reviewService } from '@/lib/api/services';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const PHASES = [
  { key: 'assessment', label: 'Assessment', icon: FileText, phase: 1 },
  { key: 'codeInterview', label: 'Code Interview', icon: Code, phase: 2 },
  { key: 'qbot', label: 'QBot Interview', icon: Bot, phase: 3 },
  { key: 'review', label: 'Final Review', icon: Video, phase: 4 },
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

  const approveRetry = useApproveAssessmentRetry();
  const approveCode = useApproveCodeAttempt();
  const rejectCode = useRejectCodeAttempt();
  const approveQbot = useApproveQbotRetry();
  const rejectQbot = useRejectQbotRetry();

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
        report: reviewReport || 'Mentor approved after comprehensive review.',
        comments: reviewComments || 'All screening phases completed successfully.',
      });
      toast({ title: 'Mentor approved', description: 'The mentor has been approved successfully.' });
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

  const phaseStatus = [
    { passed: screening.assessmentPassed, score: screening.finalAssessmentScore, retries: screening.assessmentRetries },
    { passed: screening.codeInterviewPassed, score: screening.finalCodeInterviewScore, retries: screening.codeInterviewRetries },
    { passed: screening.qBotPassed, score: null, retries: screening.qBotRetries },
    { passed: screening.reviewCompleted, score: null, retries: screening.reviewRetries },
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Header Card with Mentor Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {screening.mentor && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={screening.mentor.image} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {screening.mentor.firstName?.[0]}{screening.mentor.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{screening.title}</h1>
                  <Badge className={
                    screening.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    screening.status === 'FAILED' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    'bg-primary/10 text-primary border-primary/20'
                  }>{screening.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Mentor: {screening.mentor ? `${screening.mentor.firstName} ${screening.mentor.lastName}` : screening.mentor_id}
                </p>
                {screening.description && <p className="text-sm text-muted-foreground mt-1">{screening.description}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current Phase</p>
                <p className="text-3xl font-bold gradient-text">{screening.currentPhase}/4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Phase Timeline */}
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
                return (
                  <div key={phase.key} className="relative flex flex-col items-center gap-2 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isDone ? 'bg-green-500/20 border-2 border-green-500' :
                      isActive ? 'bg-primary/20 border-2 border-primary animate-pulse' :
                      'bg-muted border-2 border-border'
                    }`}>
                      {isDone ? <CheckCircle className="h-5 w-5 text-green-400" /> :
                       isActive ? <phase.icon className="h-5 w-5 text-primary" /> :
                       <phase.icon className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <span className={`text-xs font-medium ${isDone ? 'text-green-400' : isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {phase.label}
                    </span>
                    {status.score != null && (
                      <span className="text-xs text-muted-foreground">{status.score}%</span>
                    )}
                    {status.retries > 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <RefreshCw className="h-2.5 w-2.5" /> {status.retries} retries
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Phase Details Tabs */}
      <Tabs defaultValue="assessment">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="assessment" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Assessment</TabsTrigger>
          <TabsTrigger value="code" className="gap-1.5"><Code className="h-3.5 w-3.5" /> Code Review</TabsTrigger>
          <TabsTrigger value="qbot" className="gap-1.5"><Bot className="h-3.5 w-3.5" /> QBot</TabsTrigger>
          <TabsTrigger value="final" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Final Review</TabsTrigger>
        </TabsList>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Assessment Results</CardTitle>
              <CardDescription>Phase 1 — Written assessment performance and retry history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {screening.assessments && screening.assessments.length > 0 ? (
                screening.assessments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.type} · {a.status} · {a.durationMinutes}min</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.score != null && <span className="text-sm font-semibold">{a.score} pts</span>}
                      <Badge className={a.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                        {a.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No assessment results yet.</p>
              )}
              {screening.retries && screening.retries.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Retry Requests</p>
                  {screening.retries.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.requestedStart).toLocaleDateString()} — {new Date(r.requestedEnd).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">{r.status}</Badge>
                      </div>
                      {r.status === 'PENDING' && (
                        <Button size="sm" variant="outline" onClick={() => approveRetry.mutate(r.id)} disabled={approveRetry.isPending}>
                          {approveRetry.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Interview Tab */}
        <TabsContent value="code" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Code Interview Results</CardTitle>
              <CardDescription>Phase 2 — Work sample review and coding interview performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {screening.codeInterviews && screening.codeInterviews.length > 0 ? (
                screening.codeInterviews.map(ci => (
                  <div key={ci.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{ci.title}</p>
                      <p className="text-xs text-muted-foreground">{ci.status} · {ci.durationMinutes}min · Cutoff: {ci.passCutoff}%</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {ci.score != null && <span className="text-sm font-semibold">{ci.score}%</span>}
                      <Badge className={ci.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
                        {ci.passed ? 'Passed' : ci.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No code interviews yet.</p>
              )}
              {screening.codeInterviewAttempts && screening.codeInterviewAttempts.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Attempt Requests</p>
                  {screening.codeInterviewAttempts.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.requestedStart).toLocaleDateString()} — {new Date(a.requestedEnd).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1">{a.status}</Badge>
                      </div>
                      {a.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => approveCode.mutate(a.id)} disabled={approveCode.isPending}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectCode.mutate(a.id)} disabled={rejectCode.isPending}>Reject</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* QBot Tab */}
        <TabsContent value="qbot" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">QBot AI Interview</CardTitle>
              <CardDescription>Phase 3 — AI-powered coding interview results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {screening.qbots && screening.qbots.length > 0 ? (
                screening.qbots.map(q => (
                  <div key={q.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">QBot Interview</p>
                        <p className="text-xs text-muted-foreground">{q.status} · Started: {q.startedAt ? new Date(q.startedAt).toLocaleDateString() : 'Not started'}</p>
                      </div>
                      <Badge className={q.satisfactory ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                        {q.satisfactory ? 'Satisfactory' : 'Not Satisfactory'}
                      </Badge>
                    </div>
                    {q.report && <p className="text-xs text-muted-foreground bg-muted/20 rounded p-2">{q.report}</p>}
                    {q.questionnaires && q.questionnaires.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground">{q.questionnaires.length} questions asked</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">QBot interview not completed yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Final Review Tab */}
        <TabsContent value="final" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Final Supervisor Review</CardTitle>
              <CardDescription>Phase 4 — Final approval or rejection by supervisor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {screening.supervisorReviews && screening.supervisorReviews.length > 0 ? (
                screening.supervisorReviews.map(sr => (
                  <div key={sr.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
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
                    <p className="text-[10px] text-muted-foreground">
                      {sr.review_started_at && `Started: ${new Date(sr.review_started_at).toLocaleString()}`}
                      {sr.review_completed_at && ` · Completed: ${new Date(sr.review_completed_at).toLocaleString()}`}
                    </p>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center py-2">No final reviews submitted yet.</p>
                  {screening.status !== 'COMPLETED' && screening.status !== 'FAILED' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm">Review Report</Label>
                        <Textarea value={reviewReport} onChange={e => setReviewReport(e.target.value)} placeholder="Write your evaluation report..." rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Comments</Label>
                        <Textarea value={reviewComments} onChange={e => setReviewComments(e.target.value)} placeholder="Additional comments..." rows={2} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {screening.status !== 'COMPLETED' && screening.status !== 'FAILED' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardContent className="p-4 flex gap-3 justify-end">
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleReject}
                disabled={rejecting || approving}
              >
                {rejecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                Reject Mentor
              </Button>
              <Button className="gradient-primary" onClick={handleApprove} disabled={approving || rejecting}>
                {approving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve Mentor
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
