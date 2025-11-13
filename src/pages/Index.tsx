import { useEffect, useState } from 'react';
import { initBrowserFs, readDirRecursive, getFs, FileNode } from '@/lib/browserFs';
import { FileExplorer } from '@/components/FileExplorer';
import { CodeEditor } from '@/components/CodeEditor';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [isReady, setIsReady] = useState(false);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
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

  const handleFileCreate = (parentPath: string, name: string, isFolder: boolean) => {
    const fs = getFs();
    if (fs) {
      try {
        const fullPath = `${parentPath}/${name}`.replace('//', '/');
        if (isFolder) {
          fs.mkdirSync(fullPath);
        } else {
          fs.writeFileSync(fullPath, '', 'utf8');
          setSelectedFile(fullPath);
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
          // Recursive delete
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
        
        if (selectedFile === path) {
          setSelectedFile(null);
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
        
        if (selectedFile === oldPath) {
          setSelectedFile(newPath);
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
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <FileExplorer
          files={files}
          onFileSelect={setSelectedFile}
          onFileCreate={handleFileCreate}
          onFileDelete={handleFileDelete}
          onFileRename={handleFileRename}
          selectedFile={selectedFile}
        />
      </div>
      <div className="flex-1">
        <CodeEditor selectedFile={selectedFile} onClose={() => setSelectedFile(null)} />
      </div>
    </div>
  );
};

export default Index;
