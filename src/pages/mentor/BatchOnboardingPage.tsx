import { useParams } from 'react-router-dom';
import { useMentorBatchOnboarding } from '@/hooks/use-mentor-api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { format } from 'date-fns';

export default function MentorBatchOnboardingPage() {
  const { programId, batchId } = useParams();
  const { data: onboardings, isLoading } = useMentorBatchOnboarding(programId!, batchId!);

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Enrolled Interns</h1><p className="text-sm text-muted-foreground mt-1">{onboardings?.length || 0} interns enrolled</p></div>
      {!onboardings?.length ? (
        <Card className="glass-card"><CardContent className="py-12 text-center"><Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">No interns enrolled yet</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {onboardings.map(o => (
            <Card key={o.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div><p className="text-sm font-medium">{o.intern?.firstName} {o.intern?.lastName}</p><p className="text-xs text-muted-foreground">{o.intern?.email}</p></div>
                <p className="text-xs text-muted-foreground">Enrolled {format(new Date(o.createdAt), 'MMM d, yyyy')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
