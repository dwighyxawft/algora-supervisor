import { useParams, useNavigate } from 'react-router-dom';
import { useBatch, useHomeworks, useClassworks, useChallenges, useExams, useSchedules } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, Eye, BookOpen, ClipboardCheck, FileCode, Award, Calendar,
  Clock, Timer, Users, CheckCircle, AlertCircle, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Schedule, Homework, Classwork, Challenge, Exam } from '@/lib/api/models';

function CountdownOrDate({ date }: { date: Date }) {
  const d = new Date(date);
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return <span className="text-xs text-green-400">Completed</span>;
  if (diff > 7 * 86400000) return <span className="text-xs text-muted-foreground">{d.toLocaleDateString()}</span>;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return <span className="text-xs text-primary font-mono">{days}d {hours}h</span>;
}

export default function ProgramBatchDetailPage() {
  const { id: mentorId, programId, batchId } = useParams();
  const navigate = useNavigate();
  const { data: batch, isLoading } = useBatch(batchId!);
  const { data: allHomeworks } = useHomeworks();
  const { data: allClassworks } = useClassworks();
  const { data: allChallenges } = useChallenges();
  const { data: allExams } = useExams();
  const { data: allSchedules } = useSchedules();

  const [attendanceSchedule, setAttendanceSchedule] = useState<Schedule | null>(null);

  const schedules = useMemo(() => allSchedules?.filter(s => s.programBatchId === batchId) || [], [allSchedules, batchId]);
  const homeworks = useMemo(() => allHomeworks?.filter(h => schedules.some(s => s.id === h.scheduleId)) || [], [allHomeworks, schedules]);
  const classworks = useMemo(() => allClassworks?.filter(c => schedules.some(s => s.id === c.scheduleId)) || [], [allClassworks, schedules]);
  const challenges = useMemo(() => allChallenges?.filter(c => c.programId === programId) || [], [allChallenges, programId]);
  const exams = useMemo(() => allExams?.filter(e => e.programBatchId === batchId) || [], [allExams, batchId]);

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-32" /><Skeleton className="h-96 rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{batch?.batchName || 'Batch Details'}</h1>
        <p className="text-sm text-muted-foreground mt-1">Detailed view of batch schedules, assignments, and exams.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/50 flex-wrap">
          <TabsTrigger value="overview"><Eye className="h-3.5 w-3.5 mr-1.5" />Overview</TabsTrigger>
          <TabsTrigger value="schedules"><Calendar className="h-3.5 w-3.5 mr-1.5" />Schedules</TabsTrigger>
          <TabsTrigger value="homeworks"><ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />Homeworks</TabsTrigger>
          <TabsTrigger value="classworks"><FileCode className="h-3.5 w-3.5 mr-1.5" />Classworks</TabsTrigger>
          <TabsTrigger value="challenges"><Award className="h-3.5 w-3.5 mr-1.5" />Challenges</TabsTrigger>
          <TabsTrigger value="exams"><BookOpen className="h-3.5 w-3.5 mr-1.5" />Exams</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardContent className="p-5 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-[10px]">Start</p>
                  <p className="font-medium">{batch ? new Date(batch.startDate).toLocaleDateString() : '-'}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-[10px]">End</p>
                  <p className="font-medium">{batch ? new Date(batch.endDate).toLocaleDateString() : '-'}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-[10px]">Duration</p>
                  <p className="font-medium">{batch?.durationInWeeks || '-'} weeks</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-[10px]">Interns</p>
                  <p className="font-medium">{batch?.onboarding?.length || 0}</p>
                </div>
              </div>
              {batch?.outlines && batch.outlines.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Outlines</p>
                  {batch.outlines.map(o => (
                    <div key={o.id} className="bg-muted/20 rounded-lg p-3 mb-2">
                      <p className="text-sm font-medium">Week {o.weekNumber}: {o.title}</p>
                      {o.description && <p className="text-xs text-muted-foreground mt-1">{o.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SCHEDULES */}
        <TabsContent value="schedules" className="mt-4 space-y-3">
          {schedules.length > 0 ? schedules.map(s => {
            const isPast = new Date(s.endTime).getTime() < Date.now();
            const isSolo = s.solos && s.solos.length > 0;
            return (
              <Card key={s.id} className="glass-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{s.title}</p>
                      {isSolo && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">Solo</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(s.startTime).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPast ? (
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAttendanceSchedule(s)}>
                        <Users className="h-3 w-3" /> Attendance
                      </Button>
                    ) : (
                      <CountdownOrDate date={new Date(s.startTime)} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No schedules found.</p>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* HOMEWORKS */}
        <TabsContent value="homeworks" className="mt-4 space-y-3">
          {homeworks.length > 0 ? homeworks.map(h => (
            <Card key={h.id} className="glass-card cursor-pointer hover:border-primary/30" onClick={() => navigate(`/supervisor/mentors/${mentorId}/programs/${programId}/batches/${batchId}/homework/${h.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {new Date(h.dueAt).toLocaleDateString()} · {h.submissions?.length || 0} submissions</p>
                </div>
                <Badge className={h.isClosed ? 'bg-muted text-muted-foreground' : 'bg-green-500/10 text-green-400 border-green-500/20'}>
                  {h.isClosed ? 'Closed' : 'Open'}
                </Badge>
              </CardContent>
            </Card>
          )) : <EmptyState icon={ClipboardCheck} text="No homeworks assigned." />}
        </TabsContent>

        {/* CLASSWORKS */}
        <TabsContent value="classworks" className="mt-4 space-y-3">
          {classworks.length > 0 ? classworks.map(c => (
            <Card key={c.id} className="glass-card cursor-pointer hover:border-primary/30" onClick={() => navigate(`/supervisor/mentors/${mentorId}/programs/${programId}/batches/${batchId}/classwork/${c.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {new Date(c.dueAt).toLocaleDateString()} · {c.type} · {c.submissions?.length || 0} submissions</p>
                </div>
                <Badge className={c.isClosed ? 'bg-muted text-muted-foreground' : 'bg-green-500/10 text-green-400 border-green-500/20'}>
                  {c.isClosed ? 'Closed' : 'Open'}
                </Badge>
              </CardContent>
            </Card>
          )) : <EmptyState icon={FileCode} text="No classworks assigned." />}
        </TabsContent>

        {/* CHALLENGES */}
        <TabsContent value="challenges" className="mt-4 space-y-3">
          {challenges.length > 0 ? challenges.map(c => (
            <Card key={c.id} className="glass-card cursor-pointer hover:border-primary/30" onClick={() => navigate(`/supervisor/mentors/${mentorId}/programs/${programId}/batches/${batchId}/challenge/${c.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.submissions?.length || 0} submissions</p>
                </div>
                <Badge className={c.isClosed ? 'bg-muted text-muted-foreground' : 'bg-green-500/10 text-green-400 border-green-500/20'}>
                  {c.isClosed ? 'Closed' : 'Open'}
                </Badge>
              </CardContent>
            </Card>
          )) : <EmptyState icon={Award} text="No challenges assigned." />}
        </TabsContent>

        {/* EXAMS */}
        <TabsContent value="exams" className="mt-4 space-y-3">
          {exams.length > 0 ? exams.map(e => (
            <Card key={e.id} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{e.title}</p>
                  <Badge>{e.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {e.objective && e.objective.length > 0 && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/supervisor/mentors/${mentorId}/programs/${programId}/batches/${batchId}/exam/${e.id}/theory`)}>
                      <BookOpen className="h-3 w-3" /> Theory/Objective
                    </Button>
                  )}
                  {e.projectExam && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/supervisor/mentors/${mentorId}/programs/${programId}/batches/${batchId}/exam/${e.id}/project`)}>
                      <FileCode className="h-3 w-3" /> Project Exam
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )) : <EmptyState icon={BookOpen} text="No exams found." />}
        </TabsContent>
      </Tabs>

      {/* Attendance Modal */}
      <Dialog open={!!attendanceSchedule} onOpenChange={() => setAttendanceSchedule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance - {attendanceSchedule?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {attendanceSchedule?.sessionPresences && attendanceSchedule.sessionPresences.length > 0 ? attendanceSchedule.sessionPresences.map(sp => (
              <div key={sp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={sp.intern?.image} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{sp.intern?.firstName?.[0]}{sp.intern?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{sp.intern?.firstName} {sp.intern?.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={sp.status === 'present' ? 'bg-green-500/10 text-green-400' : sp.status === 'late' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-destructive/10 text-destructive'}>
                    {sp.status}
                  </Badge>
                  {sp.checkInTime && <span className="text-[10px] text-muted-foreground">{new Date(sp.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No attendance records.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<any>; text: string }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-8 text-center text-muted-foreground">
        <Icon className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">{text}</p>
      </CardContent>
    </Card>
  );
}
