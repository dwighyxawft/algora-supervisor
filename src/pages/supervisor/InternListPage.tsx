import { useNavigate } from 'react-router-dom';
import { useInterns } from '@/hooks/use-api';
import { DataTable } from '@/components/supervisor/DataTable';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap } from 'lucide-react';
import type { Intern } from '@/lib/api/models';

export default function InternListPage() {
  const navigate = useNavigate();
  const { data: interns, isLoading } = useInterns();

  const columns = [
    {
      key: 'name',
      label: 'Intern',
      render: (i: Intern) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={i.image} />
            <AvatarFallback className="bg-accent/20 text-accent text-xs">
              {i.firstName?.[0]}{i.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{i.firstName} {i.lastName}</p>
            <p className="text-xs text-muted-foreground">{i.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'verified',
      label: 'Status',
      render: (i: Intern) => (
        <Badge variant={i.verified ? 'default' : 'secondary'} className={i.verified ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
          {i.verified ? 'Verified' : 'Unverified'}
        </Badge>
      ),
    },
    {
      key: 'programs',
      label: 'Programs',
      render: (i: Intern) => <span className="text-sm">{i.programs?.length ?? 0} enrolled</span>,
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (i: Intern) => <span className="text-sm text-muted-foreground">{new Date(i.createdAt).toLocaleDateString()}</span>,
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
        <h1 className="text-2xl font-bold tracking-tight">Interns</h1>
        <p className="text-sm text-muted-foreground mt-1">View and monitor all interns on the platform.</p>
      </div>

      <DataTable
        columns={columns}
        data={interns || []}
        searchPlaceholder="Search interns..."
        onRowClick={(i) => navigate(`/supervisor/interns/${i.id}`)}
        emptyMessage="No interns found"
        emptyIcon={<GraduationCap className="h-8 w-8" />}
      />
    </div>
  );
}
