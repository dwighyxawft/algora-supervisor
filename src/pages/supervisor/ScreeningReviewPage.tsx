import { useParams, useNavigate } from 'react-router-dom';
import { useScreening } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle, XCircle, Code, FileText, Bot, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { reviewService } from '@/lib/api/services';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ScreeningReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: screening, isLoading } = useScreening(id!);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

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
        report: 'Mentor approved after comprehensive review.',
        comments: 'All screening phases completed successfully.',
      });
      toast({ title: 'Mentor approved', description: 'The mentor has been approved successfully.' });
      navigate('/supervisor/screening');
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
        report: 'Mentor did not meet screening requirements.',
        comments: 'Screening review: mentor rejected.',
      });
      toast({ title: 'Mentor rejected' });
      navigate('/supervisor/screening');
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

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{screening.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Mentor: {screening.mentor ? `${screening.mentor.firstName} ${screening.mentor.lastName}` : screening.mentor_id}
                </p>
                {screening.description && <p className="text-sm text-muted-foreground mt-1">{screening.description}</p>}
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">Phase {screening.currentPhase}/4</Badge>
            </div>

            <div className="flex gap-6 mt-6">
              {[
                { label: 'Assessment', passed: screening.assessmentPassed, score: screening.finalAssessmentScore },
                { label: 'Code Interview', passed: screening.codeInterviewPassed, score: screening.finalCodeInterviewScore },
                { label: 'QBot Interview', passed: screening.qBotPassed, score: null },
                { label: 'Final Review', passed: screening.reviewCompleted, score: null },
              ].map((phase, i) => (
                <div key={i} className="flex items-center gap-2">
                  {phase.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                  <div>
                    <p className="text-xs font-medium">{phase.label}</p>
                    {phase.score != null && <p className="text-xs text-muted-foreground">{phase.score}%</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="assessment">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="assessment" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Assessment</TabsTrigger>
          <TabsTrigger value="code" className="gap-1.5"><Code className="h-3.5 w-3.5" /> Code Review</TabsTrigger>
          <TabsTrigger value="qbot" className="gap-1.5"><Bot className="h-3.5 w-3.5" /> QBot</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Assessment Results</CardTitle>
            </CardHeader>
            <CardContent>
              {screening.assessments && screening.assessments.length > 0 ? (
                <div className="space-y-3">
                  {screening.assessments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.type} · {a.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={a.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                          {a.passed ? 'Passed' : 'Failed'}
                        </Badge>
                        {a.score != null && <span className="text-xs text-muted-foreground">{a.score} pts</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No assessment results available yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <Card className="glass-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Code className="h-10 w-10 mx-auto mb-3 opacity-50" />
              {screening.codeInterviews && screening.codeInterviews.length > 0 ? (
                <div className="space-y-3 text-left">
                  {screening.codeInterviews.map(ci => (
                    <div key={ci.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{ci.title}</p>
                        <p className="text-xs text-muted-foreground">{ci.status} · {ci.durationMinutes}min</p>
                      </div>
                      <Badge className={ci.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
                        {ci.passed ? 'Passed' : ci.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-sm">No code interviews submitted yet.</p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qbot" className="mt-4">
          <Card className="glass-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
              {screening.qbots && screening.qbots.length > 0 ? (
                <div className="space-y-3 text-left">
                  {screening.qbots.map(q => (
                    <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">QBot Interview</p>
                        <p className="text-xs text-muted-foreground">{q.status} · {q.satisfactory ? 'Satisfactory' : 'Not Satisfactory'}</p>
                      </div>
                      <Badge className={q.satisfactory ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
                        {q.satisfactory ? 'Passed' : q.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm">QBot interview has not been completed yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end">
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
      </div>
    </div>
  );
}
