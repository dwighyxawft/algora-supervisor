import { useMentors, useScreenings } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/supervisor/StatCard';
import { DataTable } from '@/components/supervisor/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import type { Mentor } from '@/lib/api/models';

export default function ReviewsPage() {
  const { data: mentors, isLoading: mentorsLoading } = useMentors();
  const { data: screenings } = useScreenings();

  const reviewData = useMemo(() => {
    if (!mentors) return [];
    return mentors.map(m => {
      const s = screenings?.find(sc => sc.mentor_id === m.id);
      const passedPhases = [s?.assessmentPassed, s?.codeInterviewPassed, s?.qBotPassed, s?.reviewCompleted].filter(Boolean).length;
      const score = passedPhases * 25;
      return {
        ...m,
        screeningScore: s?.finalAssessmentScore ?? null,
        passedPhases,
        performance: score >= 75 ? 'excellent' : score >= 50 ? 'good' : score >= 25 ? 'average' : 'pending',
        performanceScore: score,
      };
    });
  }, [mentors, screenings]);

  const statusColors: Record<string, string> = {
    excellent: 'bg-green-500/10 text-green-400 border-green-500/20',
    good: 'bg-primary/10 text-primary border-primary/20',
    average: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    pending: 'bg-muted text-muted-foreground',
  };

  const stats = useMemo(() => {
    const excellent = reviewData.filter(r => r.performance === 'excellent').length;
    const needs = reviewData.filter(r => r.performance === 'average' || r.performance === 'pending').length;
    const avgScore = reviewData.length ? Math.round(reviewData.reduce((a, r) => a + r.performanceScore, 0) / reviewData.length) : 0;
    return { total: reviewData.length, excellent, needs, avgScore };
  }, [reviewData]);

  const columns = [
    {
      key: 'mentor',
      label: 'Mentor',
      render: (r: typeof reviewData[0]) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={r.image} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{r.firstName?.[0]}{r.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{r.firstName} {r.lastName}</span>
        </div>
      ),
    },
    {
      key: 'screeningScore',
      label: 'Assessment Score',
      sortable: true,
      render: (r: typeof reviewData[0]) => (
        <span className="font-semibold text-sm">{r.screeningScore != null ? `${r.screeningScore}%` : '—'}</span>
      ),
    },
    {
      key: 'passedPhases',
      label: 'Phases Passed',
      sortable: true,
      render: (r: typeof reviewData[0]) => <span className="text-sm">{r.passedPhases}/4</span>,
    },
    {
      key: 'performanceScore',
      label: 'Performance',
      sortable: true,
      render: (r: typeof reviewData[0]) => {
        const color = r.performanceScore >= 75 ? 'text-green-400' : r.performanceScore >= 50 ? 'text-primary' : 'text-yellow-400';
        return <span className={`font-semibold text-sm ${color}`}>{r.performanceScore}%</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (r: typeof reviewData[0]) => <Badge className={statusColors[r.performance]}>{r.performance}</Badge>,
    },
  ];

  if (mentorsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews & Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor mentor reviews and screening performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Mentors" value={stats.total} icon={Star} delay={0} />
        <StatCard title="Excellent" value={stats.excellent} icon={ThumbsUp} delay={0.1} />
        <StatCard title="Avg. Performance" value={`${stats.avgScore}%`} icon={TrendingUp} delay={0.2} />
        <StatCard title="Needs Improvement" value={stats.needs} icon={ThumbsDown} delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={reviewData}
        searchPlaceholder="Search mentors..."
        emptyMessage="No review data yet"
        emptyIcon={<Star className="h-8 w-8" />}
      />
    </div>
  );
}
