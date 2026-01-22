import { useEffect, useState } from 'react';
import { initBrowserFs, readDirRecursive, getFs, FileNode } from '@/lib/browserFs';
import { FileExplorer } from '@/components/FileExplorer';
import { CodeEditor } from '@/components/CodeEditor';
import { Toolbar } from '@/components/Toolbar';
import { Terminal } from '@/components/Terminal';
import { FileSearch } from '@/components/FileSearch';
import { runCode } from '@/lib/codeRunner';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Bot, X } from 'lucide-react';
import { exportWorkspaceAsZip, importZipFromUrl } from '@/lib/zipHelpers';
import { clearWorkspace } from '@/lib/workspaceHelpers';
import { Button } from '@/components/ui/button';
import { AIFileChat } from '@/components/AIFileChat';

interface CodeWorkspaceProps {
  zipUrl?: string;
  submitUrl: string;
  enableAIChat?: boolean;
  aiEndpoint?: string;
  editable?: boolean;
}

export const CodeWorkspace = ({ 
  zipUrl, 
  submitUrl, 
  enableAIChat = false,
  aiEndpoint = '',
  editable = true 
}: CodeWorkspaceProps) => {
  const [isReady, setIsReady] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set());
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initBrowserFs()
      .then(async () => {
        // Load zip file if zipUrl prop is provided
        if (zipUrl) {
          try {
            await clearWorkspace();
            const result = await importZipFromUrl(zipUrl);
            toast({
              title: 'Workspace loaded',
              description: `Imported ${result.imported} files (${result.skipped} skipped)`,
            });
          } catch (error) {
            console.error('Failed to load zip:', error);
            toast({
              title: 'Error',
              description: 'Failed to load project from URL',
              variant: 'destructive',
            });
          }
        }
        
        setIsReady(true);
        refreshFiles();
      })
      .catch((error) => {
        console.error('Failed to initialize filesystem:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize filesystem',
          variant: 'destructive',
        });
      });
  }, [toast, zipUrl]);

  const refreshFiles = () => {
    const fs = getFs();
    if (fs) {
      const tree = readDirRecursive(fs, '/workspace');
      setFiles(tree);
    }
  };

  const handleFileSelect = (path: string) => {
    if (!openFiles.includes(path)) {
      setOpenFiles([...openFiles, path]);
    }
    setSelectedFile(path);
  };

  const handleFileClose = (path: string) => {
    const newOpenFiles = openFiles.filter(f => f !== path);
    setOpenFiles(newOpenFiles);
    
    const newUnsavedFiles = new Set(unsavedFiles);
    newUnsavedFiles.delete(path);
    setUnsavedFiles(newUnsavedFiles);

    if (selectedFile === path) {
      if (newOpenFiles.length > 0) {
        setSelectedFile(newOpenFiles[newOpenFiles.length - 1]);
      } else {
        setSelectedFile(null);
      }
    }
  };

  const handleUnsavedChange = (path: string, hasChanges: boolean) => {
    const newUnsavedFiles = new Set(unsavedFiles);
    if (hasChanges) {
      newUnsavedFiles.add(path);
    } else {
      newUnsavedFiles.delete(path);
    }
    setUnsavedFiles(newUnsavedFiles);
  };

  const handleAICodeUpdate = (path: string, code: string) => {
    const fs = getFs();
    if (fs) {
      try {
        fs.writeFileSync(path, code, 'utf8');
        handleUnsavedChange(path, false);
        toast({
          title: 'Code updated',
          description: 'AI changes applied to file',
        });
      } catch (e) {
        console.error('Error updating file:', e);
        toast({
          title: 'Error',
          description: 'Failed to update file',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileCreate = (parentPath: string, name: string, isFolder: boolean) => {
    const fs = getFs();
    if (!fs) {
      toast({
        title: 'Error',
        description: 'File system not initialized',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const fullPath = `${parentPath}/${name}`.replace('//', '/');
      
      if (isFolder) {
        fs.mkdirSync(fullPath);
      } else {
        // Ensure parent directory exists
        const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'));
        if (parentDir && !fs.existsSync(parentDir)) {
          // Create parent directories recursively
          const parts = parentDir.split('/').filter(p => p);
          let currentPath = '';
          for (const part of parts) {
            currentPath += '/' + part;
            if (!fs.existsSync(currentPath)) {
              fs.mkdirSync(currentPath);
            }
          }
        }
        
        fs.writeFileSync(fullPath, '', 'utf8');
        // Add to open files and select it
        setOpenFiles(prev => [...prev, fullPath]);
        setSelectedFile(fullPath);
      }
      
      refreshFiles();
      toast({
        title: 'Created',
        description: `${isFolder ? 'Folder' : 'File'} "${name}" created`,
      });
    } catch (error) {
      console.error('Create error:', error);
      toast({
        title: 'Error',
        description: `Failed to create ${isFolder ? 'folder' : 'file'}`,
        variant: 'destructive',
      });
    }
  };

  const handleFileDelete = (path: string) => {
    const fs = getFs();
    if (!fs) {
      toast({
        title: 'Error',
        description: 'File system not initialized',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const stat = fs.statSync(path);
      
      if (stat.isDirectory()) {
        // Delete directory recursively
        const deleteDirRecursive = (dirPath: string) => {
          const items = fs.readdirSync(dirPath);
          for (const item of items) {
            const itemPath = `${dirPath}/${item}`.replace('//', '/');
            const itemStat = fs.statSync(itemPath);
            
            if (itemStat.isDirectory()) {
              deleteDirRecursive(itemPath);
            } else {
              fs.unlinkSync(itemPath);
              // Close file if it's open
              if (openFiles.includes(itemPath)) {
                handleFileClose(itemPath);
              }
            }
          }
          fs.rmdirSync(dirPath);
        };
        deleteDirRecursive(path);
      } else {
        fs.unlinkSync(path);
        // Close file if it's open
        if (openFiles.includes(path)) {
          handleFileClose(path);
        }
      }
      
      refreshFiles();
      toast({
        title: 'Deleted',
        description: `Successfully deleted ${stat.isDirectory() ? 'folder' : 'file'}`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete',
        variant: 'destructive',
      });
    }
  };

  const handleFileRename = (oldPath: string, newName: string) => {
    const fs = getFs();
    if (!fs) {
      toast({
        title: 'Error',
        description: 'File system not initialized',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
      const newPath = `${parentPath}/${newName}`.replace('//', '/');
      
      // Check if target already exists
      if (fs.existsSync(newPath)) {
        toast({
          title: 'Error',
          description: 'A file or folder with that name already exists',
          variant: 'destructive',
        });
        return;
      }
      
      // Read old content and write to new path
      const stat = fs.statSync(oldPath);
      if (stat.isDirectory()) {
        // For directories, manually copy all contents
        const copyDirRecursive = (src: string, dest: string) => {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
          }
          const items = fs.readdirSync(src);
          for (const item of items) {
            const srcPath = `${src}/${item}`.replace('//', '/');
            const destPath = `${dest}/${item}`.replace('//', '/');
            const itemStat = fs.statSync(srcPath);
            
            if (itemStat.isDirectory()) {
              copyDirRecursive(srcPath, destPath);
            } else {
              const content = fs.readFileSync(srcPath);
              fs.writeFileSync(destPath, content);
            }
          }
        };
        
        copyDirRecursive(oldPath, newPath);
        
        // Delete old directory
        const deleteDirRecursive = (dirPath: string) => {
          const items = fs.readdirSync(dirPath);
          for (const item of items) {
            const itemPath = `${dirPath}/${item}`.replace('//', '/');
            const itemStat = fs.statSync(itemPath);
            if (itemStat.isDirectory()) {
              deleteDirRecursive(itemPath);
            } else {
              fs.unlinkSync(itemPath);
            }
          }
          fs.rmdirSync(dirPath);
        };
        deleteDirRecursive(oldPath);
      } else {
        // For files, copy content and delete old
        const content = fs.readFileSync(oldPath);
        fs.writeFileSync(newPath, content);
        fs.unlinkSync(oldPath);
      }
      
      // Update open files if renamed file was open
      if (openFiles.includes(oldPath)) {
        const newOpenFiles = openFiles.map(f => f === oldPath ? newPath : f);
        setOpenFiles(newOpenFiles);
        
        if (selectedFile === oldPath) {
          setSelectedFile(newPath);
        }
        
        // Update unsaved files tracking
        if (unsavedFiles.has(oldPath)) {
          const newUnsavedFiles = new Set(unsavedFiles);
          newUnsavedFiles.delete(oldPath);
          newUnsavedFiles.add(newPath);
          setUnsavedFiles(newUnsavedFiles);
        }
      }
      
      refreshFiles();
      toast({
        title: 'Renamed',
        description: `Successfully renamed to "${newName}"`,
      });
    } catch (error) {
      console.error('Rename error:', error);
      toast({
        title: 'Error',
        description: 'Failed to rename',
        variant: 'destructive',
      });
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowTerminal(true);
    
    try {
      const fs = getFs();
      if (!fs) throw new Error('Filesystem not initialized');
      
      // Run the entire project (codeRunner handles zipping)
      await runCode(selectedFile || '/workspace');
    } catch (error) {
      console.error('Run error:', error);
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
      // Zip the entire workspace
      const zipBlob = await exportWorkspaceAsZip();
      
      const formData = new FormData();
      formData.append('project', zipBlob, 'project.zip');
      
      const response = await fetch(submitUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Submit failed');
      
      const result = await response.json();
      
      toast({
        title: 'Submitted',
        description: result.message || 'Project submitted successfully',
      });
      
      // Clear workspace after successful submit
      await clearWorkspace();
      refreshFiles();
      setOpenFiles([]);
      setSelectedFile(null);
      
      toast({
        title: 'Workspace cleared',
        description: 'Ready for new project',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit project',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <div className="flex items-center justify-between">
        <Toolbar 
          onRefresh={refreshFiles}
          onRun={handleRun}
          onToggleTerminal={() => setShowTerminal(!showTerminal)}
          onToggleSearch={() => setShowSearch(!showSearch)}
        />
        <div className="px-4 flex gap-2">
          {enableAIChat && aiEndpoint && selectedFile && (
            <Button
              onClick={() => setShowAIChat(!showAIChat)}
              variant={showAIChat ? "secondary" : "outline"}
              size="sm"
              className="gap-2"
            >
              {showAIChat ? <X className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              {showAIChat ? 'Close AI' : 'AI Assistant'}
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Project'}
          </Button>
        </div>
      </div>
      
      {showSearch && (
        <div className="border-b">
          <FileSearch 
            onClose={() => setShowSearch(false)}
            onFileSelect={handleFileSelect} 
          />
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r overflow-y-auto bg-muted/30">
          <FileExplorer 
            files={files}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            selectedFile={selectedFile}
          />
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`flex-1 overflow-hidden`}>
              <CodeEditor 
                openFiles={openFiles}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                onFileClose={handleFileClose}
                onUnsavedChange={handleUnsavedChange}
                unsavedFiles={unsavedFiles}
                editable={editable}
              />
            </div>
            
            {showTerminal && (
              <div className="h-1/2 border-t">
                <Terminal 
                  isRunning={isRunning}
                  onClose={() => setShowTerminal(false)}
                  onRun={handleRun}
                  onRefreshFiles={refreshFiles}
                />
              </div>
            )}
          </div>
          
          {enableAIChat && aiEndpoint && selectedFile && showAIChat && (
            <div className="w-80 overflow-hidden">
              <AIFileChat
                selectedFile={selectedFile}
                onCodeUpdate={handleAICodeUpdate}
                aiEndpoint={aiEndpoint}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
