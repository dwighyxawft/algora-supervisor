import { useParams, useNavigate } from 'react-router-dom';
import { useProgram, useProgramBatches, useProgramOnboardings } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Users, Eye, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorProgramBatchesPage() {
  const { id: mentorId, programId } = useParams();
  const navigate = useNavigate();
  const { data: program, isLoading: pL } = useProgram(programId!);
  const { data: batches, isLoading: bL } = useProgramBatches(programId!);

  if (pL || bL) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/supervisor/mentors/${mentorId}`)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to mentor
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{program?.title || 'Program'}</h1>
        <p className="text-sm text-muted-foreground mt-1">{program?.description || 'Program batches overview'}</p>
      </div>

      {batches && batches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {batches.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{b.batchName}</p>
                    <Badge className={b.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-muted text-muted-foreground'}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-muted/30 rounded-lg p-2">
                      <Calendar className="h-3 w-3 mx-auto mb-1 text-primary" />
                      <p className="font-medium">{new Date(b.startDate).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">Start</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2">
                      <Calendar className="h-3 w-3 mx-auto mb-1 text-primary" />
                      <p className="font-medium">{new Date(b.endDate).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">End</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2">
                      <Users className="h-3 w-3 mx-auto mb-1 text-primary" />
                      <p className="font-medium">{b.onboarding?.length || 0}</p>
                      <p className="text-muted-foreground">Interns</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => navigate(`/supervisor/mentors/${mentorId}/programs/${programId}/batches/${b.id}`)}>
                      <Eye className="h-3 w-3" /> Batch Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => navigate(`/supervisor/mentors/${mentorId}/programs/${programId}/batches/${b.id}/onboarding`)}>
                      <GraduationCap className="h-3 w-3" /> Onboarding
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No batches found for this program.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
