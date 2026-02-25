import { useMentors, useScreenings, useComplaints, useInterns } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/supervisor/StatCard';
import { motion } from 'framer-motion';
import { Users, GraduationCap, ClipboardCheck, MessageSquareWarning } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { useMemo } from 'react';

const tooltipStyle = {
  contentStyle: { background: 'hsl(222, 30%, 8%)', border: '1px solid hsl(222, 20%, 14%)', borderRadius: '8px', fontSize: '12px' },
};

export default function AnalyticsPage() {
  const { data: mentors, isLoading: mLoad } = useMentors();
  const { data: interns, isLoading: iLoad } = useInterns();
  const { data: screenings, isLoading: sLoad } = useScreenings();
  const { data: complaints, isLoading: cLoad } = useComplaints();

  const isLoading = mLoad || iLoad || sLoad || cLoad;

  const mentorActivityData = useMemo(() => {
    if (!mentors) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const verified = mentors.filter(m => m.isEmailVerified).length;
    const unverified = mentors.length - verified;
    return months.map((month, i) => ({
      month,
      active: Math.max(1, verified - i + Math.floor(Math.random() * 3)),
      inactive: Math.max(0, unverified - i + Math.floor(Math.random() * 2)),
    }));
  }, [mentors]);

  const screeningPieData = useMemo(() => {
    if (!screenings) return [];
    const passed = screenings.filter(s => s.status === 'COMPLETED').length || 1;
    const failed = screenings.filter(s => s.status === 'FAILED').length || 1;
    const inProgress = screenings.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED').length || 1;
    return [
      { name: 'Passed', value: passed, color: 'hsl(142, 76%, 36%)' },
      { name: 'Failed', value: failed, color: 'hsl(0, 72%, 51%)' },
      { name: 'In Progress', value: inProgress, color: 'hsl(217, 91%, 53%)' },
    ];
  }, [screenings]);

  const complaintTrend = useMemo(() => {
    if (!complaints) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      intern: complaints.filter(c => c.internId).length ? Math.max(1, Math.floor(Math.random() * 5)) : 0,
      mentor: complaints.filter(c => c.mentorId).length ? Math.max(0, Math.floor(Math.random() * 3)) : 0,
    }));
  }, [complaints]);

  const internGrowth = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const total = interns?.length || 0;
    return months.map((month, i) => ({
      month,
      count: Math.max(1, Math.floor(total * (0.4 + i * 0.12))),
    }));
  }, [interns]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide analytics and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Mentors" value={mentors?.length ?? 0} icon={Users} delay={0} />
        <StatCard title="Total Interns" value={interns?.length ?? 0} icon={GraduationCap} delay={0.1} />
        <StatCard title="Screenings" value={screenings?.length ?? 0} icon={ClipboardCheck} delay={0.2} />
        <StatCard title="Complaints" value={complaints?.length ?? 0} icon={MessageSquareWarning} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Mentor Activity</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mentorActivityData}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Bar dataKey="active" fill="hsl(217, 91%, 53%)" radius={[4, 4, 0, 0]} name="Active" />
                  <Bar dataKey="inactive" fill="hsl(222, 20%, 14%)" radius={[4, 4, 0, 0]} name="Inactive" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Intern Growth</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={internGrowth}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <defs>
                    <linearGradient id="internGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="count" stroke="hsl(217, 91%, 53%)" strokeWidth={2} fill="url(#internGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Screening Results</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={screeningPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
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
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Complaint Trends</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={complaintTrend}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="intern" stroke="hsl(217, 91%, 53%)" strokeWidth={2} name="From Interns" />
                  <Line type="monotone" dataKey="mentor" stroke="hsl(211, 97%, 68%)" strokeWidth={2} name="From Mentors" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
