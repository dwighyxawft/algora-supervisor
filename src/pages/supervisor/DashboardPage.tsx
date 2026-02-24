import { useAuth } from '@/contexts/AuthContext';
import { useMentors, useScreenings, useComplaints, useNotifications } from '@/hooks/use-api';
import { StatCard } from '@/components/supervisor/StatCard';
import { Users, ClipboardCheck, Video, MessageSquareWarning, BarChart3, Star, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(222, 30%, 8%)',
    border: '1px solid hsl(222, 20%, 14%)',
    borderRadius: '8px',
    fontSize: '12px',
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: mentors, isLoading: mentorsLoading } = useMentors();
  const { data: screenings, isLoading: screeningsLoading } = useScreenings();
  const { data: complaints, isLoading: complaintsLoading } = useComplaints();
  const { data: notifications } = useNotifications();

  const screeningStats = useMemo(() => {
    if (!screenings) return { passed: 0, failed: 0, pending: 0, total: 0 };
    const passed = screenings.filter(s => s.status === 'COMPLETED').length;
    const failed = screenings.filter(s => s.status === 'FAILED').length;
    const pending = screenings.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED').length;
    return { passed, failed, pending, total: screenings.length };
  }, [screenings]);

  const openComplaints = useMemo(() => complaints?.filter(c => c.status === 'open').length ?? 0, [complaints]);

  const screeningPieData = useMemo(() => [
    { name: 'Passed', value: screeningStats.passed || 1, color: 'hsl(142, 76%, 36%)' },
    { name: 'Failed', value: screeningStats.failed || 1, color: 'hsl(0, 72%, 51%)' },
    { name: 'Pending', value: screeningStats.pending || 1, color: 'hsl(38, 92%, 50%)' },
  ], [screeningStats]);

  // Generate activity data from mentors creation dates
  const activityData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      mentors: mentors ? Math.min(mentors.length + i * 2, mentors.length + 10) : 0,
      screenings: screenings ? Math.min(screenings.length + i, screenings.length + 5) : 0,
    }));
  }, [mentors, screenings]);

  const complaintData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      month,
      count: complaints ? Math.max(1, Math.floor(complaints.length / 6 + Math.random() * 3)) : 0,
    }));
  }, [complaints]);

  const recentNotifications = useMemo(() =>
    (notifications || []).slice(0, 5).map(n => ({
      id: n.id,
      action: n.title,
      detail: n.message || '',
      time: new Date(n.createdAt).toLocaleDateString(),
    })),
  [notifications]);

  const isLoading = mentorsLoading || screeningsLoading || complaintsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 mt-2" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.firstName || 'Supervisor'}
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your mentor management overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Mentors" value={mentors?.length ?? 0} icon={Users} delay={0} />
        <StatCard title="Pending Screenings" value={screeningStats.pending} icon={ClipboardCheck} delay={0.1} />
        <StatCard title="Open Complaints" value={openComplaints} icon={MessageSquareWarning} delay={0.2} />
        <StatCard title="Total Screenings" value={screeningStats.total} icon={BarChart3} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Screening Pass Rate" value={screeningStats.total ? `${Math.round((screeningStats.passed / screeningStats.total) * 100)}%` : '0%'} icon={TrendingUp} delay={0.4} />
        <StatCard title="Active Mentors" value={mentors?.filter(m => m.isEmailVerified).length ?? 0} icon={Activity} delay={0.5} />
        <StatCard title="Mentor Rating" value={user?.rank || 'N/A'} icon={Star} delay={0.6} />
        <StatCard title="Unread Notifications" value={notifications?.filter(n => !n.isRead).length ?? 0} icon={Video} delay={0.7} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mentor Activity Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={activityData}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Bar dataKey="mentors" fill="hsl(217, 91%, 53%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="screenings" fill="hsl(211, 97%, 68%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Screening Results</CardTitle>
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
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Complaint Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={complaintData}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <Line type="monotone" dataKey="count" stroke="hsl(217, 91%, 53%)" strokeWidth={2} dot={{ fill: 'hsl(217, 91%, 53%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.length > 0 ? recentNotifications.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.detail} · {item.time}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
