import { useParams, useNavigate } from 'react-router-dom';
import { useHomeworks, useClassworks, useChallenges } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Eye, Download, FileText } from 'lucide-react';
import { useMemo } from 'react';
import type { HomeworkSubmission, ClassworkSubmission, ChallengeSubmission } from '@/lib/api/models';

type AssignmentType = 'homework' | 'classwork' | 'challenge';

export default function AssignmentDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { homeworkId, classworkId, challengeId } = params;

  const assignmentType: AssignmentType = homeworkId ? 'homework' : classworkId ? 'classwork' : 'challenge';
  const assignmentId = homeworkId || classworkId || challengeId;

  const { data: homeworks } = useHomeworks();
  const { data: classworks } = useClassworks();
  const { data: challenges } = useChallenges();

  const assignment = useMemo(() => {
    if (assignmentType === 'homework') return homeworks?.find(h => h.id === assignmentId);
    if (assignmentType === 'classwork') return classworks?.find(c => c.id === assignmentId);
    return challenges?.find(c => c.id === assignmentId);
  }, [homeworks, classworks, challenges, assignmentId, assignmentType]);

  const submissions: (HomeworkSubmission | ClassworkSubmission | ChallengeSubmission)[] = useMemo(() => {
    if (!assignment) return [];
    return (assignment as any).submissions || [];
  }, [assignment]);

  if (!assignment) {
    return <div className="space-y-6"><Skeleton className="h-8 w-32" /><Skeleton className="h-64 rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{(assignment as any).title}</h1>
            <Badge className={(assignment as any).isClosed ? 'bg-muted text-muted-foreground' : 'bg-green-500/10 text-green-400 border-green-500/20'}>
              {(assignment as any).isClosed ? 'Closed' : 'Open'}
            </Badge>
          </div>
          {(assignment as any).description && <p className="text-sm text-muted-foreground">{(assignment as any).description}</p>}
          {'dueAt' in assignment && <p className="text-xs text-muted-foreground">Due: {new Date((assignment as any).dueAt).toLocaleDateString()}</p>}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Submissions ({submissions.length})</h2>
        {submissions.length > 0 ? (
          <div className="space-y-2">
            {submissions.map((s: any) => (
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
                  <div className="flex items-center gap-3">
                    {s.score !== undefined && s.score !== null && (
                      <Badge variant="outline" className="text-sm">{s.score} pts</Badge>
                    )}
                    {s.isLate && <Badge className="bg-yellow-500/10 text-yellow-400">Late</Badge>}
                    {s.submissionFileUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={s.submissionFileUrl} target="_blank" rel="noreferrer"><Download className="h-3 w-3" /></a>
                      </Button>
                    )}
                    {s.mentorFeedback && (
                      <Badge variant="outline" className="text-xs max-w-[150px] truncate">{s.mentorFeedback}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No submissions yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
