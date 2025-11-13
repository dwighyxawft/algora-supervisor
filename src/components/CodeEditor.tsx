import Editor, { OnMount } from '@monaco-editor/react';
import { useEffect, useState, useRef } from 'react';
import { getFs, readDirRecursive } from '@/lib/browserFs';
import { Save, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatCode } from '@/lib/formatter';
import { configureLinting, enableLinting, configureImportIntellisense } from '@/lib/linter';
import { EditorTabs } from '@/components/EditorTabs';

interface CodeEditorProps {
  openFiles: string[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onFileClose: (path: string) => void;
  unsavedFiles: Set<string>;
  onUnsavedChange: (path: string, hasChanges: boolean) => void;
}

export function CodeEditor({ 
  openFiles, 
  selectedFile, 
  onFileSelect, 
  onFileClose,
  unsavedFiles,
  onUnsavedChange 
}: CodeEditorProps) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isFormatting, setIsFormatting] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedFile) {
      const fs = getFs();
      if (fs) {
        try {
          const fileContent = fs.readFileSync(selectedFile, 'utf8');
          setContent(fileContent);
          onUnsavedChange(selectedFile, false);
          
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
          onUnsavedChange(selectedFile, false);
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
    if (selectedFile) {
      onUnsavedChange(selectedFile, true);
    }
  };

  const handleFormat = async () => {
    if (!selectedFile) return;
    
    setIsFormatting(true);
    try {
      const formatted = await formatCode(content, language);
      setContent(formatted);
      if (editorRef.current) {
        editorRef.current.setValue(formatted);
      }
      toast({
        title: 'Formatted',
        description: 'Code formatted successfully',
      });
    } catch (error) {
      console.error('Format error:', error);
      toast({
        title: 'Format failed',
        description: 'Failed to format code',
        variant: 'destructive',
      });
    } finally {
      setIsFormatting(false);
    }
  };

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (selectedFile && unsavedFiles.has(selectedFile)) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, selectedFile]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Configure linting
    configureLinting(monaco);
    enableLinting(editor, monaco);

    // Configure import intellisense
    const fs = getFs();
    if (fs) {
      const files = readDirRecursive(fs, '/workspace');
      configureImportIntellisense(monaco, files);
    }

    // Auto-format on save (Ctrl/Cmd + S)
    editor.addAction({
      id: 'format-and-save',
      label: 'Format and Save',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: async () => {
        await handleFormat();
        handleSave();
      },
    });
  };

  if (openFiles.length === 0) {
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
      <EditorTabs
        openFiles={openFiles}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
        onFileClose={onFileClose}
        unsavedFiles={unsavedFiles}
      />
      
      {selectedFile && (
        <>
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-toolbar-background">
            <div className="flex items-center gap-2">
              <span className="text-sm">{selectedFile.split('/').pop()}</span>
              {unsavedFiles.has(selectedFile) && <span className="text-xs text-accent">●</span>}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1"
                onClick={handleFormat}
                disabled={isFormatting}
                title="Format Code (Ctrl/Cmd+S formats and saves)"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Format
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1"
                onClick={handleSave}
                title="Save (Auto-saves after 2s)"
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={content}
              onChange={handleChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
