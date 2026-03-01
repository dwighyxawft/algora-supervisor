import { useAuth } from '@/contexts/AuthContext';
import { useSupervisorMentors, useScreenings, useMentorComplaints, useExams, useHomeworks, useClassworks, useChallenges } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/supervisor/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Users, ClipboardCheck, MessageSquareWarning, BookOpen, Award, FileCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { useMemo } from 'react';

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(222, 30%, 8%)',
    border: '1px solid hsl(222, 20%, 14%)',
    borderRadius: '8px',
    fontSize: '12px',
  },
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { data: mentors, isLoading: mL } = useSupervisorMentors(user?.id || '');
  const { data: screenings, isLoading: sL } = useScreenings();
  const { data: complaints, isLoading: cL } = useMentorComplaints(user?.id || '');
  const { data: exams } = useExams();
  const { data: homeworks } = useHomeworks();
  const { data: classworks } = useClassworks();
  const { data: challenges } = useChallenges();

  const isLoading = mL || sL || cL;

  const screeningStats = useMemo(() => {
    if (!screenings) return { passed: 0, failed: 0, pending: 0, total: 0 };
    return {
      total: screenings.length,
      passed: screenings.filter(s => s.status === 'COMPLETED').length,
      failed: screenings.filter(s => s.status === 'FAILED').length,
      pending: screenings.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED').length,
    };
  }, [screenings]);

  const mentorPerformanceData = useMemo(() => {
    if (!mentors) return [];
    return mentors.slice(0, 8).map(m => {
      const mentorScreening = screenings?.find(s => s.mentor_id === m.id);
      const phases = [mentorScreening?.assessmentPassed, mentorScreening?.codeInterviewPassed, mentorScreening?.qBotPassed, mentorScreening?.reviewCompleted].filter(Boolean).length;
      const mentorComplaints = complaints?.filter(c => c.mentorId === m.id).length || 0;
      return {
        name: `${m.firstName} ${m.lastName?.charAt(0)}.`,
        screening: phases * 25,
        complaints: mentorComplaints,
        programs: m.programs?.length || 0,
      };
    });
  }, [mentors, screenings, complaints]);

  const complaintTrend = useMemo(() => {
    if (!complaints) return [];
    const months: Record<string, { pending: number; resolved: number; rejected: number }> = {};
    complaints.forEach(c => {
      const m = new Date(c.createdAt).toLocaleDateString('en', { month: 'short' });
      if (!months[m]) months[m] = { pending: 0, resolved: 0, rejected: 0 };
      months[m][c.status as keyof typeof months[string]]++;
    });
    return Object.entries(months).map(([month, v]) => ({ month, ...v }));
  }, [complaints]);

  const screeningPieData = useMemo(() => [
    { name: 'Passed', value: screeningStats.passed || 0, color: 'hsl(142, 76%, 36%)' },
    { name: 'Failed', value: screeningStats.failed || 0, color: 'hsl(0, 72%, 51%)' },
    { name: 'Pending', value: screeningStats.pending || 0, color: 'hsl(38, 92%, 50%)' },
  ], [screeningStats]);

  const radarData = useMemo(() => [
    { subject: 'Mentors', value: mentors?.length || 0 },
    { subject: 'Screenings', value: screenings?.length || 0 },
    { subject: 'Exams', value: exams?.length || 0 },
    { subject: 'Homework', value: homeworks?.length || 0 },
    { subject: 'Classwork', value: classworks?.length || 0 },
    { subject: 'Challenges', value: challenges?.length || 0 },
  ], [mentors, screenings, exams, homeworks, classworks, challenges]);

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
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive overview of mentor and academic performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Mentors" value={mentors?.length ?? 0} icon={Users} delay={0} />
        <StatCard title="Screening Pass Rate" value={screeningStats.total ? `${Math.round((screeningStats.passed / screeningStats.total) * 100)}%` : '0%'} icon={TrendingUp} delay={0.1} />
        <StatCard title="Total Complaints" value={complaints?.length ?? 0} icon={MessageSquareWarning} delay={0.2} />
        <StatCard title="Active Exams" value={exams?.filter(e => e.status === 'ONGOING').length ?? 0} icon={BookOpen} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Exams" value={exams?.length ?? 0} icon={FileCode} delay={0.4} />
        <StatCard title="Total Homework" value={homeworks?.length ?? 0} icon={BookOpen} delay={0.5} />
        <StatCard title="Total Classwork" value={classworks?.length ?? 0} icon={ClipboardCheck} delay={0.6} />
        <StatCard title="Total Challenges" value={challenges?.length ?? 0} icon={Award} delay={0.7} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mentor Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mentorPerformanceData}>
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Bar dataKey="screening" fill="hsl(217, 91%, 53%)" radius={[4, 4, 0, 0]} name="Screening %" />
                  <Bar dataKey="programs" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Programs" />
                  <Bar dataKey="complaints" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Screening Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={screeningPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {screeningPieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="px-6 pb-4 flex justify-center gap-4">
              {screeningPieData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Complaint Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={complaintTrend.length > 0 ? complaintTrend : [{ month: 'No data', pending: 0, resolved: 0, rejected: 0 }]}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="resolved" stackId="1" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="rejected" stackId="1" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Academic Overview Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(222, 20%, 14%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} />
                  <Radar name="Count" dataKey="value" stroke="hsl(217, 91%, 53%)" fill="hsl(217, 91%, 53%)" fillOpacity={0.3} />
                  <RechartsTooltip {...tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
