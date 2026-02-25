import { useState, useMemo } from 'react';
import { useSchedules, useMentors } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/supervisor/DataTable';
import { StatCard } from '@/components/supervisor/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Video, Calendar, Clock, Users, VideoOff, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Schedule } from '@/lib/api/models';

export default function MeetingsPage() {
  const { data: schedules, isLoading } = useSchedules();
  const { data: mentors } = useMentors();
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();

  const meetingData = useMemo(() => {
    if (!schedules) return [];
    return schedules.map(s => {
      const now = new Date();
      const start = new Date(s.startTime);
      const end = new Date(s.endTime);
      const status = now < start ? 'scheduled' : now > end ? 'completed' : 'live';
      return { ...s, status };
    });
  }, [schedules]);

  const stats = useMemo(() => {
    return {
      total: meetingData.length,
      upcoming: meetingData.filter(m => m.status === 'scheduled').length,
      completed: meetingData.filter(m => m.status === 'completed').length,
      live: meetingData.filter(m => m.status === 'live').length,
    };
  }, [meetingData]);

  const statusColors: Record<string, string> = {
    scheduled: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    live: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'startTime',
      label: 'Date',
      sortable: true,
      render: (s: typeof meetingData[0]) => <span className="text-sm">{new Date(s.startTime).toLocaleDateString()}</span>,
    },
    {
      key: 'time',
      label: 'Time',
      render: (s: typeof meetingData[0]) => (
        <span className="text-sm">
          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
          {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (s: typeof meetingData[0]) => <Badge className={statusColors[s.status]}>{s.status}</Badge>,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage sessions.</p>
        </div>
        <Button className="gap-2 gradient-primary" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Schedule Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total" value={stats.total} icon={Video} delay={0} />
        <StatCard title="Upcoming" value={stats.upcoming} icon={Calendar} delay={0.1} />
        <StatCard title="Completed" value={stats.completed} icon={Clock} delay={0.2} />
        <StatCard title="Live Now" value={stats.live} icon={Users} delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={meetingData}
        searchPlaceholder="Search meetings..."
        emptyMessage="No meetings scheduled"
        emptyIcon={<VideoOff className="h-8 w-8" />}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>Create a new meeting session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input placeholder="Meeting title..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" /></div>
            </div>
            <div className="space-y-2"><Label>Duration (minutes)</Label><Input type="number" defaultValue="60" /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Meeting agenda..." rows={3} /></div>
            <Button className="w-full gradient-primary" onClick={() => { setShowCreate(false); toast({ title: 'Meeting scheduled' }); }}>
              Schedule Meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
