import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMentorProgram, useMentorBatches, useCreateMentorBatch } from '@/hooks/use-mentor-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Layers, Users, Calendar, MessageSquare, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function MentorProgramDetailPage() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { data: program, isLoading: pLoading } = useMentorProgram(programId!);
  const { data: batches, isLoading: bLoading } = useMentorBatches(programId!);
  const createBatch = useCreateMentorBatch();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ batchName: '', startDate: '', endDate: '' });

  const canCreateBatch = useMemo(() => {
    if (!program || !batches) return false;
    if (batches.length === 0) return true;
    if (program.type === 'one_time' && batches.length >= 1) return false;
    // Recurring: only if last batch is not active
    const lastBatch = batches[batches.length - 1];
    return !lastBatch.isActive;
  }, [program, batches]);

  const handleCreate = () => {
    if (!programId) return;
    createBatch.mutate({
      batchName: form.batchName, startDate: new Date(form.startDate), endDate: new Date(form.endDate), programId,
    }, { onSuccess: () => { setOpen(false); setForm({ batchName: '', startDate: '', endDate: '' }); } });
  };

  if (pLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 rounded-xl" /></div>;
  if (!program) return <p className="text-muted-foreground">Program not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/mentor/programs')}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{program.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{program.description || 'No description'}</p>
        </div>
        <Badge variant="outline">{program.type === 'recurring' ? 'Recurring' : 'One-Time'}</Badge>
        <Button variant="outline" onClick={() => navigate(`/mentor/programs/${programId}/chat`)}>
          <MessageSquare className="h-4 w-4 mr-2" />Messages
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Batches</h2>
        {canCreateBatch ? (
          <Button className="gradient-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Batch</Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            {program.type === 'one_time' ? 'One-time programs allow only one batch' : 'Complete the current batch before creating a new one'}
          </p>
        )}
      </div>

      {bLoading ? (
        <div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : batches?.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center"><Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground text-sm">No batches yet</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {batches?.map(b => (
            <Card key={b.id} className="glass-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/mentor/programs/${programId}/batches/${b.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{b.batchName}</h3>
                  <Badge className={b.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-muted text-muted-foreground'}>{b.isActive ? 'Active' : 'Completed'}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{b.onboarding?.length || 0} interns</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card">
          <DialogHeader><DialogTitle>Create Batch</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Batch Name</Label><Input value={form.batchName} onChange={e => setForm(f => ({ ...f, batchName: e.target.value }))} placeholder="e.g. Batch 1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <Button className="w-full gradient-primary" onClick={handleCreate} disabled={createBatch.isPending || !form.batchName}>
              {createBatch.isPending ? 'Creating...' : 'Create Batch'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
