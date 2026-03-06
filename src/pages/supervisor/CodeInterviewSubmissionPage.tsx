import { useParams, useNavigate } from 'react-router-dom';
import { useCodeInterview } from '@/hooks/use-api';
import { codeInterviewService } from '@/lib/api/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Code, Loader2, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { lazy, Suspense, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const CodeWorkspace = lazy(() => import('@/components/CodeWorkspace').then(m => ({ default: m.CodeWorkspace })));

export default function CodeInterviewSubmissionPage() {
  const { screeningId, interviewId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: interview, isLoading, refetch } = useCodeInterview(interviewId!);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitGrade = async () => {
    if (!interview || !score) return;
    setSubmitting(true);
    try {
      await codeInterviewService.update(interview.id, {
        score: parseInt(score),
        passed: parseInt(score) >= interview.passCutoff,
        status: 'COMPLETED' as any,
      });
      toast({ title: 'Grade submitted', description: `Score: ${score}% — ${parseInt(score) >= interview.passCutoff ? 'Passed' : 'Failed'}` });
      qc.invalidateQueries({ queryKey: ['screenings'] });
      qc.invalidateQueries({ queryKey: ['codeInterviews'] });
      refetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !interview) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[80vh] rounded-xl" />
      </div>
    );
  }

  const zipUrl = interview.codingWorkspace?.s3Url;
  const isGraded = interview.status === 'COMPLETED' && interview.score != null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/supervisor/screening/${screeningId}`)} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Screening Review
        </Button>
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold">{interview.title}</h2>
            <p className="text-xs text-muted-foreground">
              Duration: {interview.durationMinutes}min · Pass Cutoff: {interview.passCutoff}%
            </p>
          </div>
          <Badge className={interview.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : interview.status === 'COMPLETED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}>
            {interview.passed ? 'PASSED' : interview.status}
          </Badge>
        </div>
      </div>

      {/* Tasks Display */}
      {interview.tasks && interview.tasks.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Interview Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {interview.tasks.map((t, i) => (
              <div key={t.id} className="p-3 rounded-lg bg-muted/20 text-xs">
                <p className="font-medium mb-1">Task {i + 1} — {t.points} points</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {t.requirements?.map((r, ri) => <li key={ri}>{r}</li>)}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Code Editor — Read Only */}
      {zipUrl ? (
        <div className="h-[60vh] border rounded-xl overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <CodeWorkspace zipUrl={zipUrl} submitUrl="" editable={false} />
          </Suspense>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-border text-muted-foreground">
          <p className="text-sm">Mentor has not submitted code yet.</p>
        </div>
      )}

      {/* Grading Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Code className="h-4 w-4" /> Code Interview Grading
            </CardTitle>
            <CardDescription>
              {isGraded ? 'This interview has been graded.' : 'Review the code and assign a grade.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGraded ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Final Score</p>
                    <p className="text-3xl font-bold">{interview.score}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Result</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {interview.passed
                        ? <><CheckCircle className="h-6 w-6 text-green-400" /><span className="text-lg font-bold text-green-400">Passed</span></>
                        : <><span className="text-lg font-bold text-destructive">Failed</span></>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Score (%)</Label>
                    <Input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} placeholder="0-100" className="h-9" />
                  </div>
                  <div className="flex items-end">
                    <p className="text-xs text-muted-foreground">
                      Pass cutoff: <span className="font-bold">{interview.passCutoff}%</span>
                      {score && <> · Result: <span className={parseInt(score) >= interview.passCutoff ? 'text-green-400 font-bold' : 'text-destructive font-bold'}>
                        {parseInt(score) >= interview.passCutoff ? 'PASS' : 'FAIL'}
                      </span></>}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Feedback</Label>
                  <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} placeholder="Write your review notes..." />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSubmitGrade} disabled={submitting || !score} className="gradient-primary gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Grade
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
