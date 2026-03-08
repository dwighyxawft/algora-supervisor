import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentorAuth } from '@/contexts/MentorAuthContext';
import { useMentorPrograms, useCreateMentorProgram, useMentorCategories } from '@/hooks/use-mentor-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookOpen, Layers, Users } from 'lucide-react';
import { ProgramType } from '@/lib/api/models';

export default function MentorProgramListPage() {
  const { user } = useMentorAuth();
  const { data: programs, isLoading } = useMentorPrograms();
  const { data: categories } = useMentorCategories();
  const createMutation = useCreateMentorProgram();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'recurring' as string, categoryId: '', programPrice: '0', examPrice: '0' });

  const myPrograms = useMemo(() => programs?.filter(p => p.mentorId === user?.id) || [], [programs, user]);

  const handleCreate = () => {
    createMutation.mutate({
      title: form.title, description: form.description,
      type: form.type as ProgramType,
      categoryId: form.categoryId,
      programPrice: Number(form.programPrice), examPrice: Number(form.examPrice),
    }, { onSuccess: () => { setOpen(false); setForm({ title: '', description: '', type: 'recurring', categoryId: '', programPrice: '0', examPrice: '0' }); } });
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">My Programs</h1><p className="text-sm text-muted-foreground mt-1">Manage your teaching programs</p></div>
        <Button className="gradient-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Program</Button>
      </div>

      {myPrograms.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-16 text-center"><BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No programs yet. Create your first program!</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPrograms.map(p => (
            <Card key={p.id} className="glass-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/mentor/programs/${p.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm">{p.title}</h3>
                  <Badge variant="outline" className="text-[10px]">{p.type === 'recurring' ? 'Recurring' : 'One-Time'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{p.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{p.batches?.length || 0} batches</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{p.onboarding?.length || 0} interns</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card">
          <DialogHeader><DialogTitle>Create Program</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Program Name</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Full-Stack Web Development" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="recurring">Recurring</SelectItem><SelectItem value="one_time">One-Time</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Program Price</Label><Input type="number" value={form.programPrice} onChange={e => setForm(f => ({ ...f, programPrice: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Exam Price</Label><Input type="number" value={form.examPrice} onChange={e => setForm(f => ({ ...f, examPrice: e.target.value }))} /></div>
            </div>
            <Button className="w-full gradient-primary" onClick={handleCreate} disabled={createMutation.isPending || !form.title || !form.categoryId}>
              {createMutation.isPending ? 'Creating...' : 'Create Program'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
