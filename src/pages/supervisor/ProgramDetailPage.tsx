import { useParams, useNavigate } from 'react-router-dom';
import { useProgram, useProgramBatches } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgramDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: program, isLoading: programLoading } = useProgram(id!);
  const { data: batches, isLoading: batchesLoading } = useProgramBatches(id!);

  if (programLoading || batchesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground text-center py-12">Program not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{program.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{program.description || 'No description'}</p>
              </div>
              <Badge variant={program.isPublished ? 'default' : 'secondary'}>{program.isPublished ? 'Published' : 'Draft'}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Type</p><p className="font-medium capitalize">{program.type}</p></div>
              <div><p className="text-muted-foreground text-xs">Program Price</p><p className="font-medium">₦{program.programPrice?.toLocaleString()}</p></div>
              <div><p className="text-muted-foreground text-xs">Exam Price</p><p className="font-medium">₦{program.examPrice?.toLocaleString()}</p></div>
              <div><p className="text-muted-foreground text-xs">Batches</p><p className="font-medium">{batches?.length || 0}</p></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Program Batches</h2>
        <div className="space-y-3">
          {batches && batches.length > 0 ? batches.map(batch => (
            <motion.div key={batch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/supervisor/programs/${id}/batches/${batch.id}`)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{batch.batchName}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(batch.startDate).toLocaleDateString()} — {new Date(batch.endDate).toLocaleDateString()}</span>
                        {batch.durationInWeeks && <span>{batch.durationInWeeks} weeks</span>}
                      </div>
                    </div>
                  </div>
                  <Badge variant={batch.isActive ? 'default' : 'secondary'}>{batch.isActive ? 'Active' : 'Inactive'}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No batches created for this program yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
