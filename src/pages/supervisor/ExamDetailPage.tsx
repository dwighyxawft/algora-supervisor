import { useParams, useNavigate } from 'react-router-dom';
import { useExams, useProjectExamSubmissions } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, FileCode, CheckCircle, XCircle, Download } from 'lucide-react';
import { useMemo } from 'react';

export default function ExamDetailPage() {
  const { examId, examType } = useParams();
  const navigate = useNavigate();
  const { data: exams } = useExams();
  const { data: projectSubmissions } = useProjectExamSubmissions(examId!);

  const exam = useMemo(() => exams?.find(e => e.id === examId), [exams, examId]);

  if (!exam) {
    return <div className="space-y-6"><Skeleton className="h-8 w-32" /><Skeleton className="h-64 rounded-xl" /></div>;
  }

  const isProject = examType === 'project';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{exam.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{isProject ? 'Project Exam' : 'Theory / Objective Exam'}</p>
      </div>

      {!isProject ? (
        <div className="space-y-4">
          {/* Theory Exam Questions */}
          {exam.theory && exam.theory.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Theory Questions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {exam.theory.map(te => te.questions?.map(q => (
                  <div key={q.id} className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm font-medium">{q.text}</p>
                    {q.correctAnswerText && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {q.correctAnswerText}</p>
                    )}
                  </div>
                )))}
              </CardContent>
            </Card>
          )}

          {/* Objective Exam Questions */}
          {exam.objective && exam.objective.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Objective Questions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {exam.objective.map(oe => oe.questions?.map(q => (
                  <div key={q.id} className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">{q.text}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options?.map(opt => (
                        <div key={opt.id} className={`text-xs p-2 rounded ${opt.tag === q.correctTag ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-muted/50 text-muted-foreground'}`}>
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Project Exam Details */}
          {exam.projectExam && (
            <Card className="glass-card">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold">{exam.projectExam.title}</h3>
                <p className="text-sm text-muted-foreground">{exam.projectExam.description}</p>
                {exam.projectExam.tasks.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Tasks:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {exam.projectExam.tasks.map((t, i) => <li key={i} className="text-xs text-muted-foreground">{t}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Project Submissions */}
          <h2 className="text-lg font-semibold">Submissions ({projectSubmissions?.length || 0})</h2>
          {projectSubmissions && projectSubmissions.length > 0 ? projectSubmissions.map(s => (
            <Card key={s.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={s.intern?.image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{s.intern?.firstName?.[0]}{s.intern?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{s.intern?.firstName} {s.intern?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.markGiven !== undefined && <Badge variant="outline">{s.markGiven} pts</Badge>}
                  <Badge className={s.passed ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-destructive/10 text-destructive'}>
                    {s.status}
                  </Badge>
                  {s.link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={s.link} target="_blank" rel="noreferrer"><Download className="h-3 w-3" /></a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileCode className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No submissions yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
