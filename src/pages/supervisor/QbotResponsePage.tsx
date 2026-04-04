import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { qbotService } from '@/lib/api/services';
import { useUpdateQbotStatus, useDeleteQbotQuestionnaire, useEvaluateQbot } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, Bot, Loader2, ClipboardCheck, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QbotResponsePage() {
  const { screeningId, qbotId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: qbot, isLoading, refetch } = useQuery({
    queryKey: ['qbot', qbotId],
    queryFn: () => qbotService.findOne(qbotId!),
    enabled: !!qbotId,
  });

  const updateQbotStatus = useUpdateQbotStatus();
  const deleteQuestion = useDeleteQbotQuestionnaire();
  const evaluateQbot = useEvaluateQbot();

  const handleMarkReady = async () => {
    if (!qbotId) return;
    await updateQbotStatus.mutateAsync({ qbotId, status: 'ready' });
    refetch();
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion.mutateAsync(questionId);
    refetch();
  };

  const handleEvaluate = async () => {
    if (!qbotId) return;
    await evaluateQbot.mutateAsync(qbotId);
    refetch();
  };

  if (isLoading || !qbot) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const questionCount = qbot.questionnaires?.length || 0;
  const isPending = qbot.status === 'pending';
  const isCompleted = qbot.status === 'completed';
  const canMarkReady = isPending && questionCount >= 1;
  const needsEvaluation = isCompleted && !qbot.satisfactory && !qbot.report;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/supervisor/screening/${screeningId}`)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Screening Review
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>QBot AI Interview Details</CardTitle>
                  <CardDescription>
                    Status: <span className="capitalize">{qbot.status}</span> · Started: {qbot.startedAt ? new Date(qbot.startedAt).toLocaleString() : 'Not started'}
                  </CardDescription>
                </div>
              </div>
              <Badge className={qbot.satisfactory ? 'bg-green-500/10 text-green-400 border-green-500/20' : isCompleted ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground'}>
                {qbot.satisfactory ? 'SATISFACTORY' : isCompleted ? 'NOT SATISFACTORY' : qbot.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {canMarkReady && (
                <Button className="gap-1.5 gradient-primary" onClick={handleMarkReady} disabled={updateQbotStatus.isPending}>
                  {updateQbotStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Mark as Ready
                </Button>
              )}
              {needsEvaluation && (
                <Button className="gap-1.5 gradient-primary" onClick={handleEvaluate} disabled={evaluateQbot.isPending}>
                  {evaluateQbot.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                  Evaluate Interview
                </Button>
              )}
            </div>

            {/* AI Evaluation Report */}
            {qbot.report && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">AI Evaluation Report</p>
                <p className="text-sm">{qbot.report}</p>
              </div>
            )}

            {/* Score summary */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-lg font-bold">{questionCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Result</p>
                <p className={`text-lg font-bold ${qbot.satisfactory ? 'text-green-400' : isCompleted ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {qbot.satisfactory ? 'Pass' : isCompleted ? 'Fail' : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-lg font-bold capitalize">{qbot.status}</p>
              </div>
            </div>

            {/* Questions and Answers */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Questions & Mentor Responses</h3>
              {qbot.questionnaires && qbot.questionnaires.length > 0 ? (
                qbot.questionnaires.map((qn, i) => (
                  <Card key={qn.id} className="bg-muted/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">Q{i + 1}</span>
                          <p className="text-sm font-medium">{qn.question}</p>
                        </div>
                        {isPending && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive shrink-0" onClick={() => handleDeleteQuestion(qn.id)} disabled={deleteQuestion.isPending}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {qn.answers ? (
                        <div className="ml-8 space-y-2">
                          <div className="p-3 rounded-lg border border-border/50 bg-muted/10">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mentor's Answer</p>
                            <p className="text-xs whitespace-pre-wrap">{qn.answers.answer_text}</p>
                          </div>
                          {qn.answers.summary && (
                            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">AI Summary</p>
                              <p className="text-xs italic">{qn.answers.summary}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="ml-8 text-xs text-muted-foreground italic">No response submitted</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No questions available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
