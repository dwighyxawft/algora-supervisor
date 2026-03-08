import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentorAuth } from '@/contexts/MentorAuthContext';
import { useMentorPrograms } from '@/hooks/use-mentor-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

export default function MentorMessagesPage() {
  const { user } = useMentorAuth();
  const { data: programs, isLoading } = useMentorPrograms();
  const navigate = useNavigate();
  const myPrograms = useMemo(() => programs?.filter(p => p.mentorId === user?.id) || [], [programs, user]);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" />{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Messages</h1><p className="text-sm text-muted-foreground mt-1">Program group chats</p></div>
      {myPrograms.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center"><MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">No programs to chat in</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {myPrograms.map(p => (
            <Card key={p.id} className="glass-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/mentor/programs/${p.id}/chat`)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.onboarding?.length || 0} participants</p></div>
                <Button variant="outline" size="sm"><MessageSquare className="h-3.5 w-3.5 mr-1" />Open Chat</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
