import { StatCard } from '@/components/supervisor/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { Users, ClipboardCheck, Video, MessageSquareWarning, BarChart3, Star, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const activityData = [
  { month: 'Jan', mentors: 12, screenings: 8 },
  { month: 'Feb', mentors: 15, screenings: 10 },
  { month: 'Mar', mentors: 18, screenings: 14 },
  { month: 'Apr', mentors: 22, screenings: 16 },
  { month: 'May', mentors: 20, screenings: 12 },
  { month: 'Jun', mentors: 25, screenings: 18 },
];

const complaintData = [
  { month: 'Jan', count: 3 }, { month: 'Feb', count: 5 }, { month: 'Mar', count: 2 },
  { month: 'Apr', count: 7 }, { month: 'May', count: 4 }, { month: 'Jun', count: 3 },
];

const screeningPieData = [
  { name: 'Passed', value: 65, color: 'hsl(142, 76%, 36%)' },
  { name: 'Failed', value: 20, color: 'hsl(0, 72%, 51%)' },
  { name: 'Pending', value: 15, color: 'hsl(38, 92%, 50%)' },
];

const recentActivity = [
  { id: '1', action: 'Approved mentor screening', mentor: 'John Doe', time: '2 hours ago' },
  { id: '2', action: 'Resolved complaint', mentor: 'Jane Smith', time: '4 hours ago' },
  { id: '3', action: 'Scheduled meeting', mentor: 'Mike Johnson', time: '6 hours ago' },
  { id: '4', action: 'Reviewed code challenge', mentor: 'Sarah Wilson', time: '1 day ago' },
  { id: '5', action: 'Created screening test', mentor: 'Alex Brown', time: '1 day ago' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold tracking-tight"
        >
          Welcome back, {user?.firstName || 'Supervisor'}
        </motion.h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your mentor management overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Mentors" value={user?.currentMentorCount || 24} icon={Users} trend={{ value: 12, positive: true }} delay={0} />
        <StatCard title="Pending Screenings" value={8} icon={ClipboardCheck} trend={{ value: 5, positive: false }} delay={0.1} />
        <StatCard title="Meetings Scheduled" value={5} icon={Video} subtitle="This week" delay={0.2} />
        <StatCard title="Open Complaints" value={3} icon={MessageSquareWarning} trend={{ value: 20, positive: true }} delay={0.3} />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Programs" value={12} icon={Activity} delay={0.4} />
        <StatCard title="Avg Performance" value="87%" icon={TrendingUp} trend={{ value: 3, positive: true }} delay={0.5} />
        <StatCard title="Screening Pass Rate" value="78%" icon={BarChart3} delay={0.6} />
        <StatCard title="Mentor Rating" value="4.6/5" icon={Star} trend={{ value: 8, positive: true }} delay={0.7} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mentor Activity Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={activityData}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      background: 'hsl(222, 30%, 8%)',
                      border: '1px solid hsl(222, 20%, 14%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="mentors" fill="hsl(217, 91%, 53%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="screenings" fill="hsl(211, 97%, 68%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Screening Results</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={screeningPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {screeningPieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      background: 'hsl(222, 30%, 8%)',
                      border: '1px solid hsl(222, 20%, 14%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
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

      {/* Complaint trend + Recent activity */}
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
                {recentActivity.map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.mentor} · {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
