import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useScreening, useCreateAssessment } from '@/hooks/use-api';
import { AssessmentType, AssessmentStatus } from '@/lib/api/models';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import type { CreateAssessmentDto } from '@/lib/api/dto';

export default function CreateAssessmentPage() {
  const { screeningId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: screening } = useScreening(screeningId!);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssessmentType>(AssessmentType.OBJECTIVE);
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [scorePerQuestion, setScorePerQuestion] = useState('10');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [creating, setCreating] = useState(false);

  const createAssessment = useCreateAssessment();

  const handleCreateAssessment = async () => {
    if (!screening || !user) return;
    setCreating(true);
    try {
      const dto: CreateAssessmentDto = {
        screening_id: screeningId!,
        mentor_id: screening.mentor_id,
        title,
        description,
        type,
        status: AssessmentStatus.PENDING,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        durationMinutes: parseInt(durationMinutes),
        scorePerQuestion: parseInt(scorePerQuestion),
      };
      const assessment = await createAssessment.mutateAsync(dto);
      toast({ title: 'Assessment created! Redirecting to add questions.' });
      navigate(`/supervisor/screening/${screeningId}/assessment/${assessment.id}`);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Screening
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build a screening assessment for {screening?.mentor ? `${screening.mentor.firstName} ${screening.mentor.lastName}` : 'mentor'}
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Assessment Configuration</CardTitle>
            <CardDescription>Define the assessment type, duration, and schedule. The backend will automatically create the corresponding objective or theory assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. React Fundamentals Assessment" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={v => setType(v as AssessmentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AssessmentType.OBJECTIVE}>Objective (Multiple Choice)</SelectItem>
                    <SelectItem value={AssessmentType.THEORY}>Theory (Written)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Assessment description..." rows={3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} min="5" max="180" />
              </div>
              <div className="space-y-2">
                <Label>Score per Question</Label>
                <Input type="number" value={scorePerQuestion} onChange={e => setScorePerQuestion(e.target.value)} min="1" />
              </div>
              <div />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date & Time</Label>
                <Input type="datetime-local" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <Input type="datetime-local" value={endDateTime} onChange={e => setEndDateTime(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleCreateAssessment} className="gradient-primary" disabled={creating || !title || !startDateTime || !endDateTime}>
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                Create Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
