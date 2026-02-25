import { useParams, useNavigate } from 'react-router-dom';
import { useComplaint, useUpdateComplaint } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Mail, Calendar, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: complaint, isLoading } = useComplaint(id!);
  const updateMutation = useUpdateComplaint();
  const [response, setResponse] = useState('');

  if (isLoading || !complaint) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const handleResolve = (status: 'open' | 'closed') => {
    updateMutation.mutate({
      id: complaint.id,
      data: { response, status },
    });
  };

  const from = complaint.intern
    ? `Intern — ${complaint.intern.firstName} ${complaint.intern.lastName}`
    : complaint.mentor
      ? `Mentor — ${complaint.mentor.firstName} ${complaint.mentor.lastName}`
      : 'Unknown';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to complaints
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{complaint.subject}</CardTitle>
              <Badge className={complaint.status === 'closed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}>
                {complaint.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{from}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{complaint.message}</p>
            </div>
            {complaint.attachment && complaint.attachment.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1.5"><Paperclip className="h-3.5 w-3.5" /> Attachments</Label>
                <div className="flex flex-wrap gap-2">
                  {complaint.attachment.map((url, i) => (
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

      {complaint.response && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Previous Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{complaint.response}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Respond to Complaint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={response}
              onChange={e => setResponse(e.target.value)}
              placeholder="Write your response or investigation notes..."
              rows={4}
            />
            <div className="flex gap-3">
              <Button
                className="gradient-primary"
                disabled={updateMutation.isPending || !response.trim()}
                onClick={() => handleResolve('closed')}
              >
                Resolve & Close
              </Button>
              <Button
                variant="outline"
                disabled={updateMutation.isPending || !response.trim()}
                onClick={() => handleResolve('open')}
              >
                Respond (Keep Open)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
