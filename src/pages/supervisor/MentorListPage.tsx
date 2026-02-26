import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSupervisorMentors } from '@/hooks/use-api';
import { DataTable } from '@/components/supervisor/DataTable';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import type { Mentor } from '@/lib/api/models';

export default function MentorListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: mentors, isLoading } = useSupervisorMentors(user?.id || '');

  const columns = [
    {
      key: 'name',
      label: 'Mentor',
      render: (m: Mentor) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={m.image} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {m.firstName[0]}{m.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
            <p className="text-xs text-muted-foreground">{m.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'country', label: 'Location', render: (m: Mentor) => <span className="text-sm">{m.stateOrProvince}, {m.country}</span> },
    {
      key: 'isEmailVerified',
      label: 'Status',
      render: (m: Mentor) => (
        <Badge variant={m.isEmailVerified ? 'default' : 'secondary'} className={m.isEmailVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
          {m.isEmailVerified ? 'Verified' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'screening',
      label: 'Screening',
      render: (m: Mentor) => {
        const status = m.screening?.status;
        if (!status) return <span className="text-xs text-muted-foreground">Not Started</span>;
        const colors: Record<string, string> = {
          COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
          IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
          FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
          NOT_STARTED: 'bg-muted text-muted-foreground',
        };
        return <Badge className={colors[status] || ''}>{status.replace('_', ' ')}</Badge>;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Mentors</h1>
        <p className="text-sm text-muted-foreground mt-1">Mentors assigned to you for management and oversight.</p>
      </div>

      <DataTable
        columns={columns}
        data={mentors || []}
        searchPlaceholder="Search mentors..."
        onRowClick={(m) => navigate(`/supervisor/mentors/${m.id}`)}
        emptyMessage="No mentors assigned yet"
        emptyIcon={<Users className="h-8 w-8" />}
      />
    </div>
  );
}
