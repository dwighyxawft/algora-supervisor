import { useAuth } from '@/contexts/AuthContext';
import { useSupervisorMentors, useMentorComplaints, useNotifications, useScreenings } from '@/hooks/use-api';
import { StatCard } from '@/components/supervisor/StatCard';
import { Users, ClipboardCheck, MessageSquareWarning, BarChart3, TrendingUp, Activity, Star, Bell, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMemo, useState, useEffect } from 'react';

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(222, 30%, 8%)',
    border: '1px solid hsl(222, 20%, 14%)',
    borderRadius: '8px',
    fontSize: '12px',
  },
};

function getNextMonthlyMeeting(): Date {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setHours(21, 0, 0, 0); // 9PM GMT
  if (now > lastDay) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    nextMonth.setHours(21, 0, 0, 0);
    return nextMonth;
  }
  return lastDay;
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: mentors, isLoading: mentorsLoading } = useSupervisorMentors(user?.id || '');
  const { data: screenings, isLoading: screeningsLoading } = useScreenings();
  const { data: complaints, isLoading: complaintsLoading } = useMentorComplaints(user?.id || '');
  const { data: notifications } = useNotifications();

  const isSaturday = new Date().getDay() === 6;
  const monthlyMeeting = useMemo(() => getNextMonthlyMeeting(), []);
  const countdown = useCountdown(monthlyMeeting);

  const screeningStats = useMemo(() => {
    if (!screenings) return { passed: 0, failed: 0, pending: 0, total: 0 };
    return {
      total: screenings.length,
      passed: screenings.filter(s => s.status === 'COMPLETED').length,
      failed: screenings.filter(s => s.status === 'FAILED').length,
      pending: screenings.filter(s => s.status === 'IN_PROGRESS' || s.status === 'NOT_STARTED').length,
    };
  }, [screenings]);

  const pendingComplaints = useMemo(() => complaints?.filter(c => c.status === 'pending').length ?? 0, [complaints]);

  const screeningPieData = useMemo(() => [
    { name: 'Passed', value: screeningStats.passed || 1, color: 'hsl(142, 76%, 36%)' },
    { name: 'Failed', value: screeningStats.failed || 1, color: 'hsl(0, 72%, 51%)' },
    { name: 'Pending', value: screeningStats.pending || 1, color: 'hsl(38, 92%, 50%)' },
  ], [screeningStats]);

  const activityData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      mentors: mentors ? Math.min(mentors.length + i * 2, mentors.length + 10) : 0,
      screenings: screenings ? Math.min(screenings.length + i, screenings.length + 5) : 0,
    }));
  }, [mentors, screenings]);

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
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.firstName || 'Supervisor'}
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your mentor management overview.</p>
        </div>
        {isSaturday && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button className="gradient-primary gap-2" size="lg">
              <Phone className="h-5 w-5" />
              Start Weekly Meeting
            </Button>
          </motion.div>
        )}
      </div>

      {/* Root Monthly Meeting Countdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Root Monthly Meeting</p>
                  <p className="text-xs text-muted-foreground">Last day of month · 9:00 PM GMT</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-3 text-center">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hrs' },
                    { value: countdown.minutes, label: 'Min' },
                    { value: countdown.seconds, label: 'Sec' },
                  ].map(t => (
                    <div key={t.label} className="bg-muted/50 rounded-lg px-3 py-1.5 min-w-[48px]">
                      <p className="text-lg font-bold font-mono">{String(t.value).padStart(2, '0')}</p>
                      <p className="text-[10px] text-muted-foreground">{t.label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  className="gradient-primary gap-2"
                  disabled={!countdown.expired}
                >
                  <Phone className="h-4 w-4" />
                  {countdown.expired ? 'Join Meeting' : 'Waiting...'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Mentors" value={mentors?.length ?? 0} icon={Users} delay={0} />
        <StatCard title="Pending Screenings" value={screeningStats.pending} icon={ClipboardCheck} delay={0.1} />
        <StatCard title="Pending Complaints" value={pendingComplaints} icon={MessageSquareWarning} delay={0.2} />
        <StatCard title="Total Screenings" value={screeningStats.total} icon={BarChart3} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Screening Pass Rate" value={screeningStats.total ? `${Math.round((screeningStats.passed / screeningStats.total) * 100)}%` : '0%'} icon={TrendingUp} delay={0.4} />
        <StatCard title="Verified Mentors" value={mentors?.filter(m => m.isEmailVerified).length ?? 0} icon={Activity} delay={0.5} />
        <StatCard title="Supervisor Rank" value={user?.rank || 'N/A'} icon={Star} delay={0.6} />
        <StatCard title="Unread Notifications" value={notifications?.filter(n => !n.isRead).length ?? 0} icon={Bell} delay={0.7} />
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
  );
}
