import Editor from '@monaco-editor/react';
import { useState, useRef, useEffect } from 'react';
import { Save, Play, Upload, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SingleFileEditorProps {
  fileUrl?: string;
  submitUrl: string;
  runUrl?: string;
}

export function SingleFileEditor({ fileUrl, submitUrl, runUrl }: SingleFileEditorProps) {
  const [content, setContent] = useState('// Start coding here...\n\nconsole.log("Hello, World!");');
  const [fileName, setFileName] = useState('script.js');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const RUN_URL = runUrl || import.meta.env.VITE_SINGLE_RUN_URL || 'http://localhost:3000/api/run-single';

  useEffect(() => {
    if (fileUrl) {
      fetch(fileUrl)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          const urlFileName = fileUrl.split('/').pop() || 'script.js';
          setFileName(urlFileName);
          
          const ext = urlFileName.split('.').pop()?.toLowerCase();
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
          };
          setLanguage(langMap[ext || ''] || 'plaintext');
          
          toast({
            title: 'File loaded',
            description: `${urlFileName} loaded from URL`,
          });
        })
        .catch(error => {
          console.error('Failed to load file:', error);
          toast({
            title: 'Error',
            description: 'Failed to load file from URL',
            variant: 'destructive',
          });
        });
    }
  }, [fileUrl, toast]);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setContent(text);
      setFileName(file.name);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
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
      };
      setLanguage(langMap[ext || ''] || 'plaintext');
      
      toast({
        title: 'File imported',
        description: `${file.name} loaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import file',
        variant: 'destructive',
      });
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', blob, fileName);
      
      const response = await fetch(RUN_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Run failed');
      
      const result = await response.json();
      toast({
        title: 'Execution completed',
        description: result.message || 'Code executed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to run code',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', blob, fileName);
      
      const response = await fetch(submitUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Submit failed');
      
      const result = await response.json();
      toast({
        title: 'Submitted',
        description: result.message || 'File submitted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit file',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.json,.md,.txt"
      />
      
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-sidebar">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{fileName}</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import File
          </Button>
          
          <Button
            onClick={handleRun}
            variant="outline"
            size="sm"
            disabled={isRunning}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          
          <Button
            onClick={handleSubmit}
            variant="default"
            size="sm"
            disabled={isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          value={content}
          onChange={(value) => setContent(value || '')}
          language={language}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
}
