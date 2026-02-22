import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/supervisor/DataTable';
import { StatCard } from '@/components/supervisor/StatCard';
import { Video, Plus, Calendar, Clock, Users, VideoOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const MOCK_MEETINGS = [
  { id: '1', title: 'Weekly Mentor Sync', mentors: ['John Doe', 'Jane Smith'], date: '2024-02-15', time: '10:00 AM', status: 'scheduled', duration: '60 min' },
  { id: '2', title: 'Performance Review - Mike J.', mentors: ['Mike Johnson'], date: '2024-02-14', time: '2:00 PM', status: 'completed', duration: '45 min' },
  { id: '3', title: 'Screening Follow-up', mentors: ['Sarah Wilson'], date: '2024-02-16', time: '11:00 AM', status: 'scheduled', duration: '30 min' },
  { id: '4', title: 'Mentor Onboarding', mentors: ['Alex Brown'], date: '2024-02-13', time: '9:00 AM', status: 'cancelled', duration: '90 min' },
];

export default function MeetingsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();

  const statusColors: Record<string, string> = {
    scheduled: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const columns = [
    { key: 'title', label: 'Meeting', sortable: true },
    { key: 'mentors', label: 'Participants', render: (m: any) => <span className="text-sm">{m.mentors.join(', ')}</span> },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'time', label: 'Time' },
    { key: 'duration', label: 'Duration' },
    { key: 'status', label: 'Status', render: (m: any) => <Badge className={statusColors[m.status]}>{m.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage mentor meetings.</p>
        </div>
        <Button className="gap-2 gradient-primary" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Meetings" value={MOCK_MEETINGS.length} icon={Video} delay={0} />
        <StatCard title="Upcoming" value={2} icon={Calendar} delay={0.1} />
        <StatCard title="Completed" value={1} icon={Clock} delay={0.2} />
        <StatCard title="Participants" value={5} icon={Users} delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={MOCK_MEETINGS}
        searchPlaceholder="Search meetings..."
        emptyMessage="No meetings scheduled"
        emptyIcon={<VideoOff className="h-8 w-8" />}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>Create a new meeting with mentors.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Meeting title..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Meeting agenda or notes..." rows={3} />
            </div>
            <Button
              className="w-full gradient-primary"
              onClick={() => { setShowCreate(false); toast({ title: 'Meeting scheduled' }); }}
            >
              Schedule Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
