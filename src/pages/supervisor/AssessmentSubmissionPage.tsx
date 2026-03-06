import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AssessmentSubmissionPage() {
  const { screeningId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { data: assessment, isLoading } = useAssessment(assessmentId!);

  if (isLoading || !assessment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const isObjective = assessment.type === 'OBJECTIVE';
  const questions = isObjective
    ? assessment.objective?.questions || []
    : assessment.theory?.questions || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/supervisor/screening/${screeningId}`)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Screening Review
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{assessment.title}</CardTitle>
                <CardDescription>{assessment.type} Assessment · {assessment.durationMinutes}min</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {assessment.score != null && (
                  <span className="text-2xl font-bold">{assessment.score} pts</span>
                )}
                <Badge className={assessment.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
                  {assessment.passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grading summary */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total Questions</p>
                <p className="text-lg font-bold">{questions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-bold">{assessment.score ?? '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={`text-lg font-bold ${assessment.passed ? 'text-green-400' : 'text-destructive'}`}>
                  {assessment.passed ? 'Pass' : 'Fail'}
                </p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Question Breakdown</h3>
              {isObjective ? (
                (assessment.objective?.questions || []).map((q, i) => {
                  // Check if there's an answer by looking at answer data
                  const options = [q.option_1, q.option_2, q.option_3, q.option_4];
                  return (
                    <Card key={q.id} className="bg-muted/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium">Q{i + 1}: {q.text}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {options.map((opt, oi) => {
                            const isCorrect = q.correctOption === opt.tag;
                            return (
                              <div
                                key={oi}
                                className={`p-2.5 rounded-lg text-xs border ${
                                  isCorrect
                                    ? 'border-green-500/30 bg-green-500/5 text-green-400'
                                    : 'border-border/50 bg-muted/10 text-muted-foreground'
                                }`}
                              >
                                <span className="font-medium mr-1">{String.fromCharCode(65 + oi)}.</span>
                                {opt.text}
                                {isCorrect && <CheckCircle className="h-3 w-3 inline ml-1" />}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                (assessment.theory?.questions || []).map((q, i) => (
                  <Card key={q.id} className="bg-muted/20">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">Q{i + 1}: {q.text}</p>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Correct Answer</p>
                          <p className="text-xs">{q.correctAnswerText}</p>
                        </div>
                        {q.answer && (
                          <div className={`p-3 rounded-lg border ${q.answer.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-destructive/20 bg-destructive/5'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mentor's Answer</p>
                              {q.answer.isCorrect
                                ? <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[9px]"><CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Correct</Badge>
                                : <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px]"><XCircle className="h-2.5 w-2.5 mr-0.5" /> Incorrect</Badge>
                              }
                            </div>
                            <p className="text-xs">{q.answer.answerText}</p>
                            {q.answer.feedback && <p className="text-[10px] text-muted-foreground mt-1 italic">{q.answer.feedback}</p>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
