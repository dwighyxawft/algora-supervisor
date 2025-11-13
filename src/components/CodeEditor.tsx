import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { getFs } from '@/lib/browserFs';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  selectedFile: string | null;
  onClose: () => void;
}

export function CodeEditor({ selectedFile, onClose }: CodeEditorProps) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedFile) {
      const fs = getFs();
      if (fs) {
        try {
          const fileContent = fs.readFileSync(selectedFile, 'utf8');
          setContent(fileContent);
          setHasUnsavedChanges(false);
          
          // Determine language from file extension
          const ext = selectedFile.split('.').pop()?.toLowerCase();
          const langMap: Record<string, string> = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            py: 'python',
            html: 'html',
            css: 'css',
            json: 'json',
            md: 'markdown',
            sql: 'sql',
            rs: 'rust',
            go: 'go',
            php: 'php',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
          };
          setLanguage(langMap[ext || ''] || 'plaintext');
        } catch (e) {
          console.error('Error reading file:', e);
          toast({
            title: 'Error',
            description: 'Failed to read file',
            variant: 'destructive',
          });
        }
      }
    }
  }, [selectedFile, toast]);

  const handleSave = () => {
    if (selectedFile) {
      const fs = getFs();
      if (fs) {
        try {
          fs.writeFileSync(selectedFile, content, 'utf8');
          setHasUnsavedChanges(false);
          toast({
            title: 'Saved',
            description: `${selectedFile.split('/').pop()} saved successfully`,
          });
        } catch (e) {
          console.error('Error saving file:', e);
          toast({
            title: 'Error',
            description: 'Failed to save file',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handleChange = (value: string | undefined) => {
    setContent(value || '');
    setHasUnsavedChanges(true);
  };

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, hasUnsavedChanges]);

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full bg-editor-background text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-editor-background">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-toolbar-background">
        <div className="flex items-center gap-2">
          <span className="text-sm">{selectedFile.split('/').pop()}</span>
          {hasUnsavedChanges && <span className="text-xs text-accent">●</span>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleSave}
            title="Save (Auto-saves after 2s)"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
