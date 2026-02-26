import { useParams, useNavigate } from 'react-router-dom';
import { useBatch, useBatchOnboardings } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/supervisor/DataTable';
import { ArrowLeft, GraduationCap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { InternProgramOnboarding } from '@/lib/api/models';

export default function BatchDetailPage() {
  const { id: programId, batchId } = useParams();
  const navigate = useNavigate();
  const { data: batch, isLoading: batchLoading } = useBatch(batchId!);
  const { data: onboardings, isLoading: onbLoading } = useBatchOnboardings(programId!, batchId!);

  const isLoading = batchLoading || onbLoading;

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
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${o.progressPercentage}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{o.progressPercentage}%</span>
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
