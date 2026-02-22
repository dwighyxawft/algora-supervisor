import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const mentorActivityData = [
  { month: 'Jan', active: 18, inactive: 4 },
  { month: 'Feb', active: 20, inactive: 3 },
  { month: 'Mar', active: 22, inactive: 2 },
  { month: 'Apr', active: 19, inactive: 5 },
  { month: 'May', active: 24, inactive: 2 },
  { month: 'Jun', active: 25, inactive: 1 },
];

const satisfactionData = [
  { month: 'Jan', score: 82 }, { month: 'Feb', score: 85 }, { month: 'Mar', score: 88 },
  { month: 'Apr', score: 84 }, { month: 'May', score: 90 }, { month: 'Jun', score: 92 },
];

const screeningData = [
  { name: 'Passed', value: 65, color: 'hsl(142, 76%, 36%)' },
  { name: 'Failed', value: 20, color: 'hsl(0, 72%, 51%)' },
  { name: 'In Progress', value: 15, color: 'hsl(217, 91%, 53%)' },
];

const complaintTrend = [
  { month: 'Jan', intern: 3, mentor: 1 }, { month: 'Feb', intern: 5, mentor: 2 },
  { month: 'Mar', intern: 2, mentor: 1 }, { month: 'Apr', intern: 4, mentor: 3 },
  { month: 'May', intern: 3, mentor: 1 }, { month: 'Jun', intern: 2, mentor: 0 },
];

const tooltipStyle = {
  contentStyle: { background: 'hsl(222, 30%, 8%)', border: '1px solid hsl(222, 20%, 14%)', borderRadius: '8px', fontSize: '12px' },
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Mentor-level analytics and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mentor Activity</CardTitle>
            </CardHeader>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Intern Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={satisfactionData}>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} tickLine={false} axisLine={false} domain={[70, 100]} />
                  <RechartsTooltip {...tooltipStyle} />
                  <defs>
                    <linearGradient id="satisfaction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="score" stroke="hsl(217, 91%, 53%)" strokeWidth={2} fill="url(#satisfaction)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Screening Results</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={screeningData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                    {screeningData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="px-6 pb-4 flex justify-center gap-4">
              {screeningData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Complaint Trends</CardTitle>
            </CardHeader>
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
