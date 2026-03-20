import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useScreening, useCreateAssessment, useCreateObjectiveQuestion, useCreateTheoryQuestion, useReadyAssessment, useGenerateObjectiveQuestions, useGenerateTheoryQuestions } from '@/hooks/use-api';
import { AssessmentType, AssessmentStatus } from '@/lib/api/models';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Plus, Trash2, Sparkles, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import type { CreateAssessmentDto, CreateObjectiveAssessmentDto, CreateTheoryAssessmentQuestionDto } from '@/lib/api/dto';

const STEPS = ['Assessment Details', 'Create Questions', 'Preview & Publish'];

interface ObjectiveQ {
  text: string;
  option_1: { text: string; tag: number };
  option_2: { text: string; tag: number };
  option_3: { text: string; tag: number };
  option_4: { text: string; tag: number };
  correctOption: number;
}

interface TheoryQ {
  text: string;
  correctAnswerText: string;
}

export default function CreateAssessmentPage() {
  const { screeningId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: screening } = useScreening(screeningId!);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssessmentType>(AssessmentType.OBJECTIVE);
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [scorePerQuestion, setScorePerQuestion] = useState('10');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  // Questions
  const [objectiveQuestions, setObjectiveQuestions] = useState<ObjectiveQ[]>([]);
  const [theoryQuestions, setTheoryQuestions] = useState<TheoryQ[]>([]);

  // Created assessment reference
  const [createdAssessmentId, setCreatedAssessmentId] = useState<string | null>(null);

  const createAssessment = useCreateAssessment();
  const createObjectiveQuestion = useCreateObjectiveQuestion();
  const createTheoryQuestion = useCreateTheoryQuestion();
  const readyAssessment = useReadyAssessment();
  const generateObjective = useGenerateObjectiveQuestions();
  const generateTheory = useGenerateTheoryQuestions();

  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const addObjectiveQuestion = () => {
    setObjectiveQuestions(prev => [...prev, {
      text: '',
      option_1: { text: '', tag: 1 },
      option_2: { text: '', tag: 2 },
      option_3: { text: '', tag: 3 },
      option_4: { text: '', tag: 4 },
      correctOption: 1,
    }]);
  };

  const addTheoryQuestion = () => {
    setTheoryQuestions(prev => [...prev, { text: '', correctAnswerText: '' }]);
  };

  const updateObjectiveQ = (idx: number, field: string, value: any) => {
    setObjectiveQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateObjectiveOption = (idx: number, optKey: string, text: string) => {
    setObjectiveQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [optKey]: { ...q[optKey as keyof ObjectiveQ] as any, text } } : q));
  };

  const removeObjectiveQ = (idx: number) => setObjectiveQuestions(prev => prev.filter((_, i) => i !== idx));

  const updateTheoryQ = (idx: number, field: string, value: string) => {
    setTheoryQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const removeTheoryQ = (idx: number) => setTheoryQuestions(prev => prev.filter((_, i) => i !== idx));

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
      setCreatedAssessmentId(assessment.id);

      // Backend auto-creates the objective/theory sub-assessment,
      // so just navigate to the assessment detail page to add questions
      toast({ title: 'Assessment created! Redirecting to add questions.' });
      navigate(`/supervisor/screening/${screeningId}/assessment/${assessment.id}`);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (!createdSubId) return;
    setCreating(true);
    try {
      if (type === AssessmentType.OBJECTIVE) {
        for (const q of objectiveQuestions) {
          await createObjectiveQuestion.mutateAsync({
            text: q.text,
            objective_assessment_id: createdSubId,
            option_1: q.option_1,
            option_2: q.option_2,
            option_3: q.option_3,
            option_4: q.option_4,
            correctOption: q.correctOption,
          });
        }
      } else {
        for (const q of theoryQuestions) {
          await createTheoryQuestion.mutateAsync({
            text: q.text,
            correctAnswerText: q.correctAnswerText,
            theory_assessment_id: createdSubId,
          });
        }
      }
      toast({ title: 'Questions saved!' });
      setStep(2);
    } catch (e: any) {
      toast({ title: 'Error saving questions', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!createdSubId) return;
    try {
      if (type === AssessmentType.OBJECTIVE) {
        await generateObjective.mutateAsync(createdSubId);
      } else if (screening) {
        await generateTheory.mutateAsync({ taId: createdSubId, mentorId: screening.mentor_id, n: 5 });
      }
    } catch {}
  };

  const handlePublish = async () => {
    if (!createdAssessmentId) return;
    setPublishing(true);
    try {
      await readyAssessment.mutateAsync(createdAssessmentId);
      toast({ title: 'Assessment published and ready!' });
      navigate(`/supervisor/screening/${screeningId}`);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const questionsCount = type === AssessmentType.OBJECTIVE ? objectiveQuestions.length : theoryQuestions.length;

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

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'
            }`}>
              {i < step ? <CheckCircle className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {/* Step 0 — Assessment Details */}
          {step === 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Assessment Configuration</CardTitle>
                <CardDescription>Define the assessment type, duration, and schedule.</CardDescription>
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
                    Create & Add Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1 — Question Builder */}
          {step === 1 && (
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Question Builder</CardTitle>
                      <CardDescription>
                        {type === AssessmentType.OBJECTIVE ? 'Add multiple-choice questions with 4 options each.' : 'Add theory questions with correct answers.'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleGenerateAI} disabled={generateObjective.isPending || generateTheory.isPending} className="gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        {(generateObjective.isPending || generateTheory.isPending) ? 'Generating...' : 'AI Generate'}
                      </Button>
                      <Button size="sm" onClick={type === AssessmentType.OBJECTIVE ? addObjectiveQuestion : addTheoryQuestion} className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> Add Question
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {type === AssessmentType.OBJECTIVE ? (
                    objectiveQuestions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No questions added. Click "Add Question" or use AI to generate.</p>
                    ) : (
                      objectiveQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">Q{idx + 1}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => removeObjectiveQ(idx)} className="text-destructive h-7 w-7 p-0">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Question</Label>
                            <Textarea value={q.text} onChange={e => updateObjectiveQ(idx, 'text', e.target.value)} placeholder="Enter question..." rows={2} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {(['option_1', 'option_2', 'option_3', 'option_4'] as const).map((optKey, optIdx) => (
                              <div key={optKey} className="space-y-1">
                                <Label className="text-xs flex items-center gap-1.5">
                                  Option {optIdx + 1}
                                  {q.correctOption === optIdx + 1 && <Badge className="bg-green-500/10 text-green-400 text-[9px] px-1">Correct</Badge>}
                                </Label>
                                <Input
                                  value={(q[optKey] as any).text}
                                  onChange={e => updateObjectiveOption(idx, optKey, e.target.value)}
                                  placeholder={`Option ${optIdx + 1}`}
                                  className="h-8 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Correct Option</Label>
                            <Select value={String(q.correctOption)} onValueChange={v => updateObjectiveQ(idx, 'correctOption', parseInt(v))}>
                              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Option 1</SelectItem>
                                <SelectItem value="2">Option 2</SelectItem>
                                <SelectItem value="3">Option 3</SelectItem>
                                <SelectItem value="4">Option 4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    theoryQuestions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No questions added. Click "Add Question" or use AI to generate.</p>
                    ) : (
                      theoryQuestions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">Q{idx + 1}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => removeTheoryQ(idx)} className="text-destructive h-7 w-7 p-0">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Question</Label>
                            <Textarea value={q.text} onChange={e => updateTheoryQ(idx, 'text', e.target.value)} placeholder="Enter question..." rows={2} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Correct Answer</Label>
                            <Textarea value={q.correctAnswerText} onChange={e => updateTheoryQ(idx, 'correctAnswerText', e.target.value)} placeholder="Expected answer..." rows={2} />
                          </div>
                        </div>
                      ))
                    )
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)} disabled>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button onClick={handleSaveQuestions} className="gradient-primary" disabled={creating || questionsCount === 0}>
                  {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                  Save Questions & Preview
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Preview & Publish */}
          {step === 2 && (
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Assessment Preview</CardTitle>
                  <CardDescription>Review your assessment before publishing to the mentor.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground text-xs">Title</p><p className="font-medium">{title}</p></div>
                    <div><p className="text-muted-foreground text-xs">Type</p><Badge variant="outline">{type}</Badge></div>
                    <div><p className="text-muted-foreground text-xs">Duration</p><p className="font-medium">{durationMinutes} minutes</p></div>
                    <div><p className="text-muted-foreground text-xs">Questions</p><p className="font-medium">{questionsCount}</p></div>
                    <div><p className="text-muted-foreground text-xs">Score per Question</p><p className="font-medium">{scorePerQuestion} pts</p></div>
                    <div><p className="text-muted-foreground text-xs">Total Marks</p><p className="font-medium">{questionsCount * parseInt(scorePerQuestion)} pts</p></div>
                    <div><p className="text-muted-foreground text-xs">Start</p><p className="font-medium">{startDateTime ? new Date(startDateTime).toLocaleString() : '—'}</p></div>
                    <div><p className="text-muted-foreground text-xs">End</p><p className="font-medium">{endDateTime ? new Date(endDateTime).toLocaleString() : '—'}</p></div>
                  </div>
                  {description && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Description</p>
                      <p className="text-sm">{description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Edit Questions
                </Button>
                <Button onClick={handlePublish} className="gradient-primary" disabled={publishing}>
                  {publishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Publish Assessment
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}