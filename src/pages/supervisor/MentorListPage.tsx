import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupervisorMentors } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Users, Search, BookOpen, GraduationCap, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import type { Mentor } from '@/lib/api/models';

export default function MentorListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: mentors, isLoading } = useSupervisorMentors(user?.id || '');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!mentors) return [];
    if (!search) return mentors;
    const q = search.toLowerCase();
    return mentors.filter(m =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  }, [mentors, search]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const getProgramCount = (m: Mentor) => m.programs?.length || 0;
  const getBatchCount = (m: Mentor) => m.programs?.reduce((sum, p) => sum + (p.batches?.length || 0), 0) || 0;
  const getInternCount = (m: Mentor) => m.programs?.reduce((sum, p) => sum + (p.onboarding?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Mentors</h1>
          <p className="text-sm text-muted-foreground mt-1">Mentors assigned to you for management and oversight.</p>
        </div>
        <Badge variant="outline" className="text-sm gap-1.5">
          <Users className="h-3.5 w-3.5" /> {mentors?.length || 0} Mentors
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search mentors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-muted/50 border-transparent focus:border-primary/30" />
      </div>

      {filtered.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No mentors found</p>
            <p className="text-sm mt-1">No mentors match your search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card hover:border-primary/30 transition-all duration-200">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={m.image} />
                      <AvatarFallback className="bg-primary/10 text-primary">{m.firstName[0]}{m.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{m.firstName} {m.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                      <Badge className={`mt-1 text-[10px] ${m.isEmailVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {m.isEmailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/30 rounded-lg p-2">
                      <BookOpen className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                      <p className="text-sm font-bold">{getProgramCount(m)}</p>
                      <p className="text-[10px] text-muted-foreground">Programs</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2">
                      <Users className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                      <p className="text-sm font-bold">{getBatchCount(m)}</p>
                      <p className="text-[10px] text-muted-foreground">Batches</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2">
                      <GraduationCap className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                      <p className="text-sm font-bold">{getInternCount(m)}</p>
                      <p className="text-[10px] text-muted-foreground">Interns</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => navigate(`/supervisor/mentors/${m.id}`)}>
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
