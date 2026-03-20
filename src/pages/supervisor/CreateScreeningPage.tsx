import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateScreening, useSupervisorMentors } from '@/hooks/use-api';
import { ScreeningStatus } from '@/lib/api/models';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CreateScreeningDto } from '@/lib/api/dto';

const STEPS = ['Basic Info', 'Select Mentor', 'Assessment Config', 'Review & Create'];

export default function CreateScreeningPage() {
  const [searchParams] = useSearchParams();
  const preselectedMentorId = searchParams.get('mentorId') || '';

  const [step, setStep] = useState(preselectedMentorId ? 0 : 0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mentorId, setMentorId] = useState(preselectedMentorId);
  const [assessmentRetries, setAssessmentRetries] = useState('0');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: mentors } = useSupervisorMentors(user?.id || '');
  const createScreening = useCreateScreening();

  // Only show mentors who have NOT been screened
  const unscreenedMentors = useMemo(() =>
    mentors?.filter(m => !m.screening) || [],
  [mentors]);

  // If preselected mentor is valid, auto-set it
  useEffect(() => {
    if (preselectedMentorId && mentors) {
      const found = unscreenedMentors.find(m => m.id === preselectedMentorId);
      if (found) {
        setMentorId(preselectedMentorId);
      }
    }
  }, [preselectedMentorId, mentors, unscreenedMentors]);

  const handleSubmit = () => {
    if (!user) return;
    const dto: CreateScreeningDto = {
      supervisor_id: user.id,
      mentor_id: mentorId,
      title,
      description,
      status: ScreeningStatus.NOT_STARTED,
      currentPhase: 0,
      assessmentRetries: parseInt(assessmentRetries) || 2,
    };
    createScreening.mutate(dto, {
      onSuccess: () => navigate('/supervisor/screening'),
    });
  };

  const selectedMentor = unscreenedMentors.find(m => m.id === mentorId) ||
    mentors?.find(m => m.id === mentorId);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Screening</h1>
        <p className="text-sm text-muted-foreground mt-1">Set up a screening test for an unscreened mentor.</p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <CheckCircle className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {step === 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set the screening title and description.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. React Developer Screening" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the screening purpose..." rows={4} />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Select Mentor</CardTitle>
                <CardDescription>Choose an unscreened mentor assigned to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {unscreenedMentors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">All your mentors have already been screened.</p>
                ) : (
                  <div className="space-y-2">
                    <Label>Mentor</Label>
                    <Select value={mentorId} onValueChange={setMentorId}>
                      <SelectTrigger><SelectValue placeholder="Select a mentor..." /></SelectTrigger>
                      <SelectContent>
                        {unscreenedMentors.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {selectedMentor && (
                  <div className="p-3 rounded-lg bg-muted/30 text-sm">
                    <p className="font-medium">{selectedMentor.firstName} {selectedMentor.lastName}</p>
                    <p className="text-muted-foreground text-xs">{selectedMentor.email} · {selectedMentor.country}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Assessment Configuration</CardTitle>
                <CardDescription>Configure retry limits and grading rules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Assessment Retries Allowed</Label>
                  <Input type="number" value={assessmentRetries} onChange={e => setAssessmentRetries(e.target.value)} min="0" max="5" />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Review & Create</CardTitle>
                <CardDescription>Review the screening details before creating.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground text-xs">Title</p><p className="font-medium">{title || '—'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Mentor</p><p className="font-medium">{selectedMentor ? `${selectedMentor.firstName} ${selectedMentor.lastName}` : '—'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Description</p><p className="font-medium">{description || '—'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Retries</p><p className="font-medium">{assessmentRetries}</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} className="gradient-primary">
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gradient-primary" disabled={createScreening.isPending || !title || !mentorId}>
            {createScreening.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <CheckCircle className="h-4 w-4 mr-2" /> Create Screening
          </Button>
        )}
      </div>
    </div>
  );
}
