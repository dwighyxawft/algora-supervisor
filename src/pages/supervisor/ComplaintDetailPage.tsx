import { useParams, useNavigate } from 'react-router-dom';
import { useMentorComplaints, useUpdateMentorComplaint } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Calendar, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { ComplaintStatus } from '@/lib/api/models';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: complaints, isLoading } = useMentorComplaints(user?.id || '');
  const updateMutation = useUpdateMentorComplaint();

  const complaint = useMemo(() => complaints?.find(c => c.id === id), [complaints, id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground text-center py-12">Complaint not found.</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-primary/10 text-primary border-primary/20',
    resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const handleStatusChange = (status: ComplaintStatus) => {
    updateMutation.mutate({ id: complaint.id, data: { status } });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to complaints
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{complaint.title}</CardTitle>
              <Badge className={statusColors[complaint.status] || ''}>{complaint.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Mentor: {complaint.mentor ? `${complaint.mentor.firstName} ${complaint.mentor.lastName}` : '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Filed by: {complaint.intern ? `${complaint.intern.firstName} ${complaint.intern.lastName}` : '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{complaint.description}</p>
            </div>
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Paperclip className="h-3.5 w-3.5" /> Attachments</p>
                <div className="flex flex-wrap gap-2">
                  {complaint.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">
                      Attachment {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {complaint.status === 'pending' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                className="gradient-primary"
                disabled={updateMutation.isPending}
                onClick={() => handleStatusChange('resolved' as ComplaintStatus)}
              >
                Resolve Complaint
              </Button>
              <Button
                variant="destructive"
                disabled={updateMutation.isPending}
                onClick={() => handleStatusChange('rejected' as ComplaintStatus)}
              >
                Reject Complaint
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
