import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle, XCircle, Code, FileText, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScreeningReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const screening = {
    id,
    title: 'React Developer Screening',
    mentor: 'John Doe',
    status: 'IN_PROGRESS',
    currentPhase: 2,
    assessmentPassed: true,
    assessmentScore: 85,
    codeInterviewPassed: false,
    codeInterviewScore: null,
    qBotPassed: false,
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{screening.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">Mentor: {screening.mentor}</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">Phase {screening.currentPhase}/4</Badge>
            </div>

            <div className="flex gap-6 mt-6">
              {[
                { label: 'Assessment', passed: screening.assessmentPassed, score: screening.assessmentScore },
                { label: 'Code Interview', passed: screening.codeInterviewPassed, score: screening.codeInterviewScore },
                { label: 'QBot Interview', passed: screening.qBotPassed, score: null },
                { label: 'Final Review', passed: false, score: null },
              ].map((phase, i) => (
                <div key={i} className="flex items-center gap-2">
                  {phase.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                  <div>
                    <p className="text-xs font-medium">{phase.label}</p>
                    {phase.score !== null && <p className="text-xs text-muted-foreground">{phase.score}%</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="assessment">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="assessment" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Assessment</TabsTrigger>
          <TabsTrigger value="code" className="gap-1.5"><Code className="h-3.5 w-3.5" /> Code Review</TabsTrigger>
          <TabsTrigger value="qbot" className="gap-1.5"><Bot className="h-3.5 w-3.5" /> QBot</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm">Assessment Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { q: 'What is React\'s virtual DOM?', answer: 'Correct', score: 10 },
                  { q: 'Explain the useEffect hook lifecycle', answer: 'Correct', score: 10 },
                  { q: 'What is the difference between state and props?', answer: 'Correct', score: 10 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <p className="text-sm">{item.q}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{item.answer}</Badge>
                      <span className="text-xs text-muted-foreground">{item.score} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <Card className="glass-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Code className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Code submissions will open in the text editor workspace for review.</p>
              <Button className="mt-4 gradient-primary">Open Code Editor</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qbot" className="mt-4">
          <Card className="glass-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">QBot interview has not been completed yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
          <XCircle className="h-4 w-4 mr-2" /> Reject Mentor
        </Button>
        <Button className="gradient-primary">
          <CheckCircle className="h-4 w-4 mr-2" /> Approve Mentor
        </Button>
      </div>
    </div>
  );
}
