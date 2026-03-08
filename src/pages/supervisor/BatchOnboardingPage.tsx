import { useParams, useNavigate } from 'react-router-dom';
import { useBatchOnboardings, useBatch } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, GraduationCap, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BatchOnboardingPage() {
  const { id: mentorId, programId, batchId } = useParams();
  const navigate = useNavigate();
  const { data: batch } = useBatch(batchId!);
  const { data: onboardings, isLoading } = useBatchOnboardings(programId!, batchId!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enrolled Interns</h1>
        <p className="text-sm text-muted-foreground mt-1">{batch?.batchName || 'Batch'} · {onboardings?.length || 0} interns enrolled</p>
      </div>

      {onboardings && onboardings.length > 0 ? (
        <div className="space-y-3">
          {onboardings.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={o.intern?.image} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {o.intern?.firstName?.[0]}{o.intern?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{o.intern?.firstName} {o.intern?.lastName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{o.intern?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</span>
                    <Badge className={o.completed ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}>
                      {o.completed ? 'Completed' : `${o.progressPercentage}%`}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No interns enrolled in this batch.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
