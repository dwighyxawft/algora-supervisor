import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface EditorTabsProps {
  openFiles: string[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onFileClose: (path: string) => void;
  unsavedFiles: Set<string>;
}

export function EditorTabs({ openFiles, selectedFile, onFileSelect, onFileClose, unsavedFiles }: EditorTabsProps) {
  if (openFiles.length === 0) return null;

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  const handleClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    onFileClose(path);
  };

  return (
    <div className="border-b border-border bg-toolbar-background">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex">
          {openFiles.map((file) => (
            <button
              key={file}
              onClick={() => onFileSelect(file)}
              className={cn(
                'group flex items-center gap-2 px-4 py-2 text-sm border-r border-border transition-colors',
                'hover:bg-accent/10',
                selectedFile === file
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <span className="flex items-center gap-1">
                {getFileName(file)}
                {unsavedFiles.has(file) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleClose(e, file)}
                className="h-4 w-4 p-0 hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
