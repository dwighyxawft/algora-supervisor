import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, X, Bot } from 'lucide-react';
import { getFs } from '@/lib/browserFs';

interface AIFileChatProps {
  selectedFile: string | null;
  onCodeUpdate: (path: string, code: string) => void;
  aiEndpoint: string;
}

export function AIFileChat({ selectedFile, onCodeUpdate, aiEndpoint }: AIFileChatProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (selectedFile) {
      const fs = getFs();
      if (fs) {
        try {
          const content = fs.readFileSync(selectedFile, 'utf8');
          setFileContent(content);
        } catch (e) {
          console.error('Error reading file:', e);
        }
      }
    }
  }, [selectedFile]);

  const handleSubmit = async () => {
    if (!prompt.trim() || !selectedFile) return;

    setIsLoading(true);
    try {
      const response = await fetch(aiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: selectedFile,
          fileContent,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.code) {
        onCodeUpdate(selectedFile, result.code);
        toast({
          title: 'Code updated',
          description: 'AI has generated new code for your file',
        });
        setPrompt('');
      } else {
        throw new Error('No code in response');
      }
    } catch (error: any) {
      console.error('AI error:', error);
      toast({
        title: 'AI request failed',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30 p-4">
        <div className="text-center text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a file to chat with AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-muted/30 border-l">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-toolbar-background">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">AI Assistant</span>
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
          {selectedFile.split('/').pop()}
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Ask AI to modify this file. The AI will analyze the current code and generate an updated version.
          </div>
          
          <Textarea
            placeholder="Example: Add error handling to this function..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none bg-background"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
          />

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to AI
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Ctrl/Cmd + Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
