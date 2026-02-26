import { useParams, useNavigate } from 'react-router-dom';
import { useMentor, useMentorWorkSamples, useMentorReviews } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, Globe, Github, Linkedin, Star, BookOpen, Code, MessageSquareWarning, Briefcase, Video, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: mentor, isLoading } = useMentor(id!);
  const { data: workSamples } = useMentorWorkSamples(id!);
  const { data: reviews } = useMentorReviews(id!);

  if (isLoading || !mentor) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to mentors
      </Button>

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
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <PhoneCall className="h-4 w-4" /> Audio Call
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Video className="h-4 w-4" /> Video Call
                  </Button>
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

      <Tabs defaultValue="programs">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="programs" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Programs</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5"><Star className="h-3.5 w-3.5" /> Reviews</TabsTrigger>
          <TabsTrigger value="screening" className="gap-1.5"><Code className="h-3.5 w-3.5" /> Screening</TabsTrigger>
          <TabsTrigger value="complaints" className="gap-1.5"><MessageSquareWarning className="h-3.5 w-3.5" /> Complaints</TabsTrigger>
          <TabsTrigger value="work" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Work Samples</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4 space-y-3">
          {mentor.programs && mentor.programs.length > 0 ? mentor.programs.map(p => (
            <Card key={p.id} className="glass-card cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/supervisor/programs/${p.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.type} · {p.isPublished ? 'Published' : 'Draft'}</p>
                </div>
                <Badge variant={p.isPublished ? 'default' : 'secondary'}>{p.isPublished ? 'Active' : 'Draft'}</Badge>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No programs assigned yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-3">
          {reviews && reviews.length > 0 ? reviews.map(r => (
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

        <TabsContent value="screening" className="mt-4 space-y-3">
          {mentor.screening ? (
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{mentor.screening.title}</h3>
                  <Badge>{mentor.screening.status.replace('_', ' ')}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Phase</p><p className="font-medium">{mentor.screening.currentPhase}/4</p></div>
                  <div><p className="text-muted-foreground text-xs">Assessment</p><p className={`font-medium ${mentor.screening.assessmentPassed ? 'text-green-400' : 'text-muted-foreground'}`}>{mentor.screening.assessmentPassed ? 'Passed' : 'Pending'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Code Interview</p><p className={`font-medium ${mentor.screening.codeInterviewPassed ? 'text-green-400' : 'text-muted-foreground'}`}>{mentor.screening.codeInterviewPassed ? 'Passed' : 'Pending'}</p></div>
                  <div><p className="text-muted-foreground text-xs">QBot</p><p className={`font-medium ${mentor.screening.qBotPassed ? 'text-green-400' : 'text-muted-foreground'}`}>{mentor.screening.qBotPassed ? 'Passed' : 'Pending'}</p></div>
                </div>
                <Button className="mt-4 gradient-primary" size="sm" onClick={() => navigate(`/supervisor/screening/${mentor.screening!.id}`)}>
                  View Screening Details
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Code className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No screening started for this mentor.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="complaints" className="mt-4 space-y-3">
          {mentor.complaints && mentor.complaints.length > 0 ? mentor.complaints.map(c => (
            <Card key={c.id} className="glass-card cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/supervisor/complaints/${c.id}`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.intern ? `By ${c.intern.firstName} ${c.intern.lastName}` : 'Intern'} · {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={c.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : c.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary border-primary/20'}>
                  {c.status}
                </Badge>
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

        <TabsContent value="work" className="mt-4 space-y-3">
          {workSamples && workSamples.length > 0 ? workSamples.map(w => (
            <Card key={w.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="text-xs text-muted-foreground">{w.description}</p>
                  </div>
                  {w.link && <Button variant="outline" size="sm" asChild><a href={w.link} target="_blank" rel="noreferrer">View</a></Button>}
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No work samples submitted.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
