import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, Globe, Github, Linkedin, Star, BookOpen, Code, MessageSquareWarning } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const mentor = {
    id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@algora.io',
    phoneNumber: '+1 234 567 890',
    country: 'USA',
    stateOrProvince: 'California',
    bio: 'Senior software engineer with 8+ years experience in full-stack development. Passionate about mentoring the next generation of developers.',
    image: '',
    isEmailVerified: true,
    portfolioUrl: 'https://johndoe.dev',
    githubUrl: 'https://github.com/johndoe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    performanceScore: 92,
    programs: [
      { id: '1', title: 'React Fundamentals', status: 'Active', interns: 12 },
      { id: '2', title: 'Node.js Backend', status: 'Completed', interns: 8 },
    ],
    complaints: [
      { id: '1', subject: 'Late to sessions', status: 'resolved', date: '2024-01-15' },
    ],
    reviews: [
      { id: '1', rating: 4.5, comment: 'Excellent teaching methods', date: '2024-02-01' },
      { id: '2', rating: 4.8, comment: 'Very patient and thorough', date: '2024-01-20' },
    ],
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to mentors
      </Button>

      {/* Profile header */}
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
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Verified</Badge>
                  <Badge variant="outline">{mentor.performanceScore}% Performance</Badge>
                </div>
                <p className="text-sm text-muted-foreground max-w-2xl">{mentor.bio}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{mentor.email}</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{mentor.phoneNumber}</span>
                  <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{mentor.stateOrProvince}, {mentor.country}</span>
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
      <Tabs defaultValue="programs">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="programs" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Programs</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5"><Star className="h-3.5 w-3.5" /> Reviews</TabsTrigger>
          <TabsTrigger value="complaints" className="gap-1.5"><MessageSquareWarning className="h-3.5 w-3.5" /> Complaints</TabsTrigger>
          <TabsTrigger value="code" className="gap-1.5"><Code className="h-3.5 w-3.5" /> Code Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4 space-y-3">
          {mentor.programs.map(p => (
            <Card key={p.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.interns} enrolled interns</p>
                </div>
                <Badge variant={p.status === 'Active' ? 'default' : 'secondary'}>{p.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4 space-y-3">
          {mentor.reviews.map(r => (
            <Card key={r.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-sm">{r.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <p className="text-sm">{r.comment}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="complaints" className="mt-4 space-y-3">
          {mentor.complaints.map(c => (
            <Card key={c.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">{c.date}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{c.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <Card className="glass-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Code className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Code submissions will be viewable in the text editor workspace.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
