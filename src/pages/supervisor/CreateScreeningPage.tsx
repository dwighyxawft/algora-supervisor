import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['Basic Info', 'Assessment', 'Code Challenge', 'Grading Rules'];

export default function CreateScreeningPage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [passCutoff, setPassCutoff] = useState('70');
  const [questions, setQuestions] = useState([{ text: '', type: 'OBJECTIVE' }]);
  const [tasks, setTasks] = useState([{ requirements: '' }]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({ title: 'Screening created', description: `"${title}" has been created successfully.` });
    navigate('/supervisor/screening');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Screening</h1>
        <p className="text-sm text-muted-foreground mt-1">Set up a new mentor screening test.</p>
      </div>

      {/* Step indicator */}
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
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pass Cutoff (%)</Label>
                    <Input type="number" value={passCutoff} onChange={e => setPassCutoff(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Assessment Questions</CardTitle>
                <CardDescription>Add theory and objective questions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((q, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <Input value={q.text} onChange={e => { const n = [...questions]; n[i].text = e.target.value; setQuestions(n); }} placeholder={`Question ${i + 1}`} />
                    </div>
                    <Select value={q.type} onValueChange={v => { const n = [...questions]; n[i].type = v; setQuestions(n); }}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OBJECTIVE">Objective</SelectItem>
                        <SelectItem value="THEORY">Theory</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, j) => j !== i))} disabled={questions.length === 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setQuestions([...questions, { text: '', type: 'OBJECTIVE' }])} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Question
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Code Challenge Tasks</CardTitle>
                <CardDescription>Define coding tasks for the screening.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.map((t, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Textarea
                        value={t.requirements}
                        onChange={e => { const n = [...tasks]; n[i].requirements = e.target.value; setTasks(n); }}
                        placeholder={`Task ${i + 1} requirements...`}
                        rows={3}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setTasks(tasks.filter((_, j) => j !== i))} disabled={tasks.length === 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setTasks([...tasks, { requirements: '' }])} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Task
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Grading Rules</CardTitle>
                <CardDescription>Configure auto-grading and passing criteria.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Score Per Question</Label>
                  <Input type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label>Auto-grade Objective Questions</Label>
                  <Select defaultValue="yes">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Require Manual Code Review</Label>
                  <Select defaultValue="yes">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
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
          <Button onClick={handleSubmit} className="gradient-primary">
            <CheckCircle className="h-4 w-4 mr-2" /> Create Screening
          </Button>
        )}
      </div>
    </div>
  );
}
