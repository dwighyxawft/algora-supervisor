import { useState } from 'react';
import { CodeWorkspace } from '@/components/CodeWorkspace';
import { SingleFileEditor } from '@/components/SingleFileEditor';
import { Button } from '@/components/ui/button';
import { FileText, FolderTree } from 'lucide-react';

const Index = () => {
  const [mode, setMode] = useState<'single' | 'project' | null>(null);

  if (mode === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Choose Editor Mode</h1>
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
              onClick={() => setMode('project')}
              variant="outline"
              size="lg"
              className="flex flex-col gap-3 h-auto py-8 px-12"
            >
              <FolderTree className="h-12 w-12" />
              <span className="text-lg">Full Project Editor</span>
              <span className="text-sm text-muted-foreground">Work with multiple files and folders</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return mode === 'single' ? <SingleFileEditor /> : <CodeWorkspace />;
};

export default Index;
