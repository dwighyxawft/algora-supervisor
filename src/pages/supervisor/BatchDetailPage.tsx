import { useParams, useNavigate } from 'react-router-dom';
import { useBatch, useBatchOnboardings } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/supervisor/StatCard';
import { DataTable } from '@/components/supervisor/DataTable';
import { ArrowLeft, GraduationCap, Calendar, Users, TrendingUp, CheckCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';
import type { InternProgramOnboarding } from '@/lib/api/models';

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(222, 30%, 8%)',
    border: '1px solid hsl(222, 20%, 14%)',
    borderRadius: '8px',
    fontSize: '12px',
  },
};

export default function BatchDetailPage() {
  const { id: programId, batchId } = useParams();
  const navigate = useNavigate();
  const { data: batch, isLoading: batchLoading } = useBatch(batchId!);
  const { data: onboardings, isLoading: onbLoading } = useBatchOnboardings(programId!, batchId!);

  const isLoading = batchLoading || onbLoading;

  const stats = useMemo(() => {
    if (!onboardings) return { total: 0, completed: 0, passed: 0, fullyPaid: 0, avgProgress: 0 };
    const completed = onboardings.filter(o => o.completed).length;
    const passed = onboardings.filter(o => o.passed).length;
    const fullyPaid = onboardings.filter(o => o.fullyPaid).length;
    const avgProgress = onboardings.length ? Math.round(onboardings.reduce((a, o) => a + o.progressPercentage, 0) / onboardings.length) : 0;
    return { total: onboardings.length, completed, passed, fullyPaid, avgProgress };
  }, [onboardings]);

  const progressDistribution = useMemo(() => {
    if (!onboardings) return [];
    const ranges = [
      { name: '0-25%', min: 0, max: 25, color: 'hsl(0, 72%, 51%)' },
      { name: '26-50%', min: 26, max: 50, color: 'hsl(38, 92%, 50%)' },
      { name: '51-75%', min: 51, max: 75, color: 'hsl(217, 91%, 53%)' },
      { name: '76-100%', min: 76, max: 100, color: 'hsl(142, 76%, 36%)' },
    ];
    return ranges.map(r => ({
      ...r,
      value: onboardings.filter(o => o.progressPercentage >= r.min && o.progressPercentage <= r.max).length,
    }));
  }, [onboardings]);

  const columns = [
    {
      key: 'intern',
      label: 'Intern',
      render: (o: InternProgramOnboarding) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={o.intern?.image} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {o.intern?.firstName?.[0]}{o.intern?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{o.intern?.firstName} {o.intern?.lastName}</p>
            <p className="text-xs text-muted-foreground">{o.intern?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      sortable: true,
      render: (o: InternProgramOnboarding) => (
        <div className="flex items-center gap-2 min-w-[140px]">
          <Progress value={o.progressPercentage} className="h-1.5 flex-1" />
          <span className="text-xs font-medium text-muted-foreground w-10 text-right">{o.progressPercentage}%</span>
        </div>
      ),
    },
    {
      key: 'completed',
      label: 'Status',
      render: (o: InternProgramOnboarding) => (
        <Badge className={o.completed ? 'bg-green-500/10 text-green-400 border-green-500/20' : o.passed ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}>
          {o.completed ? 'Completed' : o.passed ? 'Passed' : 'In Progress'}
        </Badge>
      ),
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (o: InternProgramOnboarding) => (
        <Badge variant={o.fullyPaid ? 'default' : 'secondary'}>
          {o.fullyPaid ? 'Paid' : o.programPricePaid ? 'Partial' : 'Unpaid'}
        </Badge>
      ),
    },
    {
      key: 'feedback',
      label: 'Feedback',
      render: (o: InternProgramOnboarding) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{o.feedback || '—'}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to program
      </Button>

      {batch && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{batch.batchName}</h1>
                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(batch.startDate).toLocaleDateString()} — {new Date(batch.endDate).toLocaleDateString()}</span>
                    {batch.durationInWeeks && <span>{batch.durationInWeeks} weeks</span>}
                  </div>
                </div>
                <Badge variant={batch.isActive ? 'default' : 'secondary'}>{batch.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Interns" value={stats.total} icon={Users} delay={0} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} delay={0.1} />
        <StatCard title="Avg. Progress" value={`${stats.avgProgress}%`} icon={TrendingUp} delay={0.2} />
        <StatCard title="Fully Paid" value={stats.fullyPaid} icon={DollarSign} delay={0.3} />
      </div>

      {onboardings && onboardings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Progress Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={progressDistribution}>
                    <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} tickLine={false} axisLine={false} />
                    <RechartsTooltip {...tooltipStyle} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {progressDistribution.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Fully Paid', value: stats.fullyPaid, color: 'hsl(142, 76%, 36%)' },
                        { name: 'Partial', value: onboardings.filter(o => o.programPricePaid && !o.fullyPaid).length, color: 'hsl(38, 92%, 50%)' },
                        { name: 'Unpaid', value: onboardings.filter(o => !o.programPricePaid).length, color: 'hsl(0, 72%, 51%)' },
                      ]}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value"
                    >
                      {[
                        { color: 'hsl(142, 76%, 36%)' },
                        { color: 'hsl(38, 92%, 50%)' },
                        { color: 'hsl(0, 72%, 51%)' },
                      ].map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Enrolled Interns</h2>
        <DataTable
          columns={columns}
          data={onboardings || []}
          searchPlaceholder="Search interns..."
          emptyMessage="No interns enrolled in this batch"
          emptyIcon={<GraduationCap className="h-8 w-8" />}
        />
      </div>
    </div>
  );
}
