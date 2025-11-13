import { useEffect, useState } from 'react';
import { initBrowserFs, readDirRecursive, getFs, FileNode } from '@/lib/browserFs';
import { FileExplorer } from '@/components/FileExplorer';
import { CodeEditor } from '@/components/CodeEditor';
import { Toolbar } from '@/components/Toolbar';
import { Terminal } from '@/components/Terminal';
import { FileSearch } from '@/components/FileSearch';
import { runCode } from '@/lib/codeRunner';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [isReady, setIsReady] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set());
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initBrowserFs()
      .then(() => {
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
  }, [toast]);

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

  const handleFileCreate = (parentPath: string, name: string, isFolder: boolean) => {
    const fs = getFs();
    if (fs) {
      try {
        const fullPath = `${parentPath}/${name}`.replace('//', '/');
        if (isFolder) {
          fs.mkdirSync(fullPath);
        } else {
          fs.writeFileSync(fullPath, '', 'utf8');
          handleFileSelect(fullPath);
        }
        refreshFiles();
        toast({
          title: 'Created',
          description: `${isFolder ? 'Folder' : 'File'} "${name}" created`,
        });
      } catch (e) {
        console.error('Error creating:', e);
        toast({
          title: 'Error',
          description: 'Failed to create item',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileDelete = (path: string) => {
    const fs = getFs();
    if (fs) {
      try {
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
          const deleteDir = (dirPath: string) => {
            const items = fs.readdirSync(dirPath);
            items.forEach((item: string) => {
              const itemPath = `${dirPath}/${item}`;
              const itemStat = fs.statSync(itemPath);
              if (itemStat.isDirectory()) {
                deleteDir(itemPath);
              } else {
                fs.unlinkSync(itemPath);
              }
            });
            fs.rmdirSync(dirPath);
          };
          deleteDir(path);
        } else {
          fs.unlinkSync(path);
        }
        
        if (openFiles.includes(path)) {
          handleFileClose(path);
        }
        
        refreshFiles();
        toast({
          title: 'Deleted',
          description: `${path.split('/').pop()} deleted`,
        });
      } catch (e) {
        console.error('Error deleting:', e);
        toast({
          title: 'Error',
          description: 'Failed to delete item',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileRename = (oldPath: string, newName: string) => {
    const fs = getFs();
    if (fs) {
      try {
        const dir = oldPath.substring(0, oldPath.lastIndexOf('/'));
        const newPath = `${dir}/${newName}`;
        fs.renameSync(oldPath, newPath);
        
        if (openFiles.includes(oldPath)) {
          const newOpenFiles = openFiles.map(f => f === oldPath ? newPath : f);
          setOpenFiles(newOpenFiles);
        }
        
        if (selectedFile === oldPath) {
          setSelectedFile(newPath);
        }

        if (unsavedFiles.has(oldPath)) {
          const newUnsavedFiles = new Set(unsavedFiles);
          newUnsavedFiles.delete(oldPath);
          newUnsavedFiles.add(newPath);
          setUnsavedFiles(newUnsavedFiles);
        }
        
        refreshFiles();
        toast({
          title: 'Renamed',
          description: `Renamed to ${newName}`,
        });
      } catch (e) {
        console.error('Error renaming:', e);
        toast({
          title: 'Error',
          description: 'Failed to rename item',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRun = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to run',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    setShowTerminal(true);
    
    try {
      await runCode(selectedFile);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Toolbar 
        onRefresh={refreshFiles}
        onRun={handleRun}
        onToggleTerminal={() => setShowTerminal(prev => !prev)}
        onToggleSearch={() => setShowSearch(prev => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        {showSearch && (
          <div className="w-80 flex-shrink-0">
            <FileSearch
              onClose={() => setShowSearch(false)}
              onFileSelect={handleFileSelect}
            />
          </div>
        )}
        <div className="w-64 flex-shrink-0 border-r border-border">
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileRename={handleFileRename}
            selectedFile={selectedFile}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={showTerminal ? 'h-2/3 border-b border-border' : 'flex-1'}>
            <CodeEditor
              openFiles={openFiles}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileClose={handleFileClose}
              unsavedFiles={unsavedFiles}
              onUnsavedChange={handleUnsavedChange}
            />
          </div>
          {showTerminal && (
            <div className="h-1/3">
              <Terminal
                onClose={() => setShowTerminal(false)}
                onRun={handleRun}
                isRunning={isRunning}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
