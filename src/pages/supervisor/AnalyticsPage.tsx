import { useAuth } from '@/contexts/AuthContext';
import { useSupervisorMentors, useMentorComplaints, useHomeworks, useClassworks, useChallenges, useExams } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/supervisor/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3, TrendingUp, Users, MessageSquareWarning, BookOpen, Award,
  ClipboardCheck, FileCode, GraduationCap, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
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
  const { data: complaints, isLoading: cL } = useMentorComplaints(user?.id || '');
  const { data: homeworks } = useHomeworks();
  const { data: classworks } = useClassworks();
  const { data: challenges } = useChallenges();
  const { data: exams } = useExams();

  const isLoading = mL || cL;

  // Aggregate from all mentors under supervisor
  const stats = useMemo(() => {
    if (!mentors) return { totalMentors: 0, totalPrograms: 0, totalBatches: 0, totalInterns: 0, totalHomeworks: 0, totalClassworks: 0, totalChallenges: 0, totalExams: 0, totalComplaints: 0, totalReviews: 0 };
    const mentorIds = new Set(mentors.map(m => m.id));
    return {
      totalMentors: mentors.length,
      totalPrograms: mentors.reduce((s, m) => s + (m.programs?.length || 0), 0),
      totalBatches: mentors.reduce((s, m) => s + (m.programs?.reduce((bs, p) => bs + (p.batches?.length || 0), 0) || 0), 0),
      totalInterns: mentors.reduce((s, m) => s + (m.programs?.reduce((is, p) => is + (p.onboarding?.length || 0), 0) || 0), 0),
      totalHomeworks: homeworks?.filter(h => mentorIds.has(h.mentorId)).length || 0,
      totalClassworks: classworks?.filter(c => mentorIds.has(c.mentorId)).length || 0,
      totalChallenges: challenges?.filter(c => mentorIds.has(c.mentorId)).length || 0,
      totalExams: exams?.filter(e => mentorIds.has(e.mentorId)).length || 0,
      totalComplaints: complaints?.length || 0,
      totalReviews: mentors.reduce((s, m) => s + (m.reviews?.length || 0), 0),
    };
  }, [mentors, homeworks, classworks, challenges, exams, complaints]);

  const mentorPerformance = useMemo(() => {
    if (!mentors) return [];
    return mentors.slice(0, 10).map(m => ({
      name: `${m.firstName} ${m.lastName?.charAt(0)}.`,
      programs: m.programs?.length || 0,
      interns: m.programs?.reduce((s, p) => s + (p.onboarding?.length || 0), 0) || 0,
      complaints: complaints?.filter(c => c.mentorId === m.id).length || 0,
    }));
  }, [mentors, complaints]);

  const radarData = useMemo(() => [
    { subject: 'Mentors', value: stats.totalMentors },
    { subject: 'Programs', value: stats.totalPrograms },
    { subject: 'Interns', value: stats.totalInterns },
    { subject: 'Homework', value: stats.totalHomeworks },
    { subject: 'Classwork', value: stats.totalClassworks },
    { subject: 'Challenges', value: stats.totalChallenges },
  ], [stats]);

  const complaintPie = useMemo(() => {
    if (!complaints) return [];
    const pending = complaints.filter(c => c.status === 'pending').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const rejected = complaints.filter(c => c.status === 'rejected').length;
    return [
      { name: 'Pending', value: pending || 0, color: 'hsl(38, 92%, 50%)' },
      { name: 'Resolved', value: resolved || 0, color: 'hsl(142, 76%, 36%)' },
      { name: 'Rejected', value: rejected || 0, color: 'hsl(0, 72%, 51%)' },
    ];
  }, [complaints]);

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
        <h1 className="text-2xl font-bold tracking-tight">Mentor Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Aggregated performance across all mentors under your supervision.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Mentors" value={stats.totalMentors} icon={Users} delay={0} />
        <StatCard title="Total Programs" value={stats.totalPrograms} icon={BookOpen} delay={0.05} />
        <StatCard title="Total Interns" value={stats.totalInterns} icon={GraduationCap} delay={0.1} />
        <StatCard title="Complaints" value={stats.totalComplaints} icon={MessageSquareWarning} delay={0.15} />
        <StatCard title="Reviews" value={stats.totalReviews} icon={Star} delay={0.2} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Homeworks" value={stats.totalHomeworks} icon={ClipboardCheck} delay={0.25} />
        <StatCard title="Classworks" value={stats.totalClassworks} icon={FileCode} delay={0.3} />
        <StatCard title="Challenges" value={stats.totalChallenges} icon={Award} delay={0.35} />
        <StatCard title="Exams" value={stats.totalExams} icon={BookOpen} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Mentor Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mentorPerformance}>
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Bar dataKey="programs" fill="hsl(217, 91%, 53%)" radius={[4, 4, 0, 0]} name="Programs" />
                  <Bar dataKey="interns" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Interns" />
                  <Bar dataKey="complaints" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Complaint Distribution</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={complaintPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {complaintPie.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="px-6 pb-4 flex justify-center gap-4">
              {complaintPie.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Academic Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
  );
}
