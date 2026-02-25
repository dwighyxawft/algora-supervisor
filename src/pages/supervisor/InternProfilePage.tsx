import { useParams, useNavigate } from 'react-router-dom';
import { useIntern, useInternOnboardings } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, BookOpen, FileText, Code, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InternProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: intern, isLoading } = useIntern(id!);
  const { data: onboardings } = useInternOnboardings(id!);

  if (isLoading || !intern) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to interns
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={intern.image} />
                <AvatarFallback className="bg-accent/20 text-accent text-xl">
                  {intern.firstName?.[0]}{intern.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{intern.firstName} {intern.lastName}</h1>
                  <Badge className={intern.verified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}>
                    {intern.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{intern.bio || 'No bio provided.'}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{intern.email}</span>
                  {intern.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{intern.phoneNumber}</span>}
                  {intern.gender && <span className="capitalize">{intern.gender}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="programs">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="programs" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Programs</TabsTrigger>
          <TabsTrigger value="submissions" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Submissions</TabsTrigger>
          <TabsTrigger value="challenges" className="gap-1.5"><Code className="h-3.5 w-3.5" /> Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4 space-y-3">
          {onboardings && onboardings.length > 0 ? onboardings.map(o => (
            <Card key={o.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{o.program?.title || 'Program'}</p>
                  <p className="text-xs text-muted-foreground">
                    Progress: {o.progressPercentage}% · {o.completed ? 'Completed' : 'In Progress'}
                    {o.passed && ' · Passed'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={o.fullyPaid ? 'default' : 'secondary'} className={o.fullyPaid ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
                    {o.fullyPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                  <Badge variant={o.completed ? 'default' : 'outline'}>{o.completed ? 'Done' : 'Active'}</Badge>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No program enrollments found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="mt-4 space-y-3">
          {intern.classworkSubmissions && intern.classworkSubmissions.length > 0 ? intern.classworkSubmissions.map(s => (
            <Card key={s.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.classwork?.title || 'Classwork Submission'}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.isGraded ? `Score: ${s.score}` : 'Not graded'} · {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={s.isGraded ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
                  {s.isGraded ? 'Graded' : 'Pending'}
                </Badge>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No submissions yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="mt-4 space-y-3">
          {intern.challengeSubmissions && intern.challengeSubmissions.length > 0 ? intern.challengeSubmissions.map(c => (
            <Card key={c.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.challenge?.title || 'Challenge'}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.isGraded ? `Score: ${c.score} · XP: ${c.earnedXp}` : 'Not graded'} · {c.language || 'N/A'}
                  </p>
                </div>
                <Badge className={c.isGraded ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
                  {c.isGraded ? 'Graded' : 'Pending'}
                </Badge>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Code className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No challenge submissions.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
