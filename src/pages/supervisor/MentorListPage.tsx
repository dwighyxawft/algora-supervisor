import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/supervisor/DataTable';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import type { Mentor } from '@/lib/api/models';

const MOCK_MENTORS: (Mentor & { performanceScore?: number })[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@algora.io', gender: 'male' as any, dateOfBirth: new Date(), isEmailVerified: true, country: 'USA', stateOrProvince: 'CA', performanceScore: 92, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@algora.io', gender: 'female' as any, dateOfBirth: new Date(), isEmailVerified: true, country: 'UK', stateOrProvince: 'London', performanceScore: 88, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@algora.io', gender: 'male' as any, dateOfBirth: new Date(), isEmailVerified: false, country: 'Canada', stateOrProvince: 'ON', performanceScore: 75, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@algora.io', gender: 'female' as any, dateOfBirth: new Date(), isEmailVerified: true, country: 'Nigeria', stateOrProvince: 'Lagos', performanceScore: 95, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', firstName: 'Alex', lastName: 'Brown', email: 'alex@algora.io', gender: 'male' as any, dateOfBirth: new Date(), isEmailVerified: true, country: 'Germany', stateOrProvince: 'Berlin', performanceScore: 81, createdAt: new Date(), updatedAt: new Date() },
];

export default function MentorListPage() {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'name',
      label: 'Mentor',
      render: (m: any) => (
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
    { key: 'country', label: 'Location', render: (m: any) => <span className="text-sm">{m.stateOrProvince}, {m.country}</span> },
    {
      key: 'isEmailVerified',
      label: 'Status',
      render: (m: any) => (
        <Badge variant={m.isEmailVerified ? 'default' : 'secondary'} className={m.isEmailVerified ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}>
          {m.isEmailVerified ? 'Verified' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'performanceScore',
      label: 'Performance',
      sortable: true,
      render: (m: any) => {
        const score = m.performanceScore;
        const color = score >= 90 ? 'text-green-400' : score >= 80 ? 'text-accent' : score >= 70 ? 'text-yellow-400' : 'text-destructive';
        return <span className={`text-sm font-semibold ${color}`}>{score}%</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentors</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor your assigned mentors.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_MENTORS}
        searchPlaceholder="Search mentors..."
        onRowClick={(m) => navigate(`/supervisor/mentors/${m.id}`)}
        emptyMessage="No mentors assigned yet"
        emptyIcon={<Users className="h-8 w-8" />}
      />
    </div>
  );
}
