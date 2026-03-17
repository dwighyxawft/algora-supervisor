import { useParams, useNavigate } from 'react-router-dom';
import { useMentor, useMentorWorkSamples, useMentorReviews, useMentorComplaints } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/supervisor/StatCard';
import {
  ArrowLeft, Mail, Phone, Globe, Github, Linkedin, Star, BookOpen,
  MessageSquareWarning, Eye, Users, GraduationCap, ClipboardCheck,
  FileCode, Award, Plus, ExternalLink, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Program, MentorComplaint, MentorReview } from '@/lib/api/models';

export default function MentorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: mentor, isLoading } = useMentor(id!);
  const { data: reviews } = useMentorReviews(id!);
  const { data: allComplaints } = useMentorComplaints(user?.id || '');

  const mentorComplaints = useMemo(() =>
    allComplaints?.filter(c => c.mentorId === id) || [],
  [allComplaints, id]);

  if (isLoading || !mentor) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const programCount = mentor.programs?.length || 0;
  const batchCount = mentor.programs?.reduce((s, p) => s + (p.batches?.length || 0), 0) || 0;
  const internCount = mentor.programs?.reduce((s, p) => s + (p.onboarding?.length || 0), 0) || 0;
  const homeworkCount = mentor.homeworks?.length || 0;
  const classworkCount = mentor.classworks?.length || 0;
  const challengeCount = mentor.challenges?.length || 0;
  const examCount = mentor.exams?.length || 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/supervisor/mentors')} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to mentors
      </Button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={mentor.image} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {mentor.firstName[0]}{mentor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{mentor.firstName} {mentor.lastName}</h1>
                  <Badge className={mentor.isEmailVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}>
                    {mentor.isEmailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                  {avgRating && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {avgRating}/5
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl">{mentor.bio || 'No bio provided.'}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{mentor.email}</span>
                  {mentor.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{mentor.phoneNumber}</span>}
                  {mentor.country && <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{mentor.stateOrProvince}, {mentor.country}</span>}
                </div>
                <div className="flex gap-2">
                  {mentor.githubUrl && (
                    <Button variant="outline" size="sm" asChild><a href={mentor.githubUrl} target="_blank" rel="noreferrer"><Github className="h-4 w-4" /></a></Button>
                  )}
                  {mentor.linkedinUrl && (
                    <Button variant="outline" size="sm" asChild><a href={mentor.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin className="h-4 w-4" /></a></Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/50 flex-wrap">
          <TabsTrigger value="overview" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="programs" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Programs</TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5"><Award className="h-3.5 w-3.5" /> Performance</TabsTrigger>
          <TabsTrigger value="complaints" className="gap-1.5"><MessageSquareWarning className="h-3.5 w-3.5" /> Complaints</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5"><Star className="h-3.5 w-3.5" /> Reviews</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Programs" value={programCount} icon={BookOpen} delay={0} />
            <StatCard title="Batches" value={batchCount} icon={Users} delay={0.1} />
            <StatCard title="Interns" value={internCount} icon={GraduationCap} delay={0.2} />
            <StatCard title="Reviews" value={reviews?.length || 0} icon={Star} delay={0.3} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Homeworks" value={homeworkCount} icon={ClipboardCheck} delay={0.4} />
            <StatCard title="Classworks" value={classworkCount} icon={FileCode} delay={0.5} />
            <StatCard title="Challenges" value={challengeCount} icon={Award} delay={0.6} />
            <StatCard title="Exams" value={examCount} icon={BookOpen} delay={0.7} />
          </div>
          {/* Screening summary */}
          {mentor.screening && (
            <Card className="glass-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Screening Status</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Badge>{mentor.screening.status.replace('_', ' ')}</Badge>
                  <span className="text-xs text-muted-foreground">Phase {mentor.screening.currentPhase}/4</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {[
                    { label: 'Assessment', passed: mentor.screening.assessmentPassed },
                    { label: 'Code Interview', passed: mentor.screening.codeInterviewPassed },
                    { label: 'QBot', passed: mentor.screening.qBotPassed },
                    { label: 'Review', passed: mentor.screening.reviewCompleted },
                  ].map(ph => (
                    <div key={ph.label} className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">{ph.label}</p>
                      <p className={`text-sm font-semibold ${ph.passed ? 'text-green-400' : 'text-muted-foreground'}`}>
                        {ph.passed ? 'Passed' : 'Pending'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PROGRAMS TAB */}
        <TabsContent value="programs" className="mt-4 space-y-3">
          {mentor.programs && mentor.programs.length > 0 ? mentor.programs.map(p => (
            <Card key={p.id} className="glass-card cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/supervisor/mentors/${id}/programs/${p.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.type} · {p.batches?.length || 0} batches</p>
                  {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{p.batches?.length || 0} Batches</Badge>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="h-3 w-3" /> View Batches
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No programs created by this mentor.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PERFORMANCE TAB */}
        <TabsContent value="performance" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Exam Pass Rates by Program & Batch</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {mentor.programs && mentor.programs.length > 0 ? mentor.programs.map(p => (
                <div key={p.id} className="space-y-2">
                  <p className="font-medium text-sm">{p.title}</p>
                  {p.batches && p.batches.length > 0 ? p.batches.map(b => {
                    const totalInterns = b.onboarding?.length || 0;
                    const passedExam = b.exam?.examAttendance?.filter(ea => ea.isCompleted).length || 0;
                    return (
                      <div key={b.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                        <span className="text-xs">{b.batchName}</span>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-muted-foreground">{totalInterns} interns</span>
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{passedExam} passed</Badge>
                        </div>
                      </div>
                    );
                  }) : <p className="text-xs text-muted-foreground pl-3">No batches</p>}
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No performance data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPLAINTS TAB */}
        <TabsContent value="complaints" className="mt-4 space-y-3">
          {mentorComplaints.length > 0 ? mentorComplaints.map((c: MentorComplaint) => (
            <Card key={c.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{c.title}</p>
                  <Badge className={c.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : c.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary border-primary/20'}>
                    {c.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {c.intern ? `By ${c.intern.firstName} ${c.intern.lastName}` : 'Intern'} · {new Date(c.createdAt).toLocaleDateString()}
                </p>
                {c.description && <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <MessageSquareWarning className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No complaints filed against this mentor.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews" className="mt-4 space-y-3">
          {reviews && reviews.length > 0 ? reviews.map((r: MentorReview) => (
            <Card key={r.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {r.intern ? `${r.intern.firstName} ${r.intern.lastName}` : 'Intern'}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Star className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No reviews yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
