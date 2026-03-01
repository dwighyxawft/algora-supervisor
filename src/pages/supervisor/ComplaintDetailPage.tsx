import { useParams, useNavigate } from 'react-router-dom';
import { useMentorComplaints, useUpdateMentorComplaint } from '@/hooks/use-api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Calendar, Paperclip, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { ComplaintStatus } from '@/lib/api/models';
import { useToast } from '@/hooks/use-toast';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: complaints, isLoading } = useMentorComplaints(user?.id || '');
  const updateMutation = useUpdateMentorComplaint();
  const [response, setResponse] = useState('');

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
    updateMutation.mutate({ id: complaint.id, data: { status } }, {
      onSuccess: () => toast({ title: `Complaint ${status}` }),
    });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Mentor</p>
                  <p className="text-sm font-medium">{complaint.mentor ? `${complaint.mentor.firstName} ${complaint.mentor.lastName}` : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Filed By (Intern)</p>
                  <p className="text-sm font-medium">{complaint.intern ? `${complaint.intern.firstName} ${complaint.intern.lastName}` : '—'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Filed on {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString()}
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{complaint.description}</p>
            </div>
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Paperclip className="h-3.5 w-3.5" /> Attachments ({complaint.attachments.length})</p>
                <div className="flex flex-wrap gap-2">
                  {complaint.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline bg-primary/5 px-2 py-1 rounded">
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
              <CardTitle className="text-sm font-medium">Supervisor Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Response Notes (optional)</Label>
                <Textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Add your review notes..." rows={3} />
              </div>
              <div className="flex gap-3">
                <Button
                  className="gradient-primary gap-2"
                  disabled={updateMutation.isPending}
                  onClick={() => handleStatusChange('resolved' as ComplaintStatus)}
                >
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Resolve Complaint
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  disabled={updateMutation.isPending}
                  onClick={() => handleStatusChange('rejected' as ComplaintStatus)}
                >
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Reject Complaint
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={() => toast({ title: 'Escalated to Root', description: 'This complaint has been escalated to root management.' })}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Escalate to Root
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
