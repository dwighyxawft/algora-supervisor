import { useMemo } from 'react';
import { useMentorAuth } from '@/contexts/MentorAuthContext';
import { useMentorPrograms, useMentorSchedules } from '@/hooks/use-mentor-api';
import { StatCard } from '@/components/supervisor/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Users, Calendar, Layers } from 'lucide-react';
import { format } from 'date-fns';

export default function MentorDashboardPage() {
  const { user } = useMentorAuth();
  const { data: programs, isLoading: pLoading } = useMentorPrograms();
  const { data: schedules, isLoading: sLoading } = useMentorSchedules();

  const myPrograms = useMemo(() => programs?.filter(p => p.mentorId === user?.id) || [], [programs, user]);
  const activeBatches = useMemo(() => myPrograms.reduce((sum, p) => sum + (p.batches?.filter(b => b.isActive)?.length || 0), 0), [myPrograms]);
  const totalInterns = useMemo(() => myPrograms.reduce((sum, p) => sum + (p.onboarding?.length || 0), 0), [myPrograms]);
  const upcoming = useMemo(() => {
    if (!schedules) return [];
    return schedules.filter(s => new Date(s.startTime) > new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 5);
  }, [schedules]);

  if (pLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your teaching overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Programs" value={myPrograms.length} icon={BookOpen} delay={0} />
        <StatCard title="Active Batches" value={activeBatches} icon={Layers} delay={0.1} />
        <StatCard title="Interns Enrolled" value={totalInterns} icon={Users} delay={0.2} />
        <StatCard title="Upcoming Schedules" value={upcoming.length} icon={Calendar} delay={0.3} />
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg">Upcoming Schedules</CardTitle></CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming schedules</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-primary">{format(new Date(s.startTime), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(s.startTime), 'h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
