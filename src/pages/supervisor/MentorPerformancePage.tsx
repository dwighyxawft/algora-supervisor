import { useAuth } from '@/contexts/AuthContext';
import { useSupervisorMentors, useScreenings, useMentorComplaints, useMentorReviews } from '@/hooks/use-api';
import { DataTable } from '@/components/supervisor/DataTable';
import { StatCard } from '@/components/supervisor/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Star, AlertTriangle, Award, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Mentor } from '@/lib/api/models';

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(222, 30%, 8%)',
    border: '1px solid hsl(222, 20%, 14%)',
    borderRadius: '8px',
    fontSize: '12px',
  },
};

interface MentorWithPerformance extends Mentor {
  screeningScore: number;
  passedPhases: number;
  complaintCount: number;
  programCount: number;
  performanceGrade: string;
  overallScore: number;
}

export default function MentorPerformancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: mentors, isLoading } = useSupervisorMentors(user?.id || '');
  const { data: screenings } = useScreenings();
  const { data: complaints } = useMentorComplaints(user?.id || '');

  const performanceData = useMemo((): MentorWithPerformance[] => {
    if (!mentors) return [];
    return mentors.map(m => {
      const s = screenings?.find(sc => sc.mentor_id === m.id);
      const passedPhases = [s?.assessmentPassed, s?.codeInterviewPassed, s?.qBotPassed, s?.reviewCompleted].filter(Boolean).length;
      const screeningScore = passedPhases * 25;
      const complaintCount = complaints?.filter(c => c.mentorId === m.id).length || 0;
      const programCount = m.programs?.length || 0;
      const complaintPenalty = Math.min(complaintCount * 10, 30);
      const programBonus = Math.min(programCount * 10, 20);
      const overallScore = Math.max(0, Math.min(100, screeningScore + programBonus - complaintPenalty));
      const performanceGrade = overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Average' : 'Needs Improvement';
      return { ...m, screeningScore, passedPhases, complaintCount, programCount, performanceGrade, overallScore };
    });
  }, [mentors, screenings, complaints]);

  const chartData = useMemo(() =>
    performanceData.slice(0, 10).map(m => ({
      name: `${m.firstName} ${m.lastName?.charAt(0)}.`,
      score: m.overallScore,
      complaints: m.complaintCount,
    })),
  [performanceData]);

  const stats = useMemo(() => {
    const excellent = performanceData.filter(m => m.performanceGrade === 'Excellent').length;
    const needsImprovement = performanceData.filter(m => m.performanceGrade === 'Needs Improvement').length;
    const avgScore = performanceData.length ? Math.round(performanceData.reduce((a, m) => a + m.overallScore, 0) / performanceData.length) : 0;
    return { total: performanceData.length, excellent, needsImprovement, avgScore };
  }, [performanceData]);

  const gradeColors: Record<string, string> = {
    'Excellent': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Good': 'bg-primary/10 text-primary border-primary/20',
    'Average': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Needs Improvement': 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const columns = [
    {
      key: 'mentor',
      label: 'Mentor',
      render: (m: MentorWithPerformance) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={m.image} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{m.firstName?.[0]}{m.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
            <p className="text-xs text-muted-foreground">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'overallScore',
      label: 'Score',
      sortable: true,
      render: (m: MentorWithPerformance) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress value={m.overallScore} className="h-1.5 flex-1" />
          <span className="text-sm font-semibold w-10 text-right">{m.overallScore}%</span>
        </div>
      ),
    },
    {
      key: 'passedPhases',
      label: 'Screening',
      sortable: true,
      render: (m: MentorWithPerformance) => <span className="text-sm">{m.passedPhases}/4 phases</span>,
    },
    {
      key: 'programCount',
      label: 'Programs',
      sortable: true,
      render: (m: MentorWithPerformance) => <span className="text-sm">{m.programCount}</span>,
    },
    {
      key: 'complaintCount',
      label: 'Complaints',
      sortable: true,
      render: (m: MentorWithPerformance) => (
        <span className={`text-sm font-medium ${m.complaintCount > 2 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {m.complaintCount}
        </span>
      ),
    },
    {
      key: 'performanceGrade',
      label: 'Grade',
      render: (m: MentorWithPerformance) => <Badge className={gradeColors[m.performanceGrade] || ''}>{m.performanceGrade}</Badge>,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mentor Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and monitor mentor academic and teaching performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Mentors" value={stats.total} icon={Users} delay={0} />
        <StatCard title="Excellent" value={stats.excellent} icon={Award} delay={0.1} />
        <StatCard title="Avg Performance" value={`${stats.avgScore}%`} icon={TrendingUp} delay={0.2} />
        <StatCard title="Needs Improvement" value={stats.needsImprovement} icon={AlertTriangle} delay={0.3} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip {...tooltipStyle} />
                <Bar dataKey="score" fill="hsl(217, 91%, 53%)" radius={[4, 4, 0, 0]} name="Performance Score" />
                <Bar dataKey="complaints" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <DataTable
        columns={columns}
        data={performanceData}
        searchPlaceholder="Search mentors..."
        onRowClick={(m) => navigate(`/supervisor/mentors/${m.id}`)}
        emptyMessage="No mentor performance data"
        emptyIcon={<BarChart3 className="h-8 w-8" />}
      />
    </div>
  );
}
