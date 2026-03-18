import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAssessment, useObjectiveQuestions, useTheoryQuestions,
  useCreateObjectiveQuestion, useUpdateObjectiveQuestion, useDeleteObjectiveQuestion,
  useGenerateObjectiveQuestion, useGenerateObjectiveQuestions,
  useCreateTheoryQuestion, useUpdateTheoryQuestion, useDeleteTheoryQuestion,
  useGenerateTheoryQuestion, useGenerateTheoryQuestions,
  useUpdateAssessment, useReadyAssessment,
} from '@/hooks/use-api';
import { AssessmentType, AssessmentStatus } from '@/lib/api/models';
import type { ObjectiveAssessmentQuestion, TheoryAssessmentQuestion } from '@/lib/api/models';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Plus, Trash2, Sparkles, Wand2, Loader2, CheckCircle, Edit2, Save, X,
  FileText, Settings, ListChecks, Rocket,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const OBJECTIVE_TARGET = 50;
const THEORY_TARGET = 30;

export default function AssessmentDetailPage() {
  const { screeningId, assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: assessment, isLoading, refetch } = useAssessment(assessmentId!);

  const isObjective = assessment?.type === AssessmentType.OBJECTIVE;
  const subId = isObjective ? assessment?.objective?.id : assessment?.theory?.id;

  const { data: objectiveQuestions, refetch: refetchOQ } = useObjectiveQuestions(isObjective ? (subId || '') : '');
  const { data: theoryQuestions, refetch: refetchTQ } = useTheoryQuestions(!isObjective ? (subId || '') : '');

  const questions = isObjective ? objectiveQuestions : theoryQuestions;
  const questionCount = questions?.length || 0;
  const targetCount = isObjective ? OBJECTIVE_TARGET : THEORY_TARGET;
  const progress = Math.min((questionCount / targetCount) * 100, 100);

  // Mutations
  const createOQ = useCreateObjectiveQuestion();
  const updateOQ = useUpdateObjectiveQuestion();
  const deleteOQ = useDeleteObjectiveQuestion();
  const genOneOQ = useGenerateObjectiveQuestion();
  const genManyOQ = useGenerateObjectiveQuestions();

  const createTQ = useCreateTheoryQuestion();
  const updateTQ = useUpdateTheoryQuestion();
  const deleteTQ = useDeleteTheoryQuestion();
  const genOneTQ = useGenerateTheoryQuestion();
  const genManyTQ = useGenerateTheoryQuestions();

  const updateAssessment = useUpdateAssessment();
  const readyAssessment = useReadyAssessment();

  // Edit assessment state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  // New question form state (objective)
  const [showNewOQ, setShowNewOQ] = useState(false);
  const [newOQText, setNewOQText] = useState('');
  const [newOQOpt1, setNewOQOpt1] = useState('');
  const [newOQOpt2, setNewOQOpt2] = useState('');
  const [newOQOpt3, setNewOQOpt3] = useState('');
  const [newOQOpt4, setNewOQOpt4] = useState('');
  const [newOQCorrect, setNewOQCorrect] = useState(1);

  // New question form state (theory)
  const [showNewTQ, setShowNewTQ] = useState(false);
  const [newTQText, setNewTQText] = useState('');
  const [newTQAnswer, setNewTQAnswer] = useState('');

  // Editing existing question
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [editQText, setEditQText] = useState('');
  const [editQOpt1, setEditQOpt1] = useState('');
  const [editQOpt2, setEditQOpt2] = useState('');
  const [editQOpt3, setEditQOpt3] = useState('');
  const [editQOpt4, setEditQOpt4] = useState('');
  const [editQCorrect, setEditQCorrect] = useState(1);
  const [editQAnswer, setEditQAnswer] = useState('');

  const refetchQuestions = () => { refetchOQ(); refetchTQ(); refetch(); };

  const startEditAssessment = () => {
    if (!assessment) return;
    setEditTitle(assessment.title);
    setEditDescription(assessment.description || '');
    setEditDuration(String(assessment.durationMinutes || ''));
    setEditStart(assessment.startDateTime ? new Date(assessment.startDateTime).toISOString().slice(0, 16) : '');
    setEditEnd(assessment.endDateTime ? new Date(assessment.endDateTime).toISOString().slice(0, 16) : '');
    setEditMode(true);
  };

  const handleSaveAssessment = async () => {
    if (!assessment) return;
    try {
      await updateAssessment.mutateAsync({
        id: assessment.id,
        data: {
          title: editTitle,
          description: editDescription,
          durationMinutes: parseInt(editDuration) || undefined,
          startDateTime: editStart ? new Date(editStart) : undefined,
          endDateTime: editEnd ? new Date(editEnd) : undefined,
        },
      });
      setEditMode(false);
      refetch();
    } catch {}
  };

  const handleAddObjectiveQ = async () => {
    if (!subId || !newOQText) return;
    try {
      await createOQ.mutateAsync({
        text: newOQText,
        objective_assessment_id: subId,
        option_1: { text: newOQOpt1, tag: 1 },
        option_2: { text: newOQOpt2, tag: 2 },
        option_3: { text: newOQOpt3, tag: 3 },
        option_4: { text: newOQOpt4, tag: 4 },
        correctOption: newOQCorrect,
      });
      setNewOQText(''); setNewOQOpt1(''); setNewOQOpt2(''); setNewOQOpt3(''); setNewOQOpt4(''); setNewOQCorrect(1);
      setShowNewOQ(false);
      refetchQuestions();
    } catch {}
  };

  const handleAddTheoryQ = async () => {
    if (!subId || !newTQText) return;
    try {
      await createTQ.mutateAsync({
        text: newTQText,
        correctAnswerText: newTQAnswer,
        theory_assessment_id: subId,
      });
      setNewTQText(''); setNewTQAnswer('');
      setShowNewTQ(false);
      refetchQuestions();
    } catch {}
  };

  const startEditQuestion = (q: ObjectiveAssessmentQuestion | TheoryAssessmentQuestion) => {
    setEditingQId(q.id);
    setEditQText(q.text);
    if (isObjective) {
      const oq = q as ObjectiveAssessmentQuestion;
      setEditQOpt1(oq.option_1.text);
      setEditQOpt2(oq.option_2.text);
      setEditQOpt3(oq.option_3.text);
      setEditQOpt4(oq.option_4.text);
      setEditQCorrect(oq.correctOption);
    } else {
      setEditQAnswer((q as TheoryAssessmentQuestion).correctAnswerText);
    }
  };

  const handleSaveQuestion = async () => {
    if (!editingQId) return;
    try {
      if (isObjective) {
        await updateOQ.mutateAsync({
          id: editingQId,
          data: {
            text: editQText,
            option_1: { text: editQOpt1, tag: 1 },
            option_2: { text: editQOpt2, tag: 2 },
            option_3: { text: editQOpt3, tag: 3 },
            option_4: { text: editQOpt4, tag: 4 },
            correctOption: editQCorrect,
          },
        });
      } else {
        await updateTQ.mutateAsync({
          id: editingQId,
          data: { text: editQText, correctAnswerText: editQAnswer },
        });
      }
      setEditingQId(null);
      refetchQuestions();
    } catch {}
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      if (isObjective) {
        await deleteOQ.mutateAsync(id);
      } else {
        await deleteTQ.mutateAsync(id);
      }
      refetchQuestions();
    } catch {}
  };

  const handleGenerateOne = async () => {
    if (!subId) return;
    try {
      if (isObjective) {
        await genOneOQ.mutateAsync(subId);
      } else {
        await genOneTQ.mutateAsync(subId);
      }
      refetchQuestions();
    } catch {}
  };

  const handleGenerateMany = async () => {
    if (!subId || !assessment) return;
    try {
      if (isObjective) {
        await genManyOQ.mutateAsync(subId);
      } else {
        await genManyTQ.mutateAsync({ taId: subId, mentorId: assessment.mentor_id || '', n: 10 });
      }
      refetchQuestions();
    } catch {}
  };

  const handlePublish = async () => {
    if (!assessment) return;
    try {
      await readyAssessment.mutateAsync(assessment.id);
      toast({ title: 'Assessment published and ready!' });
      refetch();
    } catch {}
  };

  const isGenerating = genOneOQ.isPending || genManyOQ.isPending || genOneTQ.isPending || genManyTQ.isPending;

  if (isLoading || !assessment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const statusBadgeClass = {
    [AssessmentStatus.PENDING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [AssessmentStatus.READY]: 'bg-green-500/10 text-green-400 border-green-500/20',
    [AssessmentStatus.NOT_STARTED]: 'bg-muted text-muted-foreground',
    [AssessmentStatus.IN_PROGRESS]: 'bg-primary/10 text-primary border-primary/20',
    [AssessmentStatus.COMPLETED]: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/supervisor/screening/${screeningId}`)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Screening
      </Button>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="details" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> Details</TabsTrigger>
          <TabsTrigger value="questions" className="gap-1.5"><ListChecks className="h-3.5 w-3.5" /> Questions ({questionCount}/{targetCount})</TabsTrigger>
        </TabsList>

        {/* ====== DETAILS TAB ====== */}
        <TabsContent value="details">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{assessment.title}</CardTitle>
                    <CardDescription>{assessment.type} Assessment · {assessment.durationMinutes}min</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusBadgeClass[assessment.status] || ''}>{assessment.status}</Badge>
                    {!editMode && assessment.status !== AssessmentStatus.COMPLETED && (
                      <Button size="sm" variant="outline" onClick={startEditAssessment} className="gap-1.5">
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (minutes)</Label>
                        <Input type="number" value={editDuration} onChange={e => setEditDuration(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date & Time</Label>
                        <Input type="datetime-local" value={editStart} onChange={e => setEditStart(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date & Time</Label>
                        <Input type="datetime-local" value={editEnd} onChange={e => setEditEnd(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setEditMode(false)} className="gap-1.5">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                      <Button onClick={handleSaveAssessment} disabled={updateAssessment.isPending} className="gap-1.5 gradient-primary">
                        {updateAssessment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assessment.description && <p className="text-sm text-muted-foreground">{assessment.description}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</p>
                        <p className="text-sm font-medium mt-0.5">{assessment.type}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</p>
                        <p className="text-sm font-medium mt-0.5">{assessment.durationMinutes}min</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Questions</p>
                        <p className="text-sm font-medium mt-0.5">{questionCount} / {targetCount}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score/Question</p>
                        <p className="text-sm font-medium mt-0.5">{isObjective ? assessment.objective?.scorePerQuestion : assessment.theory?.scorePerQuestion || '—'}</p>
                      </div>
                    </div>
                    {assessment.startDateTime && (
                      <div className="flex gap-6 text-xs text-muted-foreground">
                        <span>Start: {new Date(assessment.startDateTime).toLocaleString()}</span>
                        {assessment.endDateTime && <span>End: {new Date(assessment.endDateTime).toLocaleString()}</span>}
                      </div>
                    )}

                    {/* Progress & Publish */}
                    <div className="space-y-2 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Question completion: {questionCount}/{targetCount}</p>
                        <span className="text-xs font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      {assessment.status === AssessmentStatus.PENDING && questionCount >= targetCount && (
                        <div className="flex justify-end pt-2">
                          <Button onClick={handlePublish} disabled={readyAssessment.isPending} className="gap-1.5 gradient-primary">
                            {readyAssessment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
                            Publish Assessment
                          </Button>
                        </div>
                      )}
                      {assessment.status === AssessmentStatus.PENDING && questionCount < targetCount && (
                        <p className="text-xs text-amber-400">Need {targetCount - questionCount} more question(s) before publishing.</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ====== QUESTIONS TAB ====== */}
        <TabsContent value="questions">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Toolbar */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{isObjective ? 'Objective' : 'Theory'} Questions</p>
                    <p className="text-xs text-muted-foreground">{questionCount} of {targetCount} required questions created</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleGenerateOne} disabled={isGenerating} className="gap-1.5">
                      {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      AI: 1 Question
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleGenerateMany} disabled={isGenerating} className="gap-1.5">
                      {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      AI: Bulk Generate
                    </Button>
                    <Button size="sm" onClick={() => isObjective ? setShowNewOQ(true) : setShowNewTQ(true)} className="gap-1.5 gradient-primary">
                      <Plus className="h-3.5 w-3.5" /> Manual Add
                    </Button>
                  </div>
                </div>
                <Progress value={progress} className="h-1.5 mt-3" />
              </CardContent>
            </Card>

            {/* New Question Forms */}
            {showNewOQ && isObjective && (
              <Card className="glass-card border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">New Objective Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Question Text</Label>
                    <Textarea value={newOQText} onChange={e => setNewOQText(e.target.value)} placeholder="Enter question..." rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Option 1</Label>
                      <Input value={newOQOpt1} onChange={e => setNewOQOpt1(e.target.value)} placeholder="Option 1" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Option 2</Label>
                      <Input value={newOQOpt2} onChange={e => setNewOQOpt2(e.target.value)} placeholder="Option 2" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Option 3</Label>
                      <Input value={newOQOpt3} onChange={e => setNewOQOpt3(e.target.value)} placeholder="Option 3" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Option 4</Label>
                      <Input value={newOQOpt4} onChange={e => setNewOQOpt4(e.target.value)} placeholder="Option 4" className="h-8 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Correct Option</Label>
                    <Select value={String(newOQCorrect)} onValueChange={v => setNewOQCorrect(parseInt(v))}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Option 1</SelectItem>
                        <SelectItem value="2">Option 2</SelectItem>
                        <SelectItem value="3">Option 3</SelectItem>
                        <SelectItem value="4">Option 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setShowNewOQ(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleAddObjectiveQ} disabled={createOQ.isPending || !newOQText} className="gradient-primary">
                      {createOQ.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showNewTQ && !isObjective && (
              <Card className="glass-card border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">New Theory Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Question Text</Label>
                    <Textarea value={newTQText} onChange={e => setNewTQText(e.target.value)} placeholder="Enter question..." rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Correct Answer</Label>
                    <Textarea value={newTQAnswer} onChange={e => setNewTQAnswer(e.target.value)} placeholder="Enter correct answer..." rows={2} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setShowNewTQ(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleAddTheoryQ} disabled={createTQ.isPending || !newTQText} className="gradient-primary">
                      {createTQ.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question List */}
            {questions && questions.length > 0 ? (
              <div className="space-y-3">
                {questions.map((q: any, idx: number) => (
                  <Card key={q.id} className="glass-card">
                    <CardContent className="p-4">
                      {editingQId === q.id ? (
                        /* Editing mode */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">Q{idx + 1} — Editing</Badge>
                            <Button variant="ghost" size="sm" onClick={() => setEditingQId(null)} className="h-7 w-7 p-0">
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Question</Label>
                            <Textarea value={editQText} onChange={e => setEditQText(e.target.value)} rows={2} />
                          </div>
                          {isObjective ? (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Option 1</Label>
                                  <Input value={editQOpt1} onChange={e => setEditQOpt1(e.target.value)} className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Option 2</Label>
                                  <Input value={editQOpt2} onChange={e => setEditQOpt2(e.target.value)} className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Option 3</Label>
                                  <Input value={editQOpt3} onChange={e => setEditQOpt3(e.target.value)} className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Option 4</Label>
                                  <Input value={editQOpt4} onChange={e => setEditQOpt4(e.target.value)} className="h-8 text-sm" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Correct Option</Label>
                                <Select value={String(editQCorrect)} onValueChange={v => setEditQCorrect(parseInt(v))}>
                                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">Option 1</SelectItem>
                                    <SelectItem value="2">Option 2</SelectItem>
                                    <SelectItem value="3">Option 3</SelectItem>
                                    <SelectItem value="4">Option 4</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-2">
                              <Label className="text-xs">Correct Answer</Label>
                              <Textarea value={editQAnswer} onChange={e => setEditQAnswer(e.target.value)} rows={2} />
                            </div>
                          )}
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => setEditingQId(null)}>Cancel</Button>
                            <Button size="sm" onClick={handleSaveQuestion} disabled={updateOQ.isPending || updateTQ.isPending} className="gradient-primary gap-1.5">
                              {(updateOQ.isPending || updateTQ.isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View mode */
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px]">Q{idx + 1}</Badge>
                              </div>
                              <p className="text-sm font-medium">{q.text}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="sm" onClick={() => startEditQuestion(q)} className="h-7 w-7 p-0">
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q.id)} disabled={deleteOQ.isPending || deleteTQ.isPending} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          {isObjective && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {(['option_1', 'option_2', 'option_3', 'option_4'] as const).map((optKey, optIdx) => (
                                <div key={optKey} className={`text-xs p-2 rounded ${q.correctOption === optIdx + 1 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-muted/50 text-muted-foreground'}`}>
                                  {q[optKey]?.text || '—'}
                                </div>
                              ))}
                            </div>
                          )}
                          {!isObjective && (q as TheoryAssessmentQuestion).correctAnswerText && (
                            <div className="mt-2 p-2 rounded bg-green-500/10 text-xs text-green-400 flex items-start gap-1.5">
                              <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>{(q as TheoryAssessmentQuestion).correctAnswerText}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No questions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add questions manually or use AI to generate them.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
