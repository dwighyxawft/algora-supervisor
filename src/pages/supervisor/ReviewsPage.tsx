import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/supervisor/StatCard';
import { DataTable } from '@/components/supervisor/DataTable';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

const MOCK_REVIEWS = [
  { id: '1', mentorName: 'John Doe', initials: 'JD', avgRating: 4.5, totalReviews: 24, satisfaction: 92, status: 'excellent' },
  { id: '2', mentorName: 'Jane Smith', initials: 'JS', avgRating: 4.2, totalReviews: 18, satisfaction: 88, status: 'good' },
  { id: '3', mentorName: 'Mike Johnson', initials: 'MJ', avgRating: 3.5, totalReviews: 12, satisfaction: 70, status: 'average' },
  { id: '4', mentorName: 'Sarah Wilson', initials: 'SW', avgRating: 4.8, totalReviews: 30, satisfaction: 96, status: 'excellent' },
  { id: '5', mentorName: 'Alex Brown', initials: 'AB', avgRating: 3.9, totalReviews: 15, satisfaction: 78, status: 'good' },
];

export default function ReviewsPage() {
  const statusColors: Record<string, string> = {
    excellent: 'bg-green-500/10 text-green-400 border-green-500/20',
    good: 'bg-primary/10 text-primary border-primary/20',
    average: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    poor: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const columns = [
    {
      key: 'mentor',
      label: 'Mentor',
      render: (r: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{r.initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{r.mentorName}</span>
        </div>
      ),
    },
    {
      key: 'avgRating',
      label: 'Rating',
      sortable: true,
      render: (r: any) => (
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">{r.avgRating}</span>
        </div>
      ),
    },
    { key: 'totalReviews', label: 'Reviews', sortable: true },
    {
      key: 'satisfaction',
      label: 'Satisfaction',
      sortable: true,
      render: (r: any) => {
        const color = r.satisfaction >= 90 ? 'text-green-400' : r.satisfaction >= 80 ? 'text-primary' : 'text-yellow-400';
        return <span className={`font-semibold text-sm ${color}`}>{r.satisfaction}%</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (r: any) => <Badge className={statusColors[r.status]}>{r.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews & Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor mentor reviews and teaching effectiveness.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Avg. Rating" value="4.2/5" icon={Star} trend={{ value: 5, positive: true }} delay={0} />
        <StatCard title="Total Reviews" value={99} icon={ThumbsUp} delay={0.1} />
        <StatCard title="Avg. Satisfaction" value="85%" icon={TrendingUp} trend={{ value: 3, positive: true }} delay={0.2} />
        <StatCard title="Needs Improvement" value={1} icon={ThumbsDown} delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={MOCK_REVIEWS}
        searchPlaceholder="Search mentors..."
        emptyMessage="No reviews yet"
        emptyIcon={<Star className="h-8 w-8" />}
      />
    </div>
  );
}
