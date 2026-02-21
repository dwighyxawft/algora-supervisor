import { useState } from 'react';
import { CodeWorkspace } from '@/components/CodeWorkspace';
import { SingleFileEditor } from '@/components/SingleFileEditor';
import { Button } from '@/components/ui/button';
import { FileText, FolderTree, Layers } from 'lucide-react';
import { PROJECT_TEMPLATES } from '@/lib/projectTemplates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Index = () => {
  const [mode, setMode] = useState<'single' | 'project' | null>(null);
  const [templateZipUrl, setTemplateZipUrl] = useState<string | undefined>(undefined);

  const handleTemplateSelect = (zipUrl: string) => {
    setTemplateZipUrl(zipUrl);
    setMode('project');
  };

  if (mode === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col gap-8 items-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Editor Mode</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => setMode('single')}
              variant="outline"
              size="lg"
              className="flex flex-col gap-3 h-auto py-8 px-12"
            >
              <FileText className="h-12 w-12" />
              <span className="text-lg">Single File Editor</span>
              <span className="text-sm text-muted-foreground">Edit and run a single file</span>
            </Button>
            
            <Button
              onClick={() => { setTemplateZipUrl(undefined); setMode('project'); }}
              variant="outline"
              size="lg"
              className="flex flex-col gap-3 h-auto py-8 px-12"
            >
              <FolderTree className="h-12 w-12" />
              <span className="text-lg">Empty Project</span>
              <span className="text-sm text-muted-foreground">Start with an empty workspace</span>
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Layers className="h-4 w-4" />
              <span>Or start from a base structure</span>
            </div>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select a project template..." />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {PROJECT_TEMPLATES.map((t) => (
                  <SelectItem key={t.name} value={t.zipUrl}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return mode === 'single' ? (
    <SingleFileEditor 
      submitUrl={import.meta.env.VITE_SINGLE_SUBMIT_URL || 'http://localhost:3000/api/submit-single'}
      runUrl={import.meta.env.VITE_SINGLE_RUN_URL || 'http://localhost:3000/api/run-single'}
      editable={true}
    />
  ) : (
    <CodeWorkspace 
      submitUrl={import.meta.env.VITE_PROJECT_SUBMIT_URL || 'http://localhost:3000/api/submit-project'}
      zipUrl={templateZipUrl || import.meta.env.VITE_AUTO_LOAD_ZIP_URL}
      enableAIChat={true}
      aiEndpoint={import.meta.env.VITE_AI_ENDPOINT || 'http://localhost:3000/api/ai-code'}
      editable={true}
    />
  );
};

export default Index;
